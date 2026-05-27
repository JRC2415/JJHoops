import { useState, useEffect } from "react";
import TeamBadge from '../components/TeamBadge.jsx';
import { MY_TEAMS, TEAM_COLORS } from '../constants.js';

// ── Current known bracket state (seed data while API loads) ─────────────────
const SEED_BRACKET = {
  playoffsActive: true,
  finals: {
    round: "NBA Finals",
    status: "scheduled",
    t1: "NYK", t1wins: 0,
    t2: "TBD", t2wins: 0,
    note: "NYK awaits WCF winner · Starts Jun 4",
  },
  confFinals: [
    {
      round: "Eastern Conference Finals",
      status: "closed",
      t1: "NYK", t1wins: 4, t2: "CLE", t2wins: 0, winner: "NYK",
    },
    {
      round: "Western Conference Finals",
      status: "inprogress",
      t1: "OKC", t1wins: 3, t2: "SAS", t2wins: 2,
      note: "Game 6 · Thu May 28, 9:30 PM ARG",
    },
  ],
  semis: [
    { round: "EC Semis", status: "closed", t1: "NYK", t1wins: 4, t2: "PHI", t2wins: 0, winner: "NYK" },
    { round: "EC Semis", status: "closed", t1: "CLE", t1wins: 4, t2: "DET", t2wins: 3, winner: "CLE" },
    { round: "WC Semis", status: "closed", t1: "OKC", t1wins: 4, t2: "LAL", t2wins: 0, winner: "OKC" },
    { round: "WC Semis", status: "closed", t1: "SAS", t1wins: 4, t2: "MIN", t2wins: 2, winner: "SAS" },
  ],
  firstRound: [
    { t1: "PHI", t1wins: 4, t2: "BOS", t2wins: 3, winner: "PHI" },
    { t1: "NYK", t1wins: 4, t2: "ATL", t2wins: 2, winner: "NYK" },
    { t1: "CLE", t1wins: 4, t2: "TOR", t2wins: 3, winner: "CLE" },
    { t1: "DET", t1wins: 4, t2: "ORL", t2wins: 3, winner: "DET" },
    { t1: "OKC", t1wins: 4, t2: "PHX", t2wins: 0, winner: "OKC" },
    { t1: "LAL", t1wins: 4, t2: "HOU", t2wins: 2, winner: "LAL" },
    { t1: "SAS", t1wins: 4, t2: "POR", t2wins: 1, winner: "SAS" },
    { t1: "MIN", t1wins: 4, t2: "DEN", t2wins: 2, winner: "MIN" },
  ],
};

// ── Parse ESPN playoff data into our bracket shape ───────────────────────────
function parseESPNBracket(data) {
  // If ESPN returns series data, use it
  const series = data?.series || data?.bracket?.series || [];
  if (!series.length) return null;

  // Check if finals are done → playoffs over
  const finalsSeries = series.find(s =>
    s.round?.number === 4 || s.type?.name?.toLowerCase().includes("final")
  );
  const playoffsActive = !finalsSeries || finalsSeries.status?.type?.name !== "STATUS_FINAL";

  return { playoffsActive, raw: series };
}

function StatusBadge({ status }) {
  if (status === "inprogress") return <span style={{ color: "#E8621A", fontWeight: 700, fontSize: 10 }}>● LIVE</span>;
  if (status === "closed")     return <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 10 }}>✓ FINAL</span>;
  return <span style={{ color: "#8B7355", fontWeight: 700, fontSize: 10 }}>○ UPCOMING</span>;
}

function SeriesCard({ s, size = "normal" }) {
  const isMyTeam = MY_TEAMS.includes(s.t1) || MY_TEAMS.includes(s.t2);
  const isBig    = size === "big";
  const color1   = TEAM_COLORS[s.t1] || "#8B5E1A";
  const color2   = TEAM_COLORS[s.t2] || "#8B5E1A";

  return (
    <div className="glass" style={{
      borderRadius: 12,
      padding: isBig ? "18px 20px" : "12px 16px",
      border: isMyTeam ? `1.5px solid ${color1}50` : "1px solid rgba(200,137,58,0.2)",
      marginBottom: 8,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
        color: "#8B7355", letterSpacing: 1.5, textTransform: "uppercase",
        marginBottom: 10, display: "flex", gap: 8, alignItems: "center",
      }}>
        <span>{s.round}</span>
        <StatusBadge status={s.status} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isBig ? 24 : 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <TeamBadge abbr={s.t1} size={isBig ? 52 : 36} />
          {s.winner === s.t1 && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#16a34a", fontWeight: 700 }}>WON</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isBig ? 40 : 28, color: s.t1wins >= s.t2wins ? color1 : "#8B7355" }}>{s.t1wins}</span>
          <span style={{ color: "#C8893A", fontWeight: 700, fontSize: isBig ? 20 : 16 }}>–</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isBig ? 40 : 28, color: s.t2wins >= s.t1wins ? color2 : "#8B7355" }}>{s.t2wins}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <TeamBadge abbr={s.t2} size={isBig ? 52 : 36} />
          {s.winner === s.t2 && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#16a34a", fontWeight: 700 }}>WON</span>}
        </div>
      </div>

      {s.note && <div style={{ textAlign: "center", marginTop: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#E8621A", fontWeight: 600 }}>{s.note}</div>}
      {isMyTeam && <div style={{ textAlign: "center", marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", fontWeight: 700, letterSpacing: 1 }}>★ YOUR TEAM</div>}
    </div>
  );
}

function SmallResult({ s }) {
  const isMyTeam = MY_TEAMS.includes(s.t1) || MY_TEAMS.includes(s.t2);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 12px", borderRadius: 8, marginBottom: 4,
      background: isMyTeam ? "rgba(232,98,26,0.08)" : "rgba(200,137,58,0.05)",
      border: isMyTeam ? "1px solid rgba(232,98,26,0.2)" : "1px solid rgba(200,137,58,0.1)",
    }}>
      <TeamBadge abbr={s.t1} size={28} />
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: s.winner === s.t1 ? TEAM_COLORS[s.t1] : "#8B7355" }}>{s.t1wins}</span>
      <span style={{ color: "#C8893A", fontWeight: 700 }}>–</span>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: s.winner === s.t2 ? TEAM_COLORS[s.t2] : "#8B7355" }}>{s.t2wins}</span>
      <TeamBadge abbr={s.t2} size={28} />
      {isMyTeam && <span style={{ marginLeft: "auto", fontSize: 12, color: "#E8621A" }}>★</span>}
    </div>
  );
}

export default function BracketTab() {
  const [bracket,     setBracket]     = useState(SEED_BRACKET);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetch("/api/bracket")
      .then(r => r.json())
      .then(data => {
        const parsed = parseESPNBracket(data);
        if (parsed && parsed.raw) {
          // If we get real ESPN series data, update playoffsActive
          setBracket(prev => ({ ...prev, playoffsActive: parsed.playoffsActive }));
        }
        setLastUpdated(new Date());
      })
      .catch(() => {});
  }, []);

  // Playoffs over — show offseason message
  if (!bracket.playoffsActive) {
    return (
      <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#E8621A", letterSpacing: 1 }}>
          Playoffs Complete
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#6b5c45", marginTop: 8 }}>
          The bracket will return when the next playoffs begin.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* NBA Finals */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
        🏆 NBA Finals
      </div>
      <SeriesCard series={bracket.finals} size="big" />

      {/* Conference Finals */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>
        Conference Finals
      </div>
      {bracket.confFinals.map((s, i) => <SeriesCard key={i} series={s} />)}

      {/* Semis */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>
        Conference Semifinals
      </div>
      {bracket.semis.map((s, i) => <SeriesCard key={i} series={s} />)}

      {/* First Round */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#8B7355", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>
        First Round
      </div>
      {bracket.firstRound.map((s, i) => <SmallResult key={i} s={s} />)}

      {lastUpdated && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", textAlign: "center", marginTop: 12 }}>
          Updated {lastUpdated.toLocaleTimeString("en-US", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", minute: "2-digit" })} ARG
        </div>
      )}
    </div>
  );
}
