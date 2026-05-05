import TeamBadge from '../components/TeamBadge.jsx';
import { MY_TEAMS, STATIC_SERIES, FIRST_ROUND_RESULTS, TEAM_COLORS } from '../constants.js';

function SeriesCard({ s, dim = false }) {
  const isMyTeam = MY_TEAMS.includes(s.t1) || MY_TEAMS.includes(s.t2);
  const winner   = s.status === "closed" ? (s.t1r > s.t2r ? s.t1 : s.t2) : null;

  return (
    <div className="glass" style={{
      borderRadius: 12, padding: "14px 16px", opacity: dim ? 0.7 : 1,
      border: isMyTeam ? `1.5px solid ${TEAM_COLORS[MY_TEAMS.find(t => t === s.t1 || t === s.t2)] || "rgba(200,137,58,0.3)"}50` : undefined,
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#8B7355", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase", display: "flex", gap: 8, alignItems: "center" }}>
        <span>{s.title}</span>
        {s.status === "inprogress" && <span style={{ color: "#E8621A" }}>● ACTIVE</span>}
        {s.status === "scheduled"  && <span style={{ color: "#8B7355" }}>○ UPCOMING</span>}
        {s.status === "closed"     && <span style={{ color: "#16a34a" }}>✓ COMPLETE</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <TeamCol abbr={s.t1} isWinner={winner === s.t1} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 37, color: s.t1r >= s.t2r ? TEAM_COLORS[s.t1] || "#E8621A" : "#8B7355", letterSpacing: 1 }}>{s.t1r}</span>
          <span style={{ color: "#C8893A", fontWeight: 700, fontSize: 21 }}>–</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 37, color: s.t2r >= s.t1r ? TEAM_COLORS[s.t2] || "#E8621A" : "#8B7355", letterSpacing: 1 }}>{s.t2r}</span>
        </div>
        <TeamCol abbr={s.t2} isWinner={winner === s.t2} />
      </div>

      {isMyTeam && (
        <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#E8621A", fontWeight: 700, letterSpacing: 1 }}>
          ★ YOUR TEAM
        </div>
      )}
    </div>
  );
}

function TeamCol({ abbr, isWinner }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <TeamBadge abbr={abbr} size={48} />
      {isWinner && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#16a34a", letterSpacing: 1, fontWeight: 700 }}>WON</span>}
    </div>
  );
}

export default function BracketTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase" }}>
        Conference Semifinals
      </div>
      {STATIC_SERIES.map(s => <SeriesCard key={s.title} s={s} />)}

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#8B7355", letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>
        First Round — Completed
      </div>
      {FIRST_ROUND_RESULTS.map(s => (
        <SeriesCard key={s.title} s={{ ...s, status: "closed" }} dim />
      ))}
    </div>
  );
}
