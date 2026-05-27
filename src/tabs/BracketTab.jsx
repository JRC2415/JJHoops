import { useState, useEffect } from "react";
import TeamBadge from '../components/TeamBadge.jsx';
import { MY_TEAMS, TEAM_COLORS } from '../constants.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
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
  if (s === "inprogress" || s === "STATUS_IN_PROGRESS") return { text: "● LIVE",     color: "#E8621A" };
  if (s === "closed"     || s === "STATUS_FINAL")       return { text: "✓ FINAL",    color: "#16a34a" };
  return                                                        { text: "○ UPCOMING", color: "#8B7355" };
}

// Safe team abbreviation — never crashes on TBD or unknown
function safeAbbr(abbr) {
  if (!abbr || abbr === "TBD" || abbr.length > 5) return null;
  return abbr.toUpperCase();
}

// ── Parse ESPN playoff series into our shape ─────────────────────────────────
function parseSeries(data) {
  // Try playoff-series endpoint first
  let series = data?.series || data?.children?.flatMap(c => c.series || []) || [];

  // Fallback: build series from scoreboard events
  if (!series.length && data?.scoreboard?.events) {
    // Group events by series description
    const map = {};
    for (const e of data.scoreboard.events) {
      const key = e.seriesSummary?.series?.id || e.id;
      if (!map[key]) map[key] = { events: [], summary: e.seriesSummary };
      map[key].events.push(e);
    }
    series = Object.values(map).map(g => ({
      _fromScoreboard: true,
      summary: g.summary,
      events: g.events,
    }));
  }

  if (!series.length) return null;

  const result = [];

  for (const s of series) {
    try {
      // ESPN playoff-series shape
      const competitors = s.competitors || s.participants || [];
      const t1raw = competitors[0]?.team?.abbreviation || competitors[0]?.abbreviation || competitors[0]?.team;
      const t2raw = competitors[1]?.team?.abbreviation || competitors[1]?.abbreviation || competitors[1]?.team;
      const t1 = safeAbbr(t1raw);
      const t2 = safeAbbr(t2raw);

      // Skip if we can't identify both teams yet (TBD matchups)
      if (!t1 || !t2) continue;

      const t1wins = competitors[0]?.wins ?? competitors[0]?.record ?? 0;
      const t2wins = competitors[1]?.wins ?? competitors[1]?.record ?? 0;
      const status = s.status?.type?.name || s.status || "scheduled";
      const roundNum = s.round?.number || s.roundNumber || 1;
      const roundNames = { 1: "First Round", 2: "Conference Semifinals", 3: "Conference Finals", 4: "NBA Finals" };
      const conf = s.conference?.abbreviation || s.title?.toLowerCase().includes("east") ? "EC" : "WC";

      const winner = (status === "closed" || status === "STATUS_FINAL")
        ? (t1wins > t2wins ? t1 : t2wins > t1wins ? t2 : null)
        : null;

      const nextGame = s.nextEvent?.[0];
      const nextTime = nextGame ? argTime(nextGame.date) : null;

      result.push({
        id:       s.id || `${t1}-${t2}`,
        round:    roundNum,
        label:    s.title || `${roundNames[roundNum] || "Round " + roundNum}`,
        status:   status === "STATUS_IN_PROGRESS" ? "inprogress" : status === "STATUS_FINAL" ? "closed" : status,
        t1, t2,
        t1wins: Number(t1wins),
        t2wins: Number(t2wins),
        winner,
        nextTime,
      });
    } catch { continue; }
  }

  // Sort by round descending (Finals first)
  result.sort((a, b) => b.round - a.round);
  return result.length ? result : null;
}

// ── Components ───────────────────────────────────────────────────────────────
function SeriesCard({ s, big }) {
  const sl     = statusLabel(s.status);
  const c1     = TEAM_COLORS[s.t1] || "#8B5E1A";
  const c2     = TEAM_COLORS[s.t2] || "#8B5E1A";
  const isMe   = MY_TEAMS.includes(s.t1) || MY_TEAMS.includes(s.t2);

  return (
    <div className="glass" style={{
      borderRadius: 12, padding: big ? "18px 20px" : "12px 16px",
      border: isMe ? `1.5px solid ${c1}50` : "1px solid rgba(200,137,58,0.2)",
      marginBottom: 8,
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}>
        <span>{s.label}</span>
        <span style={{ color: sl.color, fontWeight: 700 }}>{sl.text}</span>
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
          Next: {s.nextTime} ARG
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

// ── Main tab ─────────────────────────────────────────────────────────────────
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
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch("/api/bracket", { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        const parsed = parseSeries(data);
        if (parsed) {
          setSeries(parsed);
          setLastUpdated(new Date());
        } else {
          setError("No playoff data available right now");
        }
      } catch (e) {
        setError(e.name === "AbortError" ? "Request timed out" : e.message);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Group by round
  const finals    = series.filter(s => s.round === 4);
  const confFinals = series.filter(s => s.round === 3);
  const semis     = series.filter(s => s.round === 2);
  const first     = series.filter(s => s.round === 1);

  // Off-season: no series found
  const playoffsOver = !loading && !error && series.length > 0 &&
    series.every(s => s.status === "closed") &&
    finals.length > 0 && finals[0].winner;

  if (loading) return (
    <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#8B7355" }}>Loading bracket…</div>
    </div>
  );

  if (error) return (
    <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#8B7355" }}>
        {error.includes("No playoff") ? "No active playoff bracket right now. Check back when the playoffs begin!" : `Could not load bracket: ${error}`}
      </div>
    </div>
  );

  if (playoffsOver) return (
    <div className="glass" style={{ borderRadius: 14, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#E8621A", letterSpacing: 1 }}>
        {finals[0].winner} are NBA Champions!
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#6b5c45", marginTop: 8 }}>
        The bracket will return next season.
      </div>
    </div>
  );

  const Section = ({ label, children }) => children?.length ? (
    <>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#6b5c45", letterSpacing: 2, textTransform: "uppercase", margin: "12px 0 4px" }}>{label}</div>
      {children}
    </>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {finals.length > 0 && (
        <>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#E8621A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>🏆 NBA Finals</div>
          {finals.map(s => <SeriesCard key={s.id} s={s} big />)}
        </>
      )}
      <Section label="Conference Finals">{confFinals.map(s => <SeriesCard key={s.id} s={s} />)}</Section>
      <Section label="Conference Semifinals">{semis.map(s => <SeriesCard key={s.id} s={s} />)}</Section>
      <Section label="First Round">{first.map(s => <SeriesCard key={s.id} s={s} />)}</Section>

      {lastUpdated && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#8B7355", textAlign: "center", marginTop: 12 }}>
          Updated {lastUpdated.toLocaleTimeString("en-US", { timeZone: "America/Argentina/Buenos_Aires", hour: "numeric", minute: "2-digit" })} ARG
        </div>
      )}
    </div>
  );
}
