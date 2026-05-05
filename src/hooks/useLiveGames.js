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

// Map balldontlie team abbreviations to our display format
const ABBR_MAP = {
  "GSW": "GSW", "LAL": "LAL", "LAC": "LAC", "PHX": "PHX",
  "SAC": "SAC", "DEN": "DEN", "MIN": "MIN", "OKC": "OKC",
  "POR": "POR", "UTA": "UTA", "DAL": "DAL", "HOU": "HOU",
  "MEM": "MEM", "NOP": "NOP", "SAS": "SAS", "MIA": "MIA",
  "ATL": "ATL", "CHA": "CHA", "CHI": "CHI", "CLE": "CLE",
  "DET": "DET", "IND": "IND", "MIL": "MIL", "NYK": "NYK",
  "ORL": "ORL", "PHI": "PHI", "BKN": "BKN", "BOS": "BOS",
  "TOR": "TOR", "WAS": "WAS",
};

function mapStatus(s) {
  if (!s) return "scheduled";
  const u = s.toUpperCase();
  if (u === "IN PROGRESS" || u === "LIVE" || u.includes("PROGRESS")) return "inprogress";
  if (u === "FINAL" || u === "CLOSED" || u === "COMPLETE") return "closed";
  return "scheduled";
}

async function fetchTodayGames() {
  // Get today's date in Argentina timezone
  const argNow = new Date(Date.now());
  const argDate = argNow.toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires"
  }); // "2026-05-05"

  // Also fetch yesterday in case late games haven't flipped yet
  const yesterday = new Date(argNow - 86400000).toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires"
  });

  const urls = [
    `https://api.balldontlie.io/v1/games?dates[]=${argDate}&per_page=20`,
    `https://api.balldontlie.io/v1/games?dates[]=${yesterday}&per_page=20`,
  ];

  const results = await Promise.allSettled(urls.map(u => fetch(u).then(r => r.json())));

  const games = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.data) {
      games.push(...r.value.data);
    }
  }

  if (games.length === 0) return null;

  return games.map(g => {
    const homeAbbr = ABBR_MAP[g.home_team?.abbreviation] || g.home_team?.abbreviation || "HOM";
    const awayAbbr = ABBR_MAP[g.visitor_team?.abbreviation] || g.visitor_team?.abbreviation || "AWY";
    const status   = mapStatus(g.status);
    const isLive   = status === "inprogress";
    const isFinal  = status === "closed";

    return {
      id:        String(g.id),
      status,
      home:      homeAbbr,
      away:      awayAbbr,
      homeName:  g.home_team?.full_name    || homeAbbr,
      awayName:  g.visitor_team?.full_name || awayAbbr,
      homeSeed:  null,
      awaySeed:  null,
      homeScore: isFinal || isLive ? g.home_team_score : null,
      awayScore: isFinal || isLive ? g.visitor_team_score : null,
      homeProb:  null,
      awayProb:  null,
      quarter:   g.period   || null,
      clock:     g.time     || null,
      gameTime:  argTime(g.datetime || g.date),
      title:     g.postseason ? "Playoffs" : "Regular Season",
      startTime: g.datetime || g.date || null,
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
      const live = await fetchTodayGames();
      if (live && live.length > 0) {
        // Sort: live first, scheduled next, final last
        const order = { inprogress: 0, scheduled: 1, closed: 2 };
        live.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
        setGames(live);
        setUpdated(new Date());
      }
      // If API returns empty (off-season etc), keep seed games
    } catch (e) {
      console.warn("balldontlie fetch failed:", e.message);
      // Keep seed games on failure
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Auto-refresh every 60 seconds when a game is live
    const interval = setInterval(() => {
      refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { games, loading, updated, refresh };
}
