import TeamBadge from '../components/TeamBadge.jsx';
import { MY_TEAMS, TEAM_COLORS } from '../constants.js';

const CONF_FINALS = [
  { round: "Eastern Conference Finals", status: "closed", t1: "NYK", t1wins: 4, t2: "CLE", t2wins: 0, winner: "NYK" },
  { round: "Western Conference Finals", status: "closed", t1: "OKC", t1wins: 4, t2: "SAS", t2wins: 2, winner: "OKC" },
];

const SEMIS = [
  { round: "EC Semis", status: "closed", t1: "NYK", t1wins: 4, t2: "PHI", t2wins: 0, winner: "NYK" },
  { round: "EC Semis", status: "closed", t1: "CLE", t1wins: 4, t2: "DET", t2wins: 3, winner: "CLE" },
  { round: "WC Semis", status: "closed", t1: "OKC", t1wins: 4, t2: "LAL", t2wins: 0, winner: "OKC" },
  { round: "WC Semis", status: "closed", t1: "SAS", t1wins: 4, t2: "MIN", t2wins: 2, winner: "SAS" },
];

const FIRST_ROUND = [
  { t1: "PHI", t1wins: 4, t2: "BOS", t2wins: 3, winner: "PHI" },
  { t1: "NYK", t1wins: 4, t2: "ATL", t2wins: 2, winner: "NYK" },
  { t1: "CLE", t1wins: 4, t2: "TOR", t2wins: 3, winner: "CLE" },
  { t1: "DET", t1wins: 4, t2: "ORL", t2wins: 3, winner: "DET" },
  { t1: "OKC", t1wins: 4, t2: "PHX", t2wins: 0, winner: "OKC" },
  { t1: "LAL", t1wins: 4, t2: "HOU", t2wins: 2, winner: "LAL" },
  { t1: "SAS", t1wins: 4, t2: "POR", t2wins: 1, winner: "SAS" },
  { t1: "MIN", t1wins: 4, t2: "DEN", t2wins: 2, winner: "MIN" },
];

function label(status) {
  if (status === "inprogress") return <span style={{ color: "#E8621A", fontSize: 10, fontWeight: 700 }}>● LIVE</span>;
  if (status === "closed")     return <span style={{ color: "#16a34a", fontSize: 10, fontWeight: 700 }}>✓ FINAL</span>;
  return <span style={{ color: "#8B7355", fontSize: 10, fontWeight: 700 }}>○ UPCOMING</span>;
}

function Card({ s, big }) {
  const c1 = TEAM_COLORS[s.t1] || "#8B5E1A";
  const c2 = TEAM_COLORS[s.t2] || "#8B5E1A";
  const mine = MY_TEAMS.includes(s.t1) || MY_TEAMS.includes(s.t2);
  return (
    <div className="glass" style={{ borderRadius: 12, padding: big ? "18px 20px" : "12px 16px", border: mine ? `1.5px solid ${c1}50` : "1px solid rgba(200,137,58,0.2)", marginBottom: 8 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, display: "flex", gap: 8 }}>
        <span>{s.round}</span>{label(s.status)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: big ? 24 : 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <TeamBadge abbr={s.t1} size={big ? 52 : 36} />
          {s.winner === s.t1 && <span style={{ fontSize: 9, color: "#16a34a", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>WON</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: big ? 40 : 28, color: s.t1wins >= s.t2wins ? c1 : "#8B7355" }}>{s.t1wins}</span>
          <span style={{ color: "#C8893A", fontWeight: 700, fontSize: big ? 20 : 16 }}>–</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: big ? 40 : 28, color: s.t2wins >= s.t1wins ? c2 : "#8B7355" }}>{s.t2wins}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <TeamBadge abbr={s.t2} size={big ? 52 : 36} />
          {s.winner === s.t2 && <span style={{ fontSize: 9, color: "#16a34a", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>WON</span>}
        </div>
      </div>
      {s.note && <div style={{ textAlign: "center", marginTop: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#E8621A", fontWeight: 600 }}>{s.note}</div>}
      {mine && <div style={{ textAlign: "center", marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", fontWeight: 700, letterSpacing: 1 }}>★ YOUR TEAM</div>}
    </div>
  );
}

function Small({ s }) {
  const mine = MY_TEAMS.includes(s.t1) || MY_TEAMS.includes(s.t2);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, marginBottom: 4, background: mine ? "rgba(232,98,26,0.08)" : "rgba(200,137,58,0.05)", border: mine ? "1px solid rgba(232,98,26,0.2)" : "1px solid rgba(200,137,58,0.1)" }}>
      <TeamBadge abbr={s.t1} size={28} />
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: s.winner === s.t1 ? TEAM_COLORS[s.t1] || "#8B5E1A" : "#8B7355" }}>{s.t1wins}</span>
      <span style={{ color: "#C8893A", fontWeight: 700 }}>–</span>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: s.winner === s.t2 ? TEAM_COLORS[s.t2] || "#8B5E1A" : "#8B7355" }}>{s.t2wins}</span>
      <TeamBadge abbr={s.t2} size={28} />
      {mine && <span style={{ marginLeft: "auto", fontSize: 12, color: "#E8621A" }}>★</span>}
    </div>
  );
}

export default function BracketTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
        🏆 NBA Finals
      </div>
      <Card s={{ round: "NBA Finals", status: "inprogress", t1: "NYK", t1wins: 0, t2: "OKC", t2wins: 0, note: "Series starts June 4" }} big />

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>Conference Finals</div>
      {CONF_FINALS.map((s, i) => <Card key={i} s={s} />)}

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>Conference Semifinals</div>
      {SEMIS.map((s, i) => <Card key={i} s={s} />)}

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#8B7355", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>First Round</div>
      {FIRST_ROUND.map((s, i) => <Small key={i} s={s} />)}
    </div>
  );
}
