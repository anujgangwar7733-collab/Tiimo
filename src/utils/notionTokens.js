/**
 * Design Tokens extracted from Notion DESIGN.md specification
 * getdesign.md/notion/design-md
 */
export const NOTION_COLORS = {
  primary: "#5645d4",
  primaryPressed: "#4534b3",
  primaryDeep: "#3a2a99",
  onPrimary: "#ffffff",
  brandNavy: "#0a1530",
  brandNavyDeep: "#070f24",
  brandNavyMid: "#1a2a52",
  linkBlue: "#0075de",
  linkBluePressed: "#005bab",
  brandOrange: "#dd5b00",
  brandOrangeDeep: "#793400",
  brandPink: "#ff64c8",
  brandPinkDeep: "#a02e6d",
  brandPurple: "#7b3ff2",
  brandPurple300: "#d6b6f6",
  brandPurple800: "#391c57",
  brandTeal: "#2a9d99",
  brandGreen: "#1aae39",
  brandYellow: "#f5d75e",
  brandBrown: "#523410",

  // Pastel Card Tints from Notion DESIGN.md
  cardTintPeach: "#ffe8d4",
  cardTintRose: "#fde0ec",
  cardTintMint: "#d9f3e1",
  cardTintLavender: "#e6e0f5",
  cardTintSky: "#dcecfa",
  cardTintYellow: "#fef7d6",
  cardTintYellowBold: "#f9e79f",
  cardTintCream: "#f8f5e8",
  cardTintGray: "#f0eeec",

  // Surfaces & Hairlines
  canvas: "#ffffff",
  surface: "#f6f5f4",
  surfaceSoft: "#fafaf9",
  hairline: "#e5e3df",
  hairlineSoft: "#ede9e4",
  hairlineStrong: "#c8c4be",

  // Inks & Grays
  inkDeep: "#000000",
  ink: "#1a1a1a",
  charcoal: "#37352f",
  slate: "#5d5b54",
  steel: "#787671",
  stone: "#a4a097",
  muted: "#bbb8b1",
  onDark: "#ffffff",
  onDarkMuted: "#a4a097",

  // Semantic
  semanticSuccess: "#1aae39",
  semanticWarning: "#dd5b00",
  semanticError: "#e03131",
};

export const NOTION_TINTS = [
  { id: 'lavender', name: 'Lavender', bg: '#e6e0f5', border: '#d1c7eb', text: '#352166', accent: '#7b3ff2' },
  { id: 'mint', name: 'Mint', bg: '#d9f3e1', border: '#bde7ca', text: '#0e4a24', accent: '#1aae39' },
  { id: 'peach', name: 'Peach', bg: '#ffe8d4', border: '#fbd0ae', text: '#612a02', accent: '#dd5b00' },
  { id: 'sky', name: 'Sky', bg: '#dcecfa', border: '#c3ddf7', text: '#0b3966', accent: '#0075de' },
  { id: 'rose', name: 'Rose', bg: '#fde0ec', border: '#f7c2d8', text: '#631039', accent: '#ff64c8' },
  { id: 'yellow', name: 'Butter', bg: '#fef7d6', border: '#f7e7a8', text: '#544200', accent: '#f5a623' },
  { id: 'cream', name: 'Warm Cream', bg: '#f8f5e8', border: '#e8e2cd', text: '#453822', accent: '#8c6b38' },
  { id: 'gray', name: 'Soft Slate', bg: '#f0eeec', border: '#dedad6', text: '#2c2b29', accent: '#5d5b54' },
];

export const APP_THEMES = [
  { id: 'warm-minimal', name: 'Notion Warm Minimal', primary: '#5645d4', bg: '#ffffff', surface: '#f6f5f4' },
  { id: 'dark-slate', name: 'Notion Dark Slate', primary: '#7b3ff2', bg: '#191919', surface: '#202020' },
  { id: 'lavender-mist', name: 'Lavender Mist', primary: '#6e4fe0', bg: '#faf8ff', surface: '#f3eeff' },
  { id: 'sage-tranquility', name: 'Sage Tranquility', primary: '#2a9d99', bg: '#f7fbf9', surface: '#eaf4f0' },
];
