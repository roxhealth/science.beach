export type CrabColorPalette = {
  base: string;
  mid: string;
  dark: string;
  deepest: string;
  accent: string;
};

export const CRAB_COLOR_PALETTES: CrabColorPalette[] = [
  { base: "#FFD400", mid: "#AA9403", dark: "#735A00", deepest: "#3E2B00", accent: "#F6FF4C" },
  { base: "#D4FF00", mid: "#70AA03", dark: "#607300", deepest: "#283E00", accent: "#F6FF4C" },
  { base: "#FF0700", mid: "#AA0E03", dark: "#730E00", deepest: "#3E0800", accent: "#FF514C" },
  { base: "#FF6200", mid: "#AA3803", dark: "#733600", deepest: "#3E1600", accent: "#FF824C" },
  { base: "#FF00C3", mid: "#AA03A5", dark: "#73006B", deepest: "#3E003E", accent: "#FC4CFF" },
  { base: "#00FFE1", mid: "#03AA9F", dark: "#00736A", deepest: "#003E38", accent: "#4CFFFC" },
  { base: "#0051FF", mid: "#1403AA", dark: "#020073", deepest: "#00033E", accent: "#4C5EFF" },
];

/** Source colors used in the animated crab SVGs (red palette). */
export const CRAB_SOURCE_COLORS = {
  base: "#FF0700",
  mid: "#AA0E03",
  dark: "#730E00",
  deepest: "#3E0800",
  accent: "#FF514C",
} as const;

/** Source colors used in the static crab.svg (lime palette). */
export const STATIC_CRAB_SOURCE_COLORS = {
  base: "#D5FF00",
  mid: "#70AA03",
  dark: "#607300",
  deepest: "#283E00",
  accent: "#F6FF4C",
} as const;

export const CRAB_COLOR_NAMES = [
  "yellow", "lime", "red", "orange", "pink", "cyan", "blue",
] as const;

export type CrabColorName = (typeof CRAB_COLOR_NAMES)[number];

export const CRAB_NAME_TO_INDEX: Record<CrabColorName, number> = {
  yellow: 0, lime: 1, red: 2, orange: 3, pink: 4, cyan: 5, blue: 6,
};

/** Tailwind bg class for each crab color (paired complementary backgrounds). */
export const CRAB_BG_CLASS: Record<CrabColorName, string> = {
  yellow: "bg-green-4",
  lime: "bg-green-4",
  red: "bg-yellow-4",
  orange: "bg-green-4",
  pink: "bg-yellow-4",
  cyan: "bg-yellow-4",
  blue: "bg-green-4",
};

/** Hex background colors for OG image generators (matches CRAB_BG_CLASS). */
export const CRAB_BG_HEX: Record<CrabColorName, string> = {
  yellow: "#67ff4c",
  lime: "#67ff4c",
  red: "#ffda33",
  orange: "#67ff4c",
  pink: "#ffda33",
  cyan: "#ffda33",
  blue: "#67ff4c",
};
