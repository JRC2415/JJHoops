export default async function handler(req, res) {
  // Allow the browser to call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    const response = await fetch(
      "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": "https://www.nba.com/",
          "Origin": "https://www.nba.com",
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`NBA API returned ${response.status}`);
    }

    const data = await response.json();
    // Cache for 30 seconds on Vercel's edge
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
