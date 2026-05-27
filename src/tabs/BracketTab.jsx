import { useState, useEffect } from "react";
import { MY_TEAMS, TEAM_COLORS } from '../constants.js';

// ESPN abbreviation fixes
const ABBR_FIX = { "SA": "SAS", "GS": "GSW", "NY": "NYK", "NO": "NOP", "PHO": "PHX" };
const fixAbbr = a => { if (!a) return null; const u = a.toUpperCase(); return ABBR_FIX[u] || u; };

function argTime(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }); }
  catch { return null; }
}

function getRoundNumber(event) {
  const note  = (event.competitions?.[0]?.notes?.[0]?.headline || "").toLowerCase();
  const type  = (event.competitions?.[0]?.type?.abbreviation || "").toLowerCase();
  const name  = (event.name || "").toLowerCase();
  if (note.includes("nba final") || type === "champ") return 4;
  if (note.includes("conf") && (note.includes("final") || note.includes("wcf") || note.includes("ecf"))) return 3;
  if (note.includes("west final") || note.includes("east final")) return 3;
  if (note.includes("semi") || type === "semi") return 2;
  if (note.includes("first round") || note.includes("round 1") || type === "qf") return 1;
  // Fallback: detect from series summary
  const summary = (event.competitions?.[0]?.series?.summary || "").toLowerCase();
  if (summary.includes("nba final")) return 4;
  if (summary.includes("conf")) return 3;
  if (summary.includes("semi")) return 2;
  return 1;
}

function getConference(event) {
  const note = (event.competitions?.[0]?.notes?.[0]?.headline || "").toLowerCase();
  const name = (event.name || "").toLowerCase();
  if (note.includes("west") || name.includes("oklahoma") || name.includes("san antonio") ||
      note.includes("wc") || note.includes("wcf")) return "west";
  if (note.includes("east") || note.includes("ec") || note.includes("ecf")) return "east";
  // Guess from teams
  const WEST_TEAMS = ["OKC","SAS","DEN","LAL","MIN","GSW","PHX","SAC","DAL","HOU","MEM","NOP","POR","UTA","LAC"];
  const teams = event.competitions?.[0]?.competitors?.map(c => fixAbbr(c.team?.abbreviation)) || [];
  return teams.some(t => WEST_TEAMS.includes(t)) ? "west" : "east";
}

function parseEvents(events) {
  const seriesMap = {};
  for (const event of events) {
    const comp = event.competitions?.[0];
    if (!comp?.series) continue;
    const homeC = comp.competitors?.find(c => c.homeAway === "home");
    const awayC = comp.competitors?.find(c => c.homeAway === "away");
    if (!homeC || !awayC) continue;
    const t1 = fixAbbr(homeC.team?.abbreviation);
    const t2 = fixAbbr(awayC.team?.abbreviation);
    if (!t1 || !t2 || t1 === "TBD" || t2 === "TBD") continue;

    const key = [homeC.id, awayC.id].sort().join("-");
    const round = getRoundNumber(event);
    const conf  = getConference(event);

    // Get wins from series competitors
    const sc = comp.series.competitors || [];
    const sc1 = sc.find(c => c.id === homeC.id);
    const sc2 = sc.find(c => c.id === awayC.id);
    const t1wins = sc1?.wins ?? 0;
    const t2wins = sc2?.wins ?? 0;
    const done = comp.series.completed === true;
    const winner = done ? (t1wins > t2wins ? t1 : t2wins > t1wins ? t2 : null) : null;
    const status = done ? "closed" : comp.status?.type?.name?.includes("PROGRESS") ? "inprogress" : "scheduled";
    const nextTime = status === "scheduled" ? argTime(event.date) : null;
    const summary = comp.series.summary || "";

    if (!seriesMap[key] || round > seriesMap[key].round) {
      seriesMap[key] = { id: key, round, conf, t1, t2, t1wins: Number(t1wins), t2wins: Number(t2wins), winner, status, nextTime, summary, done };
    } else if (seriesMap[key]) {
      // Update wins/status with latest game data
      seriesMap[key].t1wins = Number(t1wins);
      seriesMap[key].t2wins = Number(t2wins);
      seriesMap[key].winner = winner;
      seriesMap[key].status = status;
      seriesMap[key].summary = summary;
      seriesMap[key].done = done;
      if (status === "scheduled") seriesMap[key].nextTime = argTime(event.date);
    }
  }
  return Object.values(seriesMap);
}

// ── Visual components ────────────────────────────────────────────────────────
function TeamRow({ abbr, wins, isWinner, highlight }) {
  const color = TEAM_COLORS[abbr] || "#8B5E1A";
  const isMe  = MY_TEAMS.includes(abbr);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "5px 8px", borderRadius: 5,
      background: isMe ? `${color}18` : isWinner ? "rgba(200,137,58,0.12)" : "transparent",
      borderLeft: isMe ? `3px solid ${color}` : "3px solid transparent",
    }}>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1,
        color: isMe ? color : isWinner ? "#3D2B10" : "#8B7355",
      }}>{abbr || "TBD"}</span>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
        color: isWinner ? (isMe ? color : "#3D2B10") : "#8B7355",
        minWidth: 16, textAlign: "right",
      }}>{wins}</span>
    </div>
  );
}

function SeriesBox({ series, size = "sm" }) {
  if (!series) {
    return (
      <div style={{
        background: "rgba(255,248,236,0.5)", borderRadius: 8,
        border: "1px solid rgba(200,137,58,0.2)", padding: "6px 8px",
        width: size === "lg" ? 130 : 110,
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#C8893A", padding: "4px 8px" }}>TBD</div>
        <div style={{ height: 1, background: "rgba(200,137,58,0.2)", margin: "2px 0" }} />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#C8893A", padding: "4px 8px" }}>TBD</div>
      </div>
    );
  }

  const { t1, t2, t1wins, t2wins, winner, status, nextTime, summary } = series;
  const isLive = status === "inprogress";
  const isDone = status === "closed";
  const w = size === "lg" ? 140 : 115;

  return (
    <div style={{
      background: "rgba(255,248,236,0.82)", borderRadius: 8,
      border: `1px solid ${isLive ? "#E8621A" : isDone ? "rgba(200,137,58,0.25)" : "rgba(200,137,58,0.2)"}`,
      padding: "4px 0", width: w, flexShrink: 0,
      boxShadow: isLive ? "0 0 8px rgba(232,98,26,0.3)" : "0 1px 4px rgba(100,50,0,0.06)",
    }}>
      <TeamRow abbr={t1} wins={t1wins} isWinner={winner === t1} />
      <div style={{ height: 1, background: "rgba(200,137,58,0.2)", margin: "1px 8px" }} />
      <TeamRow abbr={t2} wins={t2wins} isWinner={winner === t2} />
      {(isLive || (!isDone && summary)) && (
        <div style={{ textAlign: "center", fontSize: 8, fontFamily: "'Barlow Condensed', sans-serif", color: isLive ? "#E8621A" : "#8B7355", fontWeight: 700, letterSpacing: 0.5, padding: "2px 4px", whiteSpace: "nowrap", overflow: "hidden" }}>
          {isLive ? "● LIVE" : summary}
        </div>
      )}
      {!isDone && !isLive && nextTime && (
        <div style={{ textAlign: "center", fontSize: 8, fontFamily: "'Barlow Condensed', sans-serif", color: "#E8621A", padding: "2px 4px", whiteSpace: "nowrap", overflow: "hidden" }}>
          {nextTime} ARG
        </div>
      )}
    </div>
  );
}

// Connector line between bracket rounds
function Connector({ top, height, side }) {
  return (
    <div style={{ position: "relative", width: 16, flexShrink: 0 }}>
      <div style={{
        position: "absolute",
        top: top, height: height,
        left: side === "left" ? 0 : "auto",
        right: side === "right" ? 0 : "auto",
        width: "100%",
        borderTop: "1px solid rgba(200,137,58,0.35)",
        borderBottom: "1px solid rgba(200,137,58,0.35)",
        borderLeft: side === "left" ? "1px solid rgba(200,137,58,0.35)" : "none",
        borderRight: side === "right" ? "1px solid rgba(200,137,58,0.35)" : "none",
      }} />
    </div>
  );
}

const GAP = 12; // gap between series boxes
const BOX_H = 62; // approx height of each series box

export default function BracketTab() {
  const [allSeries,   setAllSeries]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 10000);
        const res        = await fetch("/api/bracket", { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data   = await res.json();
        const parsed = parseEvents(data?.scoreboard?.events || []);
        setAllSeries(parsed);
        setLastUpdated(new Date());
      } catch (e) {
        setError(e.name === "AbortError" ? "timeout" : e.message);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#8B7355" }}>Loading bracket…</div>
    </div>
  );

  if (error || allSeries.length === 0) return (
    <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#8B7355" }}>
        No active playoff bracket right now. Check back when the playoffs begin!
      </div>
    </div>
  );

  // Organize by conf + round
  const get = (conf, round) => allSeries.find(s => s.conf === conf && s.round === round) || null;

  const wR1a = get("west", 1); // We may have multiple R1 per conf — get all
  const wR1  = allSeries.filter(s => s.conf === "west" && s.round === 1);
  const eR1  = allSeries.filter(s => s.conf === "east" && s.round === 1);
  const wR2  = allSeries.filter(s => s.conf === "west" && s.round === 2);
  const eR2  = allSeries.filter(s => s.conf === "east" && s.round === 2);
  const wR3  = allSeries.find(s => s.conf === "west" && s.round === 3) || null;
  const eR3  = allSeries.find(s => s.conf === "east" && s.round === 3) || null;
  const finals = allSeries.find(s => s.round === 4) || null;

  const colGap = 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase" }}>
          Western Conference
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
          🏆 NBA Playoffs
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase" }}>
          Eastern Conference
        </div>
      </div>

      {/* Bracket — horizontal scroll on mobile */}
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: colGap, minWidth: 700 }}>

          {/* WEST R1 — 4 series stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355", letterSpacing: 1, textAlign: "center", marginBottom: 4 }}>R1</div>
            {wR1.length ? wR1.map(s => <SeriesBox key={s.id} series={s} />) : [null,null,null,null].map((_, i) => <SeriesBox key={i} series={null} />)}
          </div>

          {/* WEST R2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP * 2 + BOX_H, paddingTop: BOX_H / 2 + GAP / 2 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355", letterSpacing: 1, textAlign: "center", marginBottom: 4, marginTop: -(BOX_H / 2 + GAP / 2 + 16) }}>Semis</div>
            {wR2.length ? wR2.map(s => <SeriesBox key={s.id} series={s} />) : [null,null].map((_, i) => <SeriesBox key={i} series={null} />)}
          </div>

          {/* WEST R3 — Conf Finals */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: BOX_H + GAP }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355", letterSpacing: 1, textAlign: "center", marginBottom: 4 }}>W. Finals</div>
            <SeriesBox series={wR3} />
          </div>

          {/* NBA FINALS — center */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minWidth: 150 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: "#E8621A", letterSpacing: 2, marginBottom: 6, textAlign: "center" }}>🏆 FINALS</div>
            <SeriesBox series={finals} size="lg" />
          </div>

          {/* EAST R3 — Conf Finals */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: BOX_H + GAP }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355", letterSpacing: 1, textAlign: "center", marginBottom: 4 }}>E. Finals</div>
            <SeriesBox series={eR3} />
          </div>

          {/* EAST R2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP * 2 + BOX_H, paddingTop: BOX_H / 2 + GAP / 2 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355", letterSpacing: 1, textAlign: "center", marginBottom: 4, marginTop: -(BOX_H / 2 + GAP / 2 + 16) }}>Semis</div>
            {eR2.length ? eR2.map(s => <SeriesBox key={s.id} series={s} />) : [null,null].map((_, i) => <SeriesBox key={i} series={null} />)}
          </div>

          {/* EAST R1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355", letterSpacing: 1, textAlign: "center", marginBottom: 4 }}>R1</div>
            {eR1.length ? eR1.map(s => <SeriesBox key={s.id} series={s} />) : [null,null,null,null].map((_, i) => <SeriesBox key={i} series={null} />)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {MY_TEAMS.map(abbr => {
          const color = TEAM_COLORS[abbr] || "#8B5E1A";
          return (
            <div key={abbr} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45" }}>{abbr}</span>
            </div>
          );
        })}
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#8B7355" }}>= your teams</span>
      </div>

      {lastUpdated && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", textAlign: "center" }}>
          Updated {lastUpdated.toLocaleTimeString("en-US", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", minute: "2-digit" })} ARG
        </div>
      )}
    </div>
  );
}
