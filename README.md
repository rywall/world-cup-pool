# ⚽ Templeman World Cup Pool 2026

A soccer-themed website that pulls **live 2026 World Cup scores** and ranks every
family member's bracket using the official family pool rules:

- **+3** per win by one of your picked teams
- **+1** per draw
- **+1** per clean sheet
- **+10** for correctly picking the World Cup champion
- Tiebreakers: cumulative goals scored, then cumulative goal difference

## Run it

No server, no build, no API key — it's all static files. Either:

- **Double-click `index.html`** to open it in your browser, or
- Host the folder anywhere static (GitHub Pages, Netlify, Vercel, Dropbox…)
  so the whole family can open one link on their phones.

Scores refresh automatically every minute while the page is open.

## Add family members

Edit `picks.js` — copy the commented template inside `ENTRANTS` and fill in
their name, pool team name, champion, and two teams per group (A–L). Team names
must match the list at the top of that file exactly. If a name doesn't match,
the site shows a warning banner telling you which pick to fix.

## How it works

- `app.js` — scoring engine + rendering. Fetches ESPN's public scoreboard API
  (`site.api.espn.com`), which sends proper CORS headers — so the browser
  calls it directly: no key, no proxy, no server. One request per minute gets
  all 104 matches. If the feed is ever unreachable, the site falls back to the
  last good scores saved in localStorage.
- `teams.js` — all 48 teams (names, groups, flags), embedded since they never
  change, so the only live network dependency is match scores.
- `picks.js` — everyone's brackets and the pool scoring config.

## Notes / edge cases

- Knockout matches tied after extra time are decided by the shootout: the
  shootout winner scores a **win (3 pts)** and the loser a loss (ESPN marks
  the shootout winner). Only group-stage matches can end in a draw.
- Match times are shown in your local timezone.
