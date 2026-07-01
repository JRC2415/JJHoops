export const MY_TEAMS = ["CHI", "LAL", "DEN"];

export const TEAM_META = {
  CHI: { name: "Chicago Bulls",     city: "Chicago",     color: "#CE1141", accent: "#000000", emoji: "🐂" },
  LAL: { name: "LA Lakers",         city: "Los Angeles", color: "#552583", accent: "#FDB927", emoji: "👑" },
  DEN: { name: "Denver Nuggets",    city: "Denver",      color: "#0E2240", accent: "#FEC524", emoji: "⛰️" },
};

export const TEAM_COLORS = {
  CHI: "#CE1141", LAL: "#552583", DEN: "#0E2240",
  NYK: "#006BB6", PHI: "#006BB6", BOS: "#007A33",
  SAS: "#8A8D8F", MIN: "#0C2340", OKC: "#007AC1",
  DET: "#C8102E", CLE: "#860038", ORL: "#0077C0",
  ATL: "#E03A3E", HOU: "#CE1141", TOR: "#CE1141",
  POR: "#E03A3E", PHX: "#1D1160", MEM: "#5D76A9",
  MIA: "#98002E", IND: "#002D62", MIL: "#00471B",
  GSW: "#1D428A", SAC: "#5A2D81", UTA: "#002B5C",
  NOP: "#0C2340", DAL: "#00538C", WAS: "#002B5C",
  CHA: "#1D1160", BKN: "#1D1160", LAC: "#C8102E",
};

// Key NBA dates 2026
export const NBA_DRAFT_LOTTERY = new Date("2026-05-10T20:00:00");
export const NBA_DRAFT          = new Date("2026-06-23T19:00:00");

export const STATIC_SERIES = [
  { title: "EC Semis · NYK vs PHI", round: 2, status: "inprogress", t1: "NYK", t1r: 1, t2: "PHI", t2r: 0 },
  { title: "EC Semis · DET vs CLE", round: 2, status: "scheduled",  t1: "DET", t1r: 0, t2: "CLE", t2r: 0 },
  { title: "WC Semis · SAS vs MIN", round: 2, status: "inprogress", t1: "SAS", t1r: 0, t2: "MIN", t2r: 0 },
  { title: "WC Semis · OKC vs LAL", round: 2, status: "scheduled",  t1: "OKC", t1r: 0, t2: "LAL", t2r: 0 },
];

export const FIRST_ROUND_RESULTS = [
  { title: "PHI def. BOS", t1: "PHI", t1r: 4, t2: "BOS", t2r: 3 },
  { title: "NYK def. ATL", t1: "NYK", t1r: 4, t2: "ATL", t2r: 2 },
  { title: "DET def. ORL", t1: "DET", t1r: 4, t2: "ORL", t2r: 3 },
  { title: "CLE def. TOR", t1: "CLE", t1r: 4, t2: "TOR", t2r: 3 },
  { title: "LAL def. HOU", t1: "LAL", t1r: 4, t2: "HOU", t2r: 2 },
  { title: "OKC def. PHX", t1: "OKC", t1r: 4, t2: "PHX", t2r: 0 },
  { title: "MIN def. DEN", t1: "MIN", t1r: 4, t2: "DEN", t2r: 2 },
  { title: "SAS def. POR", t1: "SAS", t1r: 4, t2: "POR", t2r: 1 },
];

export const EAST_STANDINGS = [
  { rank:  1, team: "DET", name: "Detroit Pistons",        w: 56, l: 26 },
  { rank:  2, team: "BOS", name: "Boston Celtics",         w: 54, l: 28 },
  { rank:  3, team: "NYK", name: "New York Knicks",        w: 51, l: 31 },
  { rank:  4, team: "CLE", name: "Cleveland Cavaliers",    w: 50, l: 32 },
  { rank:  5, team: "TOR", name: "Toronto Raptors",        w: 46, l: 36 },
  { rank:  6, team: "ATL", name: "Atlanta Hawks",          w: 44, l: 38 },
  { rank:  7, team: "PHI", name: "Philadelphia 76ers",     w: 43, l: 39 },
  { rank:  8, team: "ORL", name: "Orlando Magic",          w: 41, l: 41 },
  { rank:  9, team: "MIA", name: "Miami Heat",             w: 38, l: 44 },
  { rank: 10, team: "MIL", name: "Milwaukee Bucks",        w: 36, l: 46 },
  { rank: 11, team: "IND", name: "Indiana Pacers",         w: 35, l: 47 },
  { rank: 12, team: "CHI", name: "Chicago Bulls",          w: 33, l: 49 },
  { rank: 13, team: "BKN", name: "Brooklyn Nets",          w: 22, l: 60 },
  { rank: 14, team: "WAS", name: "Washington Wizards",     w: 20, l: 62 },
  { rank: 15, team: "CHA", name: "Charlotte Hornets",      w: 18, l: 64 },
];

export const WEST_STANDINGS = [
  { rank:  1, team: "OKC", name: "Oklahoma City Thunder",  w: 63, l: 19 },
  { rank:  2, team: "SAS", name: "San Antonio Spurs",      w: 58, l: 24 },
  { rank:  3, team: "DEN", name: "Denver Nuggets",         w: 55, l: 27 },
  { rank:  4, team: "LAL", name: "Los Angeles Lakers",     w: 52, l: 30 },
  { rank:  5, team: "HOU", name: "Houston Rockets",        w: 49, l: 33 },
  { rank:  6, team: "MIN", name: "Minnesota Timberwolves", w: 47, l: 35 },
  { rank:  7, team: "POR", name: "Portland Trail Blazers", w: 43, l: 39 },
  { rank:  8, team: "PHX", name: "Phoenix Suns",           w: 40, l: 42 },
  { rank:  9, team: "GSW", name: "Golden State Warriors",  w: 38, l: 44 },
  { rank: 10, team: "DAL", name: "Dallas Mavericks",       w: 35, l: 47 },
  { rank: 11, team: "SAC", name: "Sacramento Kings",       w: 33, l: 49 },
  { rank: 12, team: "MEM", name: "Memphis Grizzlies",      w: 30, l: 52 },
  { rank: 13, team: "NOP", name: "New Orleans Pelicans",   w: 25, l: 57 },
  { rank: 14, team: "UTA", name: "Utah Jazz",              w: 21, l: 61 },
  { rank: 15, team: "LAC", name: "LA Clippers",            w: 19, l: 63 },
];// ── NBA Summer League 2026 ───────────────────────────────────────────────────
export const SUMMER_LEAGUE_START = new Date("2026-07-09T00:00:00-03:00");

// Bulls summer league schedule — ARG times (CT + 2hrs)
// To add scores after each game: add bullsScore and oppScore fields
export const BULLS_SUMMER_GAMES = [
  {
    id: "sl1",
    date: "2026-07-10",
    opponent: "Memphis Grizzlies",
    oppAbbr: "MEM",
    location: "at Memphis",
    isHome: false,
    timeArg: "9:00 PM",
    timeCT: "7:00 PM CT",
  },
  {
    id: "sl2",
    date: "2026-07-13",
    opponent: "Utah Jazz",
    oppAbbr: "UTA",
    location: "at Utah",
    isHome: false,
    timeArg: "10:00 PM",
    timeCT: "8:00 PM CT",
  },
  {
    id: "sl3",
    date: "2026-07-14",
    opponent: "Washington Wizards",
    oppAbbr: "WAS",
    location: "vs Washington",
    isHome: true,
    timeArg: "9:00 PM",
    timeCT: "7:00 PM CT",
  },
  {
    id: "sl4",
    date: "2026-07-16",
    opponent: "Los Angeles Lakers",
    oppAbbr: "LAL",
    location: "vs Lakers",
    isHome: true,
    timeArg: "7:00 PM",
    timeCT: "5:00 PM CT",
  },
];
