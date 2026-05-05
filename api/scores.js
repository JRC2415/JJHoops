export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  // Argentina date today and tomorrow
  const toArgDate = (offset = 0) => {
    const d = new Date(Date.now() + offset * 86400000);
    return d.toLocaleDateString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      month: "2-digit", day: "2-digit", year: "numeric"
    }); // MM/DD/YYYY for NBA stats API
  };

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
  };

  try {
    // Fetch today + tomorrow to always show upcoming games
    const dates = [toArgDate(0), toArgDate(1)];
    const allGames = [];

    for (const date of dates) {
      try {
        const url = `https://stats.nba.com/stats/scoreboard/?GameDate=${date}&LeagueID=00&DayOffset=0`;
        const r = await fetch(url, { headers });
        if (!r.ok) continue;
        const data = await r.json();

        // NBA stats API returns resultSets array
        const gameHeader = data.resultSets?.find(s => s.name === "GameHeader");
        const lineScore  = data.resultSets?.find(s => s.name === "LineScore");

        if (!gameHeader) continue;

        const ghIdx = {
          gameId:         gameHeader.headers.indexOf("GAME_ID"),
          gameStatus:     gameHeader.headers.indexOf("GAME_STATUS_ID"),
          gameStatusText: gameHeader.headers.indexOf("GAME_STATUS_TEXT"),
          gameTimeEt:     gameHeader.headers.indexOf("GAME_DATE_EST"),
          homeTeamId:     gameHeader.headers.indexOf("HOME_TEAM_ID"),
          visitorTeamId:  gameHeader.headers.indexOf("VISITOR_TEAM_ID"),
          nattvBroadcast: gameHeader.headers.indexOf("NATL_TV_BROADCASTER_ABBREVIATION"),
          livePeriod:     gameHeader.headers.indexOf("LIVE_PERIOD"),
          liveClock:      gameHeader.headers.indexOf("LIVE_PC_TIME"),
          seriesText:     gameHeader.headers.indexOf("SERIES_GAME_NUMBER"),
          seriesLeader:   gameHeader.headers.indexOf("SERIES_LEADERS"),
        };

        const lsIdx = lineScore ? {
          gameId:   lineScore.headers.indexOf("GAME_ID"),
          teamId:   lineScore.headers.indexOf("TEAM_ID"),
          teamAbbr: lineScore.headers.indexOf("TEAM_ABBREVIATION"),
          teamName: lineScore.headers.indexOf("TEAM_CITY_NAME"),
          pts:      lineScore.headers.indexOf("PTS"),
        } : null;

        // Build lookup: gameId -> { home, away scores }
        const scoreMap = {};
        if (lineScore && lsIdx) {
          for (const row of lineScore.rowSet) {
            const gid  = row[lsIdx.gameId];
            const abbr = row[lsIdx.teamAbbr];
            const pts  = row[lsIdx.pts];
            const name = row[lsIdx.teamName];
            if (!scoreMap[gid]) scoreMap[gid] = {};
            scoreMap[gid][abbr] = { pts, name };
          }
        }

        for (const row of gameHeader.rowSet) {
          const gameId     = row[ghIdx.gameId];
          const statusId   = row[ghIdx.gameStatus];
          const statusText = row[ghIdx.gameStatusText]?.trim() || "";
          const homeId     = row[ghIdx.homeTeamId];
          const awayId     = row[ghIdx.visitorTeamId];
          const period     = row[ghIdx.livePeriod];
          const clock      = row[ghIdx.liveClock];
          const seriesNum  = row[ghIdx.seriesText];

          // Map status
          let status = "scheduled";
          if (statusId === 2) status = "inprogress";
          if (statusId === 3) status = "closed";

          // Get team abbrs from lineScore
          const scoreData = scoreMap[gameId] || {};
          const teamAbbrs = Object.keys(scoreData);
          const homeAbbr  = teamAbbrs[1] || "HOM";
          const awayAbbr  = teamAbbrs[0] || "AWY";
          const homePts   = scoreData[homeAbbr]?.pts ?? null;
          const awayPts   = scoreData[awayAbbr]?.pts ?? null;
          const homeName  = scoreData[homeAbbr]?.name || homeAbbr;
          const awayName  = scoreData[awayAbbr]?.name || awayAbbr;

          // Parse game time — statusText for scheduled looks like "7:30 pm ET"
          let gameTimeUTC = null;
          if (status === "scheduled" && statusText.includes(":")) {
            try {
              // Convert ET to UTC (ET = UTC-4 in May during EDT)
              const timeStr = statusText.replace(/ ET$/i, "").trim();
              const [time, ampm] = timeStr.split(" ");
              let [h, m] = time.split(":").map(Number);
              if (ampm?.toLowerCase() === "pm" && h !== 12) h += 12;
              if (ampm?.toLowerCase() === "am" && h === 12) h = 0;
              const today = new Date();
              today.setUTCHours(h + 4, m, 0, 0); // EDT = UTC-4
              gameTimeUTC = today.toISOString();
            } catch {}
          }

          // Format ARG time
          let gameTimeArg = null;
          if (gameTimeUTC) {
            gameTimeArg = new Date(gameTimeUTC).toLocaleString("en-US", {
              timeZone: "America/Argentina/Buenos_Aires",
              month: "short", day: "numeric",
              hour: "numeric", minute: "2-digit", hour12: true,
            });
          } else if (statusText && !statusText.match(/^\d/)) {
            gameTimeArg = statusText; // "Final", "Q3 5:23", etc
          }

          allGames.push({
            id: gameId,
            status,
            statusText,
            home: homeAbbr,
            away: awayAbbr,
            homeName,
            awayName,
            homeScore: (status !== "scheduled") ? homePts : null,
            awayScore: (status !== "scheduled") ? awayPts : null,
            quarter: period || null,
            clock: clock || null,
            gameTimeUTC,
            gameTimeArg,
            seriesText: seriesNum || "Playoffs",
          });
        }
      } catch (e) {
        console.error(`Failed for date ${date}:`, e.message);
      }
    }

    // Sort: live first, scheduled next, final last
    const order = { inprogress: 0, scheduled: 1, closed: 2 };
    allGames.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));

    // Remove duplicates by gameId
    const seen = new Set();
    const unique = allGames.filter(g => {
      if (seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    });

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");
    res.status(200).json({ games: unique, source: "nba-stats" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
