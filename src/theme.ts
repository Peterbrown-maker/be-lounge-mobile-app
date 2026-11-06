// Makhanani design tokens — light by default: white canvas, near-black type,
// one ember accent for the fire. Use these instead of hard-coded colours.
export const T = {
  bg: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceAlt: "#FAFAFA",
  border: "#E5E5E5",
  text: "#0A0A0A",
  muted: "#737373",
  placeholder: "#A3A3A3",
  ember: "#FF6B1A",
  /** Darker ember for small text/icons on white (readable contrast). */
  emberText: "#C2410C",
  emberSoft: "rgba(255,107,26,0.12)",
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
