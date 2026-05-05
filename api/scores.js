export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
  };

  function toArgTime(isoUtc) {
    if (!isoUtc) return null;
    try {
      return new Date(isoUtc).toLocaleString("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
        month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      });
    } catch { return null; }
  }

  function mapEspnStatus(name) {
    if (!name) return "scheduled";
    if (name === "STATUS_IN_PROGRESS") return "inprogress";
    if (name === "STATUS_FINAL")       return "closed";
    return "scheduled";
  }

  try {
    // ESPN public scoreboard — works from Vercel, no key needed
    const url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
    const r   = await fetch(url, { headers });
    if (!r.ok) throw new Error(`ESPN returned ${r.status}`);
    const data   = await r.json();
    const events = data?.events || [];

    const games = events.map(e => {
      const comp     = e.competitions?.[0] || {};
      const status   = comp.status || {};
      const teams    = comp.competitors || [];
      const home     = teams.find(t => t.homeAway === "home") || teams[0] || {};
      const away     = teams.find(t => t.homeAway === "away") || teams[1] || {};
      const gameStatus = mapEspnStatus(status.type?.name);
      const isLive   = gameStatus === "inprogress";
      const isFinal  = gameStatus === "closed";

      return {
        id:        e.id,
        status:    gameStatus,
        home:      home.team?.abbreviation || "HOM",
        away:      away.team?.abbreviation || "AWY",
        homeName:  home.team?.shortDisplayName || home.team?.displayName || "Home",
        awayName:  away.team?.shortDisplayName || away.team?.displayName || "Away",
        homeScore: (isLive || isFinal) ? parseInt(home.score) : null,
        awayScore: (isLive || isFinal) ? parseInt(away.score) : null,
        quarter:   isLive ? status.period : null,
        clock:     isLive ? status.displayClock : null,
        gameTimeArg: toArgTime(comp.date),
        seriesText:  comp.series?.summary || e.season?.slug || "Playoffs",
        gameTimeUTC: comp.date || null,
      };
    });

    // Sort: live → upcoming → final
    const order = { inprogress: 0, scheduled: 1, closed: 2 };
    games.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));

    res.status(200).json({ games, source: "espn" });
  } catch (err) {
    res.status(500).json({ error: err.message, games: [] });
  }
}
