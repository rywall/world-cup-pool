/* Isabel vs James — secret side pool.
   Same scoring rules as the family pool, but each side has only 4 teams and
   only matches from the quarterfinals onward count. */

const REFRESH_MS = 60 * 1000;

const SIDE_POOL = [
  { name: 'Isabel', emoji: '🦄', teams: ['France', 'Belgium', 'Norway', 'Argentina'] },
  { name: 'James', emoji: '🦁', teams: ['Morocco', 'Spain', 'England', 'Switzerland'] },
];

const RULES = { pointsPerWin: 3, pointsPerDraw: 1, pointsPerCleanSheet: 1 };

// Only these rounds score points in the side pool.
const COUNTED_ROUNDS = new Set(['quarterfinals', 'semifinals', '3rd-place-match', 'final']);

let games = [];
let dataNote = '';
const teamsByName = new Map(TEAMS.map((t) => [t.name, t]));
let firstRender = true;

const LOADER_MSGS = [
  'Inflating the match ball…',
  'Mowing the pitch…',
  'Keeping it secret…',
  'Consulting VAR…',
];
let loaderMsgIdx = 0;
const loaderTimer = setInterval(() => {
  loaderMsgIdx++;
  document.querySelectorAll('.loader-text').forEach((el, i) => {
    el.textContent = LOADER_MSGS[(loaderMsgIdx + i) % LOADER_MSGS.length];
  });
}, 1500);

// ---------- data loading (same ESPN feed + cache as the main page) ----------

const FEED =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard' +
  '?dates=20260611-20260719&limit=300';
const CACHE_KEY = 'wcpool_espn_v1';

function normalize(events) {
  return events.map((e) => {
    const comp = e.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === 'home');
    const away = comp.competitors.find((c) => c.homeAway === 'away');
    return {
      id: e.id,
      home: { name: home.team.displayName, score: +(home.score || 0), winner: home.winner === true },
      away: { name: away.team.displayName, score: +(away.score || 0), winner: away.winner === true },
      state: e.status.type.state, // 'pre' | 'in' | 'post'
      clock: e.status.displayClock,
      round: e.season.slug,
      date: new Date(e.date),
    };
  });
}

function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function loadData() {
  try {
    const res = await fetchWithTimeout(FEED, 12000);
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.events) || !data.events.length) throw new Error('empty feed');
    games = normalize(data.events);
    dataNote = '';
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ events: data.events, savedAt: Date.now() }));
    } catch (_) { /* private mode / quota — fine */ }
  } catch (_) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) throw new Error('score feed unavailable');
    const { events, savedAt } = JSON.parse(cached);
    games = normalize(events);
    dataNote = ` · ⚠️ feed unreachable, showing scores from ${new Date(savedAt).toLocaleString()}`;
  }
}

const isFinished = (g) => g.state === 'post';
const isLive = (g) => g.state === 'in';
const hasTeams = (g) => teamsByName.has(g.home.name) && teamsByName.has(g.away.name);
const isCounted = (g) => COUNTED_ROUNDS.has(g.round);

function liveTeamSet() {
  const s = new Set();
  for (const g of games) {
    if (isLive(g) && hasTeams(g)) {
      s.add(g.home.name);
      s.add(g.away.name);
    }
  }
  return s;
}

// ---------- scoring ----------

// Same as the main page: once the round-of-32 draw is fully known, any team
// outside it was knocked out in the group stage.
function knockoutFieldSet() {
  const r32 = games.filter((g) => g.round === 'round-of-32');
  if (!r32.length || !r32.every(hasTeams)) return null;
  const field = new Set();
  for (const g of r32) {
    field.add(g.home.name);
    field.add(g.away.name);
  }
  return field;
}

// Points come only from COUNTED_ROUNDS, but elimination is tracked across the
// whole tournament so teams that never reach the quarterfinals grey out too.
function teamStats(teamName) {
  const s = { w: 0, d: 0, l: 0, cs: 0, gf: 0, ga: 0, played: 0, eliminated: false };
  for (const g of games) {
    if (!hasTeams(g) || !isFinished(g)) continue;
    const us = g.home.name === teamName ? g.home : g.away.name === teamName ? g.away : null;
    if (!us) continue;
    const them = us === g.home ? g.away : g.home;
    if (g.round !== 'group-stage' && g.round !== '3rd-place-match' && them.winner) s.eliminated = true;
    if (!isCounted(g)) continue;
    s.played++;
    s.gf += us.score;
    s.ga += them.score;
    if (them.score === 0) s.cs++;
    // Shootout winners carry the winner flag, so they score as wins/losses.
    if (us.score > them.score || (us.score === them.score && us.winner)) s.w++;
    else if (us.score < them.score || them.winner) s.l++;
    else s.d++;
  }
  const field = knockoutFieldSet();
  if (field && !field.has(teamName)) s.eliminated = true;
  s.pts = s.w * RULES.pointsPerWin + s.d * RULES.pointsPerDraw + s.cs * RULES.pointsPerCleanSheet;
  return s;
}

function scorePerson(person) {
  const teamRows = [];
  let total = 0, gf = 0, gd = 0, w = 0, d = 0, cs = 0;
  for (const name of person.teams) {
    const team = teamsByName.get(name);
    const s = teamStats(name);
    teamRows.push({ team, stats: s });
    total += s.pts;
    gf += s.gf;
    gd += s.gf - s.ga;
    w += s.w; d += s.d; cs += s.cs;
  }
  return { person, teamRows, total, gf, gd, w, d, cs };
}

function teamOwner(teamName) {
  return SIDE_POOL.find((p) => p.teams.includes(teamName)) || null;
}

// ---------- rendering ----------

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function flagImg(teamName, size = 24) {
  const team = teamsByName.get(teamName);
  return team ? `<img src="${esc(team.flag)}" width="${size}" alt="" loading="lazy">` : '';
}

// Who's ahead on points, then the usual tiebreakers; null when dead even.
function leaderName(rows) {
  const [a, b] = rows;
  const cmp = b.total - a.total || b.gf - a.gf || b.gd - a.gd;
  if (cmp === 0) return null;
  return cmp > 0 ? b.person.name : a.person.name;
}

function renderVersus() {
  const rows = SIDE_POOL.map(scorePerson);
  const leader = leaderName(rows);
  const liveSet = liveTeamSet();

  const sideHtml = (r) => {
    const isLeader = leader === r.person.name;
    const teamsHtml = r.teamRows
      .map(({ team, stats }) => {
        const live = liveSet.has(team.name) ? ' <span class="live-dot">●</span>' : '';
        return `
          <div class="pick-team ${stats.eliminated ? 'out' : ''}">
            ${flagImg(team.name, 22)}
            <span class="tname">${esc(team.name)}${live}
              <span class="record">${stats.w}W-${stats.d}D-${stats.l}L · ${stats.cs}CS</span>
            </span>
            <span class="tpts">${stats.pts}</span>
          </div>`;
      })
      .join('');
    return `
      <div class="vs-side${isLeader ? ' leading' : ''}">
        <div class="vs-name">${r.person.emoji} ${esc(r.person.name)}${isLeader ? ' 👑' : ''}</div>
        <div class="vs-total">${r.total}<span class="pts-label">pts</span></div>
        <div class="vs-breakdown"><b>${r.w}</b> wins · <b>${r.d}</b> draws · <b>${r.cs}</b> clean sheets</div>
        <div class="vs-breakdown">tiebreaks: <b>${r.gf}</b> goals for · <b>${r.gd >= 0 ? '+' : ''}${r.gd}</b> goal diff</div>
        <div class="vs-teams">${teamsHtml}</div>
      </div>`;
  };

  document.getElementById('versus').innerHTML = `
    <div class="vs-grid${firstRender ? ' animate-in' : ''}">
      ${sideHtml(rows[0])}
      <div class="vs-badge">VS</div>
      ${sideHtml(rows[1])}
    </div>
    ${leader === null ? '<p class="vs-tied">All square — dead even on points and tiebreakers! 🤝</p>' : ''}`;
}

const ROUND_NAMES = {
  quarterfinals: 'Quarterfinal',
  semifinals: 'Semifinal',
  '3rd-place-match': '3rd Place',
  final: 'FINAL 🏆',
};

function renderMatches() {
  const list = games.filter(isCounted).sort((a, b) => a.date - b.date);

  if (!list.length) {
    document.getElementById('matches').innerHTML =
      '<p class="hint">No quarterfinal matchups yet — the side pool kicks off once the bracket reaches the final eight! ⚽</p>';
    return;
  }

  let html = '';
  let lastDay = '';
  let rowIdx = 0;
  for (const g of list) {
    const dayLabel = g.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    if (dayLabel !== lastDay) {
      html += `<div class="date-head">${dayLabel}</div>`;
      lastDay = dayLabel;
    }

    let score, scoreClass;
    if (isFinished(g)) { score = `${g.home.score} – ${g.away.score}`; scoreClass = ''; }
    else if (isLive(g)) { score = `${g.home.score} – ${g.away.score}`; scoreClass = 'live'; }
    else { score = g.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); scoreClass = 'upcoming'; }

    const side = (t, cls) => {
      const owner = teamOwner(t.name);
      const chip = owner ? `<span class="owner-chip">${owner.emoji} ${esc(owner.name)}</span>` : '';
      return `<div class="match-team ${cls}${owner ? ' picked-any' : ''}">${
        cls === 'home' ? `${chip}${esc(t.name)} ${flagImg(t.name)}` : `${flagImg(t.name)} ${esc(t.name)}${chip}`
      }</div>`;
    };

    html += `
      <div class="match-item">
        <div class="match-row" style="animation-delay:${Math.min(rowIdx++ * 50, 700)}ms">
          ${side(g.home, 'home')}
          <div class="match-score ${scoreClass}">${esc(score)}</div>
          ${side(g.away, '')}
          <div class="match-meta">${esc(ROUND_NAMES[g.round] || g.round)}</div>
        </div>
      </div>`;
  }
  const matchesEl = document.getElementById('matches');
  matchesEl.classList.toggle('animate-in', firstRender);
  matchesEl.innerHTML = html;
}

function renderAll() {
  renderVersus();
  renderMatches();
  document.getElementById('updateStatus').textContent =
    `Live scores · updated ${new Date().toLocaleTimeString()} · auto-refreshes every minute${dataNote}`;
  if (firstRender) {
    firstRender = false;
    clearInterval(loaderTimer);
  }
}

// ---------- boot ----------

async function refresh() {
  const minLoader = firstRender ? new Promise((r) => setTimeout(r, 2000)) : null;
  try {
    await loadData();
    if (minLoader) await minLoader;
    renderAll();
  } catch (err) {
    if (minLoader) await minLoader;
    document.getElementById('updateStatus').textContent = '⚠️ Score feed unreachable — retrying in a minute';
    if (firstRender) {
      clearInterval(loaderTimer);
      document.querySelectorAll('.loader-text').forEach((el) => {
        el.textContent = '⚠️ Couldn’t reach the score feed — retrying every minute';
      });
    }
  }
}

refresh();
setInterval(refresh, REFRESH_MS);
