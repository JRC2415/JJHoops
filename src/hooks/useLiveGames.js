import { useState, useEffect, useCallback } from "react";

function argTime(isoUtc) {
  if (!isoUtc) return null;
  try {
    return new Date(isoUtc).toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return null; }
}

function mapStatus(s) {
  if (!s) return "scheduled";
  if (s === 2 || s === "2") return "inprogress";
  if (s === 3 || s === "3") return "closed";
  if (typeof s === "string") {
    const u = s.toUpperCase();
    if (u.includes("PROGRESS") || u === "LIVE") return "inprogress";
    if (u === "FINAL" || u === "CLOSED") return "closed";
  }
  return "scheduled";
}

function parseGames(data) {
  const games = data?.scoreboard?.games || [];
  return games.map(g => {
    const status   = mapStatus(g.gameStatus);
    const isLive   = status === "inprogress";
    const isFinal  = status === "closed";
    const homeTeam = g.homeTeam || {};
    const awayTeam = g.awayTeam || {};
    return {
      id:        String(g.gameId || Math.random()),
      status,
      home:      homeTeam.teamTricode || "HOM",
      away:      awayTeam.teamTricode || "AWY",
      homeName:  homeTeam.teamName    || homeTeam.teamTricode || "Home",
      awayName:  awayTeam.teamName    || awayTeam.teamTricode || "Away",
      homeSeed:  null, awaySeed: null,
      homeScore: (isLive || isFinal) ? homeTeam.score : null,
      awayScore: (isLive || isFinal) ? awayTeam.score : null,
      homeProb:  null, awayProb: null,
      quarter:   g.period    || null,
      clock:     g.gameClock || null,
      gameTime:  argTime(g.gameTimeUTC),
      title:     g.seriesText || "Playoffs",
      startTime: g.gameTimeUTC || null,
    };
  });
}

export function useLiveGames(seedGames) {
  const [games,   setGames]   = useState(seedGames);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Call our own Vercel serverless proxy — no CORS issues
      const res  = await fetch("/api/scores");
      if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
      const data = await res.json();
      const live = parseGames(data);

      if (live && live.length > 0) {
        const order = { inprogress: 0, scheduled: 1, closed: 2 };
        live.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
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
