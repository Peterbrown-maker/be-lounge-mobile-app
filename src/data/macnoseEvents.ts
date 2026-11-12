// Be Lounge events and home-screen promos (prototype content).
// PROTOTYPE: dates, times and entry prices below are placeholders — replace them
// with the confirmed details before going live.

export interface MacnoseEvent {
  id: string;
  title: string;
  artist: string;
  genre: string;
  image: any; // require()'d local asset
  /** Event date in South African time, YYYY-MM-DD. */
  date: string;
  /** 24h local times, e.g. "20:00". An end earlier than the start runs past midnight. */
  startTime: string;
  endTime: string;
  /** Entry price in rand; 0 = free entry. */
  entry: number;
  description: string;
  perks: string[];
}

export const MACNOSE_EVENTS: MacnoseEvent[] = [
  {
    id: "dj-maphorisa-2026-11-28",
    title: "Amapiano Saturday",
    artist: "DJ Maphorisa",
    genre: "Amapiano",
    image: require("../assets/macnose/events/dj_maphorisa.jpg"),
    date: "2026-11-28",
    startTime: "20:00",
    endTime: "02:00",
    entry: 150, // PROTOTYPE placeholder
    description:
      "Phori takes over Be Lounge for a full amapiano night. Good food, chilled drinks and feel good music till late. See you there!",
    perks: ["Book a table for your crew", "Bottle specials all night", "Kitchen open till late"],
  },
  {
    id: "mdu-aka-trp-2026-12-04",
    title: "Amapiano Friday",
    artist: "Mdu aka TRP",
    genre: "Amapiano · Private School",
    image: require("../assets/macnose/events/mdu_aka_trp.jpg"),
    date: "2026-12-04",
    startTime: "20:00",
    endTime: "02:00",
    entry: 100, // PROTOTYPE placeholder
    description:
      "Mdu aka TRP brings the deep, soulful private school piano sound to Be Lounge. Come early, grab a platter and stay for the set.",
    perks: ["Book a table for your crew", "Sharing platters & bubbles", "Kitchen open till late"],
  },
];

// ----- date helpers (no Intl dependency, safe on Hermes) -----

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Today's date in South Africa (UTC+2, no DST) as YYYY-MM-DD. */
export function todaySAST(now = new Date()): string {
  return new Date(now.getTime() + 2 * 3600 * 1000).toISOString().slice(0, 10);
}

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "Sat 28 Nov" */
export function formatEventDay(e: MacnoseEvent): string {
  const { m, d, dow } = parts(e.date);
  return `${DAYS[dow]} ${d} ${MONTHS[m - 1]}`;
}

/** "SAT" / "28" / "NOV" for date badges. */
export function eventBadge(e: MacnoseEvent) {
  const { m, d, dow } = parts(e.date);
  return { dow: DAYS[dow].toUpperCase(), day: String(d), month: MONTHS[m - 1].toUpperCase() };
}

/** "Sat 28 Nov · 20:00 – 02:00" */
export function formatEventWhen(e: MacnoseEvent): string {
  return `${formatEventDay(e)} · ${e.startTime} – ${e.endTime}`;
}

export function formatEntry(e: MacnoseEvent): string {
  return e.entry === 0 ? "Free entry" : `R${e.entry} entry`;
}

/** Events today or later (an event stays listed on its own date), soonest first. */
export function upcomingEvents(now = new Date()): MacnoseEvent[] {
  const today = todaySAST(now);
  return MACNOSE_EVENTS.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function isTonight(e: MacnoseEvent, now = new Date()): boolean {
  return e.date === todaySAST(now);
}

// ----- home-screen promo carousel -----

export type PromoTarget =
  | { type: "event"; id: string }
  | { type: "category"; id: string };

export interface Promo {
  id: string;
  kicker: string;
  title: string;
  sub: string;
  image: any;
  cta: string;
  target: PromoTarget;
}

const ev = (id: string) => MACNOSE_EVENTS.find((e) => e.id === id)!;

export const PROMOS: Promo[] = [
  {
    id: "promo-maphorisa",
    kicker: `LIVE · ${formatEventDay(ev("dj-maphorisa-2026-11-28")).toUpperCase()}`,
    title: "DJ Maphorisa",
    sub: "Amapiano Saturday at Be Lounge. Book your table before it's full.",
    image: require("../assets/macnose/events/dj_maphorisa.jpg"),
    cta: "See event",
    target: { type: "event", id: "dj-maphorisa-2026-11-28" },
  },
  {
    id: "promo-mogodu",
    kicker: "EVERY MONDAY",
    title: "Mogodu Monday",
    sub: "Mogodu, tlhogo, tlhakwana & more with pap, rice, ting, samp or dumpling.",
    image: require("../assets/macnose/traditional_food.jpg"),
    cta: "See traditional meals",
    target: { type: "category", id: "traditional" },
  },
  {
    id: "promo-mdu",
    kicker: `LIVE · ${formatEventDay(ev("mdu-aka-trp-2026-12-04")).toUpperCase()}`,
    title: "Mdu aka TRP",
    sub: "Amapiano Friday. Private school piano at Be Lounge.",
    image: require("../assets/macnose/events/mdu_aka_trp.jpg"),
    cta: "See event",
    target: { type: "event", id: "mdu-aka-trp-2026-12-04" },
  },
  {
    id: "promo-midweek",
    kicker: "TUE – THU",
    title: "Midweek specials",
    sub: "Full chicken, fries & 2L Coke R160. Large pizza & 6 KIX R250.",
    image: require("../assets/macnose/full_chicken_coke.jpg"),
    cta: "See specials",
    target: { type: "category", id: "specials" },
  },
  {
    id: "promo-wine-dine",
    kicker: "DAILY",
    title: "Wine & Dine",
    sub: "Steak meal & a glass of wine R110. Whole fish & a glass of wine R160.",
    image: require("../assets/macnose/wine_and_dine_steak.jpeg"),
    cta: "See specials",
    target: { type: "category", id: "specials" },
  },
];
