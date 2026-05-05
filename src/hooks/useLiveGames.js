import { useState, useEffect, useCallback } from "react";

function parseGames(data) {
  // New API returns { games: [...] }
  const games = data?.games || data?.scoreboard?.games || [];
  return games.map(g => ({
    id:        String(g.id || g.gameId || Math.random()),
    status:    g.status    || "scheduled",
    home:      g.home      || g.homeTeam?.teamTricode || "HOM",
    away:      g.away      || g.awayTeam?.teamTricode || "AWY",
    homeName:  g.homeName  || g.homeTeam?.teamName    || "Home",
    awayName:  g.awayName  || g.awayTeam?.teamName    || "Away",
    homeSeed:  null,
    awaySeed:  null,
    homeScore: g.homeScore ?? g.homeTeam?.score ?? null,
    awayScore: g.awayScore ?? g.awayTeam?.score ?? null,
    homeProb:  null,
    awayProb:  null,
    quarter:   g.quarter   || g.period    || null,
    clock:     g.clock     || g.gameClock || null,
    gameTime:  g.gameTimeArg || null,
    title:     g.seriesText  || g.title   || "Playoffs",
    startTime: g.gameTimeUTC || null,
  }));
}

export function useLiveGames(seedGames) {
  const [games,   setGames]   = useState(seedGames);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/scores");
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const live = parseGames(data);

      if (live && live.length > 0) {
        setGames(live);
        setUpdated(new Date());
      }
    } catch (e) {
      console.warn("Score fetch failed, keeping current data:", e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { games, loading, updated, refresh };
}
