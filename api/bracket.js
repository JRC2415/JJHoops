export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
  };

  try {
    // ESPN playoff series endpoint — returns all rounds live
    const r = await fetch(
      "https://site.api.espn.com/apis/v2/sports/basketball/nba/playoff-series",
      { headers }
    );

    if (!r.ok) throw new Error(`ESPN ${r.status}`);
    const data = await r.json();
    res.status(200).json({ ...data, fetchedAt: new Date().toISOString(), source: "espn-playoff-series" });
  } catch (err) {
    // Fallback: ESPN scoreboard postseason
    try {
      const r2 = await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?seasontype=3&limit=50",
        { headers }
      );
      if (!r2.ok) throw new Error(`ESPN fallback ${r2.status}`);
      const data2 = await r2.json();
      res.status(200).json({ scoreboard: data2, fetchedAt: new Date().toISOString(), source: "espn-scoreboard" });
    } catch (err2) {
      res.status(500).json({ error: err2.message });
    }
  }
}
