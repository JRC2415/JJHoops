import TeamBadge from '../components/TeamBadge.jsx';
import { MY_TEAMS, EAST_STANDINGS, WEST_STANDINGS, TEAM_COLORS } from '../constants.js';
import { useState } from 'react';

function StandingsTable({ rows }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px",
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#8B7355", letterSpacing: 1.5, textTransform: "uppercase" }}>
        <span style={{ width: 20, textAlign: "center" }}>#</span>
        <span style={{ width: 44 }}></span>
        <span style={{ flex: 1 }}>Team</span>
        <span style={{ width: 28, textAlign: "center" }}>W</span>
        <span style={{ width: 28, textAlign: "center" }}>L</span>
        <span style={{ width: 44, textAlign: "center" }}>PCT</span>
      </div>

      {rows.map((row, i) => {
        const pct = (row.w / (row.w + row.l)).toFixed(3).replace(/^0/, "");
        const isMyTeam = MY_TEAMS.includes(row.team);
        const teamColor = TEAM_COLORS[row.team] || "#8B5E1A";
        const isPlayoffLine = i === 5; // after 6th
        const isPlayInLine  = i === 9; // after 10th
        return (
          <div key={row.team}>
            {isPlayoffLine && (
              <div style={{ height: 1, background: "#16a34a40", margin: "4px 0", position: "relative" }}>
                <span style={{ position: "absolute", right: 0, top: -8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#16a34a", letterSpacing: 1 }}>PLAY-IN STARTS →</span>
              </div>
            )}
            {isPlayInLine && (
              <div style={{ height: 1, background: "#CE114140", margin: "4px 0", position: "relative" }}>
                <span style={{ position: "absolute", right: 0, top: -8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#CE1141", letterSpacing: 1 }}>LOTTERY STARTS →</span>
              </div>
            )}
            <div className={isMyTeam ? "glass" : ""} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 8,
              background: isMyTeam ? undefined : i % 2 === 0 ? "rgba(200,137,58,0.06)" : "transparent",
              border: isMyTeam ? `1px solid ${teamColor}40` : "1px solid transparent",
            }}>
              <span style={{ width: 20, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: isMyTeam ? teamColor : "#8B7355" }}>{row.rank}</span>
              <TeamBadge abbr={row.team} size={32} />
              <span style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: isMyTeam ? 700 : 600, fontSize: 16,
                color: isMyTeam ? teamColor : "#3D2B10" }}>
                {row.name}
                {isMyTeam && <span style={{ marginLeft: 6, fontSize: 12, color: teamColor }}>★</span>}
              </span>
              <span style={{ width: 28, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#3D2B10" }}>{row.w}</span>
              <span style={{ width: 28, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#8B7355" }}>{row.l}</span>
              <span style={{ width: 44, textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: "#6b5c45" }}>{pct}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StandingsTab() {
  const [conf, setConf] = useState("east");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#6b5c45", letterSpacing: 1.5, textTransform: "uppercase" }}>
        2025–26 Final Regular Season Standings
      </div>

      {/* Conference toggle */}
      <div className="glass" style={{ display: "flex", borderRadius: 10, overflow: "hidden", padding: 3, gap: 3 }}>
        {["east", "west"].map(c => (
          <button key={c} onClick={() => setConf(c)} style={{
            flex: 1, background: conf === c ? "#E8621A" : "transparent",
            border: "none", borderRadius: 8, padding: "8px 0", cursor: "pointer",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1,
            color: conf === c ? "#fff" : "#8B7355",
            transition: "all 0.2s",
          }}>
            {c === "east" ? "Eastern" : "Western"}
          </button>
        ))}
      </div>

      <div className="glass" style={{ borderRadius: 12, padding: "12px 4px" }}>
        <StandingsTable rows={conf === "east" ? EAST_STANDINGS : WEST_STANDINGS} />
      </div>
    </div>
  );
}
