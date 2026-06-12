/* Templeman World Cup Pool — scoring engine + rendering (runs 100% in the browser) */

const REFRESH_MS = 60 * 1000;

let games = [];      // normalized matches from the ESPN feed
let dataNote = '';   // shown in the status bar when we're on stale/cached data
const teamsByName = new Map(TEAMS.map((t) => [t.name, t]));
let currentFilter = 'today';
const expanded = new Set(); // entrant names with open detail panels
let firstRender = true;     // staggered entrance animations only on the first data render

// fun rotating messages under the bouncing-ball loader
const LOADER_MSGS = [
  'Inflating the match ball…',
  'Mowing the pitch…',
  'Warming up the keepers…',
  'Consulting VAR…',
  'Handing out orange slices…',
  'Practicing goal celebrations…',
];
let loaderMsgIdx = 0;
const loaderTimer = setInterval(() => {
  loaderMsgIdx++;
  document.querySelectorAll('.loader-text').forEach((el, i) => {
    el.textContent = LOADER_MSGS[(loaderMsgIdx + i) % LOADER_MSGS.length];
  });
}, 1500);

// ---------- data loading ----------
// ESPN's public scoreboard API sends Access-Control-Allow-Origin: * — the
// whole tournament in one browser-friendly call, no key, no proxy. If it's
// ever unreachable we fall back to the last good copy in localStorage.

const FEED =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard' +
  '?dates=20260611-20260719&limit=300';
const CACHE_KEY = 'wcpool_espn_v1';

function normalize(events) {
  return events.map((e) => {
    const comp = e.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === 'home');
    const away = comp.competitors.find((c) => c.homeAway === 'away');
    const homeName = home.team.displayName;
    return {
      home: { name: homeName, score: +(home.score || 0), winner: home.winner === true },
      away: { name: away.team.displayName, score: +(away.score || 0), winner: away.winner === true },
      state: e.status.type.state, // 'pre' | 'in' | 'post'
      clock: e.status.displayClock,
      round: e.season.slug,
      date: new Date(e.date), // UTC from the feed → rendered in viewer's timezone
      group: teamsByName.get(homeName)?.group || teamsByName.get(away.team.displayName)?.group || '',
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
    } catch (_) { /* private mode / quota — fine, just no offline cache */ }
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

// ---------- scoring ----------

function teamStats(teamName) {
  const s = { w: 0, d: 0, l: 0, cs: 0, gf: 0, ga: 0, played: 0, eliminated: false };
  for (const g of games) {
    if (!hasTeams(g) || !isFinished(g)) continue;
    const us = g.home.name === teamName ? g.home : g.away.name === teamName ? g.away : null;
    if (!us) continue;
    const them = us === g.home ? g.away : g.home;
    s.played++;
    s.gf += us.score;
    s.ga += them.score;
    if (them.score === 0) s.cs++;
    // Wins/draws use the score after extra time; a knockout game decided on
    // penalties counts as a draw (1 pt), per the family rules.
    if (us.score > them.score) s.w++;
    else if (us.score === them.score) s.d++;
    else s.l++;
    // ESPN sets the winner flag even for penalty shootouts, so elimination
    // tracking stays correct when a knockout game is tied after extra time.
    if (g.round !== 'group-stage' && g.round !== '3rd-place-match' && them.winner) s.eliminated = true;
  }
  s.pts = s.w * POOL_CONFIG.pointsPerWin + s.d * POOL_CONFIG.pointsPerDraw + s.cs * POOL_CONFIG.pointsPerCleanSheet;
  return s;
}

function findChampion() {
  if (POOL_CONFIG.championOverride) return POOL_CONFIG.championOverride;
  const final = games.find((g) => g.round === 'final');
  if (!final || !isFinished(final) || !hasTeams(final)) return null;
  if (final.home.winner) return final.home.name;
  if (final.away.winner) return final.away.name;
  return null;
}

function scoreEntrant(entrant, champion) {
  const teamRows = [];
  const invalid = [];
  let total = 0, gf = 0, gd = 0, w = 0, d = 0, cs = 0;

  for (const [group, names] of Object.entries(entrant.picks)) {
    for (const name of names) {
      const team = teamsByName.get(name);
      if (!team) {
        if (name) invalid.push(name);
        continue;
      }
      const s = teamStats(name);
      teamRows.push({ group, team, stats: s });
      total += s.pts;
      gf += s.gf;
      gd += s.gf - s.ga;
      w += s.w; d += s.d; cs += s.cs;
    }
  }

  const champHit = champion !== null && champion === entrant.champion;
  if (champHit) total += POOL_CONFIG.championBonus;

  return { entrant, teamRows, total, gf, gd, w, d, cs, champHit, championDecided: champion !== null, invalid };
}

function buildStandings() {
  const champion = findChampion();
  const rows = ENTRANTS.map((e) => scoreEntrant(e, champion));
  rows.sort(
    (a, b) =>
      b.total - a.total || b.gf - a.gf || b.gd - a.gd || a.entrant.name.localeCompare(b.entrant.name)
  );
  return rows;
}

// ---------- rendering ----------

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function flagImg(teamName, size = 24) {
  const team = teamsByName.get(teamName);
  return team ? `<img src="${esc(team.flag)}" width="${size}" alt="" loading="lazy">` : '';
}

function renderLeaderboard() {
  const rows = buildStandings();
  const medals = ['🥇', '🥈', '🥉'];
  const allInvalid = [...new Set(rows.flatMap((r) => r.invalid))];

  let html = '';
  if (allInvalid.length) {
    html += `<div class="error-banner">⚠️ These picks don't match any team name (check picks.js): ${esc(allInvalid.join(', '))}</div>`;
  }

  html += `<table class="lb-table${firstRender ? ' animate-in' : ''}"><tbody>`;
  rows.forEach((r, i) => {
    const champClass = r.champHit ? 'champ-chip hit' : 'champ-chip';
    const champNote = r.champHit ? ' +10!' : r.championDecided ? ' ❌' : '';
    const open = expanded.has(r.entrant.name);

    html += `
      <tr class="lb-row rank-${i + 1}" data-name="${esc(r.entrant.name)}" style="animation-delay:${i * 90}ms">
        <td>${medals[i] ? `<span class="rank-medal">${medals[i]}</span>` : `<span class="rank-num">${i + 1}</span>`}</td>
        <td>
          <div class="entrant-name">${esc(r.entrant.name)}</div>
          <div class="entrant-team">${esc(r.entrant.teamName)}</div>
        </td>
        <td class="breakdown-cell">
          <div class="breakdown"><b>${r.w}</b> wins · <b>${r.d}</b> draws · <b>${r.cs}</b> clean sheets</div>
          <div class="breakdown">tiebreaks: <b>${r.gf}</b> goals · <b>${r.gd >= 0 ? '+' : ''}${r.gd}</b></div>
        </td>
        <td class="champ-cell">
          <span class="${champClass}">👑 ${flagImg(r.entrant.champion, 18)} ${esc(r.entrant.champion)}${champNote}</span>
        </td>
        <td class="pts-big">${r.total}<span class="pts-label">pts</span></td>
      </tr>`;

    if (open) {
      html += `<tr class="detail-row"><td colspan="5"><div class="picks-grid">${renderPicksGrid(r)}</div></td></tr>`;
    }
  });
  html += '</tbody></table>';

  document.getElementById('leaderboard').innerHTML = html;
  document.querySelectorAll('.lb-row').forEach((tr) =>
    tr.addEventListener('click', () => {
      const name = tr.dataset.name;
      expanded.has(name) ? expanded.delete(name) : expanded.add(name);
      renderLeaderboard();
    })
  );
}

function renderPicksGrid(r) {
  const byGroup = {};
  for (const row of r.teamRows) (byGroup[row.group] ||= []).push(row);

  return Object.keys(byGroup)
    .sort()
    .map((g) => {
      const teamsHtml = byGroup[g]
        .map(({ team, stats }) => {
          const isChamp = team.name === r.entrant.champion;
          return `
            <div class="pick-team ${stats.eliminated ? 'out' : ''}">
              ${flagImg(team.name, 22)}
              <span class="tname">${esc(team.name)}${isChamp ? ' 👑' : ''}
                <span class="record">${stats.w}W-${stats.d}D-${stats.l}L · ${stats.cs}CS</span>
              </span>
              <span class="tpts">${stats.pts}</span>
            </div>`;
        })
        .join('');
      return `<div class="pick-group"><h4>Group ${esc(g)}</h4>${teamsHtml}</div>`;
    })
    .join('');
}

const ROUND_NAMES = {
  'group-stage': 'Group',
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  quarterfinals: 'Quarterfinal',
  semifinals: 'Semifinal',
  '3rd-place-match': '3rd Place',
  final: 'FINAL 🏆',
};

function roundLabel(g) {
  return g.round === 'group-stage' ? `Group ${g.group}` : ROUND_NAMES[g.round] || g.round;
}

function renderLiveStrip() {
  const live = games.filter((g) => isLive(g) && hasTeams(g));
  const strip = document.getElementById('liveStrip');
  strip.hidden = live.length === 0;
  strip.innerHTML = live
    .map(
      (g) => `
        <div class="live-card">
          <span class="live-badge">● LIVE</span>
          <div class="teams">${esc(g.home.name)} ${g.home.score} – ${g.away.score} ${esc(g.away.name)}</div>
          <div class="minute">${esc(g.clock)} · ${esc(roundLabel(g))}</div>
        </div>`
    )
    .join('');
}

function pickedByAnyone(teamName) {
  return ENTRANTS.some((e) => Object.values(e.picks).flat().includes(teamName));
}

function renderMatches() {
  const today = new Date();
  const sameDay = (d) =>
    d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

  let list = [...games];
  if (currentFilter === 'today') list = list.filter((g) => sameDay(g.date) || isLive(g));
  else if (currentFilter === 'results') list = list.filter(isFinished);
  else if (currentFilter === 'upcoming') list = list.filter((g) => !isFinished(g) && !isLive(g));

  list.sort((a, b) => (currentFilter === 'results' ? b.date - a.date : a.date - b.date));

  if (!list.length) {
    document.getElementById('matches').innerHTML =
      '<p class="hint">No matches here yet — check another tab! ⚽</p>';
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

    html += `
      <div class="match-row" style="animation-delay:${Math.min(rowIdx++ * 50, 700)}ms">
        <div class="match-team home ${pickedByAnyone(g.home.name) ? 'picked-any' : ''}">${esc(g.home.name)} ${flagImg(g.home.name)}</div>
        <div class="match-score ${scoreClass}">${esc(score)}</div>
        <div class="match-team ${pickedByAnyone(g.away.name) ? 'picked-any' : ''}">${flagImg(g.away.name)} ${esc(g.away.name)}</div>
        <div class="match-meta">${esc(roundLabel(g))}</div>
      </div>`;
  }
  const matchesEl = document.getElementById('matches');
  matchesEl.classList.toggle('animate-in', firstRender);
  matchesEl.innerHTML = html;
}

function renderAll() {
  renderLiveStrip();
  renderLeaderboard();
  renderMatches();
  document.getElementById('updateStatus').textContent =
    `Live scores · updated ${new Date().toLocaleTimeString()} · auto-refreshes every minute${dataNote}`;
  if (firstRender) {
    firstRender = false;
    clearInterval(loaderTimer);
  }
}

// ---------- boot ----------

document.getElementById('matchFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-filter]');
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === btn));
  renderMatches();
});

async function refresh() {
  // Let the bouncing-ball loader play for at least 2s on first load,
  // even when the data comes back instantly.
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
