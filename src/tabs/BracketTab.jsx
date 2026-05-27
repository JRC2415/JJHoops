import { useState, useEffect } from "react";
import TeamBadge from '../components/TeamBadge.jsx';
import { MY_TEAMS, TEAM_COLORS } from '../constants.js';

// ESPN uses "SA" but we use "SAS" — normalize here
const ABBR_FIX = { "SA": "SAS", "GS": "GSW", "NY": "NYK", "NO": "NOP", "PHO": "PHX", "CHA": "CHA" };
function fixAbbr(a) {
  if (!a) return null;
  const up = a.toUpperCase();
  return ABBR_FIX[up] || up;
}

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

function statusLabel(s) {
  if (!s) return { text: "○ UPCOMING", color: "#8B7355" };
  const u = s.toUpperCase();
  if (u.includes("PROGRESS") || u === "IN_PROGRESS") return { text: "● LIVE",     color: "#E8621A" };
  if (u.includes("FINAL")    || u === "CLOSED")      return { text: "✓ FINAL",    color: "#16a34a" };
  return                                                     { text: "○ UPCOMING", color: "#8B7355" };
}

// ESPN round label from notes or competition type
function getRoundLabel(event) {
  const note = event.competitions?.[0]?.notes?.[0]?.headline || "";
  if (note) return note; // e.g. "West Finals - Game 6"
  const type = event.competitions?.[0]?.type?.abbreviation || "";
  if (type === "FINAL" || type === "CHAMP") return "NBA Finals";
  if (type === "CONF")  return "Conference Finals";
  if (type === "SEMI")  return "Conference Semifinals";
  return "First Round";
}

function getRoundNumber(event) {
  const label = getRoundLabel(event).toLowerCase();
  if (label.includes("nba final") || label.includes("champ")) return 4;
  if (label.includes("conf") && label.includes("final"))      return 3;
  if (label.includes("semi"))                                  return 2;
  return 1;
}

// Parse ESPN scoreboard events into series cards
function parseFromScoreboard(data) {
  const events = data?.scoreboard?.events || [];
  if (!events.length) return null;

  // Group by series ID to deduplicate (multiple games same series)
  const seriesMap = {};

  for (const event of events) {
    const comp       = event.competitions?.[0];
    if (!comp) continue;
    const seriesData = comp.series;
    if (!seriesData) continue;

    const competitors = seriesData.competitors || [];
    const t1raw = comp.competitors?.find(c => c.homeAway === "home")?.team?.abbreviation;
    const t2raw = comp.competitors?.find(c => c.homeAway === "away")?.team?.abbreviation;
    const t1 = fixAbbr(t1raw);
    const t2 = fixAbbr(t2raw);
    if (!t1 || !t2) continue;

    // Use competitor IDs to build a stable series key
    const ids = [comp.competitors[0]?.id, comp.competitors[1]?.id].sort().join("-");

    if (!seriesMap[ids]) {
      const homeComp = competitors.find(c => c.id === comp.competitors[0]?.id);
      const awayComp = competitors.find(c => c.id === comp.competitors[1]?.id);
      const t1wins = homeComp?.wins ?? 0;
      const t2wins = awayComp?.wins ?? 0;
      const status  = comp.status?.type?.name || "STATUS_SCHEDULED";
      const roundNum = getRoundNumber(event);
      const label    = getRoundLabel(event).split(" - ")[0]; // "West Finals" not "West Finals - Game 6"

      // Is the whole series done?
      const seriesDone = seriesData.completed === true;
      const winner = seriesDone
        ? (t1wins > t2wins ? t1 : t2wins > t1wins ? t2 : null)
        : null;

      // Next game time — if this event is upcoming, use its time
      const isUpcoming = status === "STATUS_SCHEDULED";
      const nextTime   = isUpcoming ? argTime(event.date) : null;
      const seriesSummary = seriesData.summary || "";

      seriesMap[ids] = {
        id: ids, round: roundNum, label,
        status: seriesDone ? "closed" : status.includes("PROGRESS") ? "inprogress" : "scheduled",
        t1, t2,
        t1wins: Number(t1wins),
        t2wins: Number(t2wins),
        winner,
        nextTime,
        summary: seriesSummary,
      };
    } else {
      // Update with latest game time if scheduled
      const status = comp.status?.type?.name || "";
      if (status === "STATUS_SCHEDULED") {
        seriesMap[ids].nextTime = argTime(event.date);
      }
    }
  }

  const result = Object.values(seriesMap);
  result.sort((a, b) => b.round - a.round);
  return result.length ? result : null;
}

function SeriesCard({ s, big }) {
  const sl   = statusLabel(s.status);
  const c1   = TEAM_COLORS[s.t1] || "#8B5E1A";
  const c2   = TEAM_COLORS[s.t2] || "#8B5E1A";
  const isMe = MY_TEAMS.includes(s.t1) || MY_TEAMS.includes(s.t2);

  return (
    <div className="glass" style={{
      borderRadius: 12, padding: big ? "18px 20px" : "12px 16px",
      border: isMe ? `1.5px solid ${c1}50` : "1px solid rgba(200,137,58,0.2)",
      marginBottom: 8,
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span>{s.label}</span>
        <span style={{ color: sl.color, fontWeight: 700 }}>{sl.text}</span>
        {s.summary && <span style={{ color: "#8B7355", marginLeft: "auto" }}>{s.summary}</span>}
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

      {s.nextTime && s.status !== "closed" && (
        <div style={{ textAlign: "center", marginTop: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#E8621A", fontWeight: 600 }}>
          Next game: {s.nextTime} ARG
        </div>
      )}
      {isMe && (
        <div style={{ textAlign: "center", marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", fontWeight: 700, letterSpacing: 1 }}>
          ★ YOUR TEAM
        </div>
      )}
    </div>
  );
}

export default function BracketTab() {
  const [series,      setSeries]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 8000);
        const res        = await fetch("/api/bracket", { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data   = await res.json();
        const parsed = parseFromScoreboard(data);
        if (parsed) {
          setSeries(parsed);
          setLastUpdated(new Date());
        } else {
          setError("no-data");
        }
      } catch (e) {
        setError(e.name === "AbortError" ? "timeout" : e.message);
      }
      setLoading(false);
    }
    load();
  }, []);

  const finals     = series.filter(s => s.round === 4);
  const confFinals = series.filter(s => s.round === 3);
  const semis      = series.filter(s => s.round === 2);
  const first      = series.filter(s => s.round === 1);

  if (loading) return (
    <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#8B7355" }}>Loading bracket…</div>
    </div>
  );

  if (error || series.length === 0) return (
    <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#8B7355" }}>
        No active playoff bracket right now. Check back when the playoffs begin!
      </div>
    </div>
  );

  const Section = ({ label, items }) => items.length === 0 ? null : (
    <>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>{label}</div>
      {items.map(s => <SeriesCard key={s.id} s={s} />)}
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {finals.length > 0 && (
        <>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>🏆 NBA Finals</div>
          {finals.map(s => <SeriesCard key={s.id} s={s} big />)}
        </>
      )}
      <Section label="Conference Finals"   items={confFinals} />
      <Section label="Conference Semifinals" items={semis} />
      <Section label="First Round"         items={first} />

      {lastUpdated && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", textAlign: "center", marginTop: 12 }}>
          Updated {lastUpdated.toLocaleTimeString("en-US", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", minute: "2-digit" })} ARG
        </div>
      )}
    </div>
  );
}
