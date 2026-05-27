export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
  };

  try {
    // ESPN standings — works for regular season, playoffs, and summer league
    const url = "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings";
    const r   = await fetch(url, { headers });
    if (!r.ok) throw new Error(`ESPN standings ${r.status}`);
    const data = await r.json();

    // Parse into clean format
    const east = [];
    const west = [];

    const groups = data.children || [];
    for (const group of groups) {
      const confName = group.name || "";
      const isEast   = confName.toLowerCase().includes("east");
      const entries  = group.standings?.entries || [];

      for (const entry of entries) {
        const team = entry.team || {};
        const stats = {};
        for (const s of entry.statistics || []) {
          stats[s.name] = s.value;
        }
        const row = {
          team: team.abbreviation || "???",
          name: team.displayName  || team.name || "???",
          w:    Math.round(stats.wins   || stats.OVW || 0),
          l:    Math.round(stats.losses || stats.OVL || 0),
          pct:  stats.winPercent || stats.OWP || 0,
          gb:   stats.gamesBehind || 0,
        };
        if (isEast) east.push(row);
        else        west.push(row);
      }
    }

    // Sort by win pct
    east.sort((a, b) => b.pct - a.pct);
    west.sort((a, b) => b.pct - a.pct);

    // Add rank
    east.forEach((t, i) => t.rank = i + 1);
    west.forEach((t, i) => t.rank = i + 1);

    // Detect season type from ESPN data
    const seasonType = data.season?.type || 2; // 2=regular, 3=playoffs, 1=preseason

    res.status(200).json({
      east, west, seasonType,
      season: data.season?.displayName || "2025-26",
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message, east: [], west: [] });
  }
}
