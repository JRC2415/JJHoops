import TeamBadge from './TeamBadge.jsx';
import StatusDot from './StatusDot.jsx';
import { MY_TEAMS, TEAM_META, TEAM_COLORS } from '../constants.js';

export default function GameCard({ game }) {
  const { away, home, awayName, homeName, awaySeed, homeSeed,
          awayScore, homeScore, awayProb, homeProb,
          status, quarter, clock, gameTime, title } = game;

  const isLive  = status === "inprogress";
  const isFinal = status === "closed";
  const awayWin = isFinal && awayScore > homeScore;
  const homeWin = isFinal && homeScore > awayScore;

  const highlight = MY_TEAMS.find(t => t === away || t === home);
  const meta      = highlight ? TEAM_META[highlight] : null;

  return (
    <div className="glass animate-fadeup" style={{
      borderRadius: 12,
      border: `1.5px solid ${meta ? meta.color + "55" : "rgba(200,137,58,0.25)"}`,
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
      boxShadow: meta ? `0 0 20px ${meta.color}20` : undefined,
      position: "relative", overflow: "hidden",
    }}>
      {meta && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${meta.color}, ${meta.accent || meta.color})` }} />}

      {/* Status row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StatusDot status={status} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600, color: "#8B7355", letterSpacing: 0.5 }}>
          {title}
        </span>
      </div>

      {/* Teams */}
      <TeamRow abbr={away} name={awayName} seed={awaySeed} score={awayScore} prob={awayProb} isWinner={awayWin} status={status} isHome={false} />
      <TeamRow abbr={home} name={homeName} seed={homeSeed} score={homeScore} prob={homeProb} isWinner={homeWin} status={status} isHome />

      {/* Footer: live clock OR Argentina tipoff time */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {isLive && clock ? (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, color: "#16a34a", fontWeight: 700, letterSpacing: 1 }}>
            Q{quarter} · {clock}
          </span>
        ) : isFinal ? (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#8B7355" }}>Final</span>
        ) : null}

        {/* Always show Argentina time */}
        {gameTime && (
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
            color: isLive ? "#16a34a" : status === "scheduled" ? "#E8621A" : "#8B7355",
            fontWeight: 600, marginLeft: "auto",
          }}>
            🕐 {gameTime} ARG
          </span>
        )}
      </div>
    </div>
  );
}

function TeamRow({ abbr, name, seed, score, prob, isWinner, status, isHome }) {
  const showScore = status === "inprogress" || status === "closed";
  const teamColor = TEAM_COLORS[abbr] || "#8B5E1A";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <TeamBadge abbr={abbr} size={40} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: isWinner ? 900 : 600, fontSize: 18,
          color: isWinner ? teamColor : "#3D2B10", letterSpacing: 0.2,
        }}>
          {name}
        </span>
        {seed != null && (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#8B7355", fontWeight: 600 }}>
            #{seed}
          </span>
        )}
        {isHome && (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#C8893A", letterSpacing: 1, fontWeight: 700 }}>HOME</span>
        )}
      </div>
      {showScore && score != null && (
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: isWinner ? teamColor : "#8B7355", letterSpacing: 1 }}>
          {score}
        </span>
      )}
      {status === "scheduled" && prob != null && (
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#8B7355", fontWeight: 600 }}>
          {prob}%
        </span>
      )}
    </div>
  );
}
