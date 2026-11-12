// Be Lounge design tokens, taken from the logo: deep blue-black ink, white, and
// the steel/silver of the logo's gloss. White canvas with ink as the accent;
// on dark surfaces (photos, ink cards) the accent flips to white/silver.
// Use these instead of hard-coded colours.
export const T = {
  bg: "#FFFFFF",
  surface: "#F3F4F6",
  surfaceAlt: "#F9FAFB",
  border: "#E2E4E8",
  text: "#03060E",
  muted: "#6B7079",
  placeholder: "#A2A7AF",
  /** Primary accent: logo ink (buttons, active states, badges). */
  ember: "#0B0F19",
  /** Steel from the logo gloss: kickers, links, small accent text on white. */
  emberText: "#4B515C",
  emberSoft: "rgba(11,15,25,0.07)",
  /** Light silver: accent text/icons on ink or photo backgrounds. */
  silver: "#C9CED6",
  success: "#16A34A",
  successSoft: "rgba(22,163,74,0.12)",
  danger: "#DC2626",
  dangerSoft: "rgba(220,38,38,0.10)",
  onDark: "#FFFFFF",
} as const;

export const R = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

/** Shared text styles. */
export const type = {
  title: { color: T.text, fontSize: 22, fontWeight: "800" as const, letterSpacing: -0.3 },
  section: { color: T.text, fontSize: 17, fontWeight: "700" as const },
  body: { color: T.text, fontSize: 15 },
  caption: { color: T.muted, fontSize: 13 },
  kicker: { color: T.emberText, fontSize: 12, fontWeight: "800" as const, letterSpacing: 1.4 },
};

/** Common card look (light grey, rounded, no shadow). */
export const card = {
  backgroundColor: T.surface,
  borderRadius: R.lg,
  padding: 16,
} as const;
