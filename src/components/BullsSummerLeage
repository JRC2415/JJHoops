import { BULLS_SUMMER_GAMES, TEAM_COLORS } from '../constants.js';

const CHI_RED  = "#CE1141";
const SUN_GOLD = "#FFB800";
const SKY      = "#54C5F8";

function gameStatus(game) {
  const now      = new Date();
  const gameDate = new Date(`${game.date}T00:00:00-03:00`);
  const daysDiff = Math.floor((gameDate - now) / 86400000);
  if (game.bullsScore !== undefined && game.oppScore !== undefined) return "final";
  if (daysDiff < 0) return "past";
  if (daysDiff === 0) return "today";
  return "upcoming";
}

function GameCard({ game }) {
  const status   = gameStatus(game);
  const isFinal  = status === "final";
  const isToday  = status === "today";
  const isPast   = status === "past";
  const bullsWon = isFinal && game.bullsScore > game.oppScore;
  const bullsLost = isFinal && game.bullsScore < game.oppScore;
  const gameDate = new Date(`${game.date}T12:00:00-03:00`);

  return (
    <div style={{
      borderRadius: 12,
      background: isToday ? `linear-gradient(135deg, ${CHI_RED}22, ${SUN_GOLD}22)` : isFinal ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.45)",
      border: isToday ? `2px solid ${CHI_RED}` : isFinal ? "1px solid rgba(206,17,65,0.2)" : "1px solid rgba(200,137,58,0.2)",
      padding: "12px 14px", position: "relative", overflow: "hidden",
    }}>
      {isToday && (
        <div style={{ position: "absolute", top: 8, right: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: 10, color: CHI_RED, letterSpacing: 1.5, fontWeight: 700 }}>
          🏀 TODAY
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: 52 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: isPast && !isFinal ? "#8B7355" : CHI_RED, lineHeight: 1 }}>
            {gameDate.toLocaleDateString("en-US", { timeZone: "America/Argentina/Buenos_Aires", day: "numeric" })}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", letterSpacing: 1, textTransform: "uppercase" }}>
            {gameDate.toLocaleDateString("en-US", { timeZone: "America/Argentina/Buenos_Aires", month: "short" })}
          </div>
        </div>
        <div style={{ width: 1, height: 36, background: "rgba(200,137,58,0.25)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: CHI_RED, letterSpacing: 1 }}>CHI</span>
            {isFinal ? (
              <>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: bullsWon ? CHI_RED : "#8B7355" }}>{game.bullsScore}</span>
                <span style={{ color: "#C8893A", fontWeight: 700 }}>–</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: bullsLost ? (TEAM_COLORS[game.oppAbbr] || "#8B7355") : "#8B7355" }}>{game.oppScore}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: TEAM_COLORS[game.oppAbbr] || "#8B7355", letterSpacing: 1 }}>{game.oppAbbr}</span>
              </>
            ) : (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#6b5c45", fontWeight: 600 }}>{game.location}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {!isFinal && <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: TEAM_COLORS[game.oppAbbr] || "#8B7355", letterSpacing: 1 }}>{game.oppAbbr}</span>}
            {isFinal && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355" }}>{game.location}</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {isFinal ? (
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 1, color: bullsWon ? "#16a34a" : "#8B7355" }}>
              {bullsWon ? "WIN 🎉" : bullsLost ? "LOSS" : "FINAL"}
            </div>
          ) : isPast ? (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355" }}>No score yet</div>
          ) : (
            <>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#3D2B10", letterSpacing: 0.5 }}>{game.timeArg}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355" }}>ARG · {game.timeCT}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BullsSummerLeague({ compact = false }) {
  const now   = new Date();
  const slEnd = new Date("2026-07-22T00:00:00-03:00");
  if (now > slEnd) return null;

  const daysToStart = Math.max(0, Math.ceil((new Date("2026-07-09T00:00:00-03:00") - now) / 86400000));
  const started = now >= new Date("2026-07-09T00:00:00-03:00");

  return (
    <div style={{
      borderRadius: 16,
      background: `linear-gradient(135deg, ${CHI_RED}15 0%, ${SUN_GOLD}10 50%, ${SKY}10 100%)`,
      border: `1.5px solid ${CHI_RED}40`,
      padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 24 }}>☀️</div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: CHI_RED, letterSpacing: 1, lineHeight: 1 }}>
            Bulls Summer League
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#8B7355", letterSpacing: 1, marginTop: 1 }}>
            NBA Summer League 2026 · Las Vegas
          </div>
        </div>
        {!started && (
          <div style={{ marginLeft: "auto", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: SUN_GOLD, lineHeight: 1 }}>{daysToStart}d</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#8B7355", letterSpacing: 1, textTransform: "uppercase" }}>to tip-off</div>
          </div>
        )}
        {started && (
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: CHI_RED, fontWeight: 700, letterSpacing: 1 }}>● IN PROGRESS</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BULLS_SUMMER_GAMES.map(game => <GameCard key={game.id} game={game} />)}
      </div>

      <div style={{ marginTop: 10, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", textAlign: "center" }}>
        All times Argentina (ARG) · Schedule subject to change
      </div>
    </div>
  );
}
