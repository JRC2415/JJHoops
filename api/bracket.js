export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
  };

  try {
    // Fetch postseason scoreboard with a large limit to get all series games
    const r = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?seasontype=3&limit=50&dates=20260401-20260630",
      { headers }
    );
    if (!r.ok) throw new Error(`ESPN ${r.status}`);
    const data = await r.json();
    res.status(200).json({ scoreboard: data, fetchedAt: new Date().toISOString(), source: "espn-scoreboard" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
