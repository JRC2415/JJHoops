export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  const TEAMS = {
    CHI: { espnId: "4" },
    LAL: { espnId: "13" },
    DEN: { espnId: "7" },
  };

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
  };

  try {
    const results = {};

    for (const [abbr, team] of Object.entries(TEAMS)) {
      try {
        // Correct ESPN endpoint using numeric team ID
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?team=${team.espnId}&limit=5`;
        const r = await fetch(url, { headers });
        if (!r.ok) throw new Error(`ESPN ${r.status}`);
        const data = await r.json();

        results[abbr] = (data.articles || []).slice(0, 4).map(a => ({
          headline:    a.headline    || "",
          description: a.description || "",
          published:   a.published   || "",
          link:        a.links?.web?.href || a.links?.api?.href || "",
        }));
      } catch {
        results[abbr] = [];
      }
    }

    res.status(200).json({ teams: results, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message, teams: {} });
  }
}
