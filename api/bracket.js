export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
  };

  try {
    // Fetch all postseason games across the full playoff window
    const urls = [
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?seasontype=3&limit=100&dates=20260415-20260501",
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?seasontype=3&limit=100&dates=20260501-20260630",
    ];

    const allEvents = [];
    for (const url of urls) {
      try {
        const r = await fetch(url, { headers });
        if (!r.ok) continue;
        const d = await r.json();
        allEvents.push(...(d.events || []));
      } catch {}
    }

    res.status(200).json({
      scoreboard: { events: allEvents },
      fetchedAt: new Date().toISOString(),
      source: "espn-scoreboard"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
