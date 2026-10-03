/**
 * Authentic Tiimo Design System Tokens
 * Neurodivergent & ADHD-friendly pastel color palette, radii, and typography
 */

export const TIIMO_COLORS = {
  // Brand & Accent
  primaryGreen: '#52B788',
  primaryGreenHover: '#40916C',
  primaryGreenLight: '#D8F3DC',
  
  // Canvas & Backgrounds
  bgLight: '#F8F8F6',
  bgLightAlt: '#F4F4F0',
  surfaceLight: '#FFFFFF',
  surfaceLightHover: '#FAFAF8',
  hairlineLight: 'rgba(0, 0, 0, 0.06)',
  
  // Dark Mode Canvas
  bgDark: '#1F1F1F',
  surfaceDark: '#292929',
  surfaceDarkHover: '#333333',
  hairlineDark: 'rgba(255, 255, 255, 0.08)',
  
  // Inks & Typography
  textPrimary: '#2D3142',
  textSecondary: '#6C757D',
  textMuted: '#9E9E9E',
  textLight: '#F8F9FA',
  
  // Status Colors
  success: '#52B788',
  warning: '#FFD166',
  danger: '#EF476F',
  info: '#118AB2'
};

/**
 * Authentic Tiimo Pastel Tints for Activity & Task Cards
 */
export const TIIMO_TINTS = {
  mint: {
    id: 'mint',
    label: 'Mint / Sage',
    bg: '#D8F3DC',
    accent: '#52B788',
    border: 'rgba(82, 183, 136, 0.35)',
    text: '#1B4332',
    iconBg: '#B7E4C7',
    badgeText: '#2D6A4F'
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender / Purple',
    bg: '#E8E5F8',
    accent: '#9B86ED',
    border: 'rgba(155, 134, 237, 0.35)',
    text: '#3B2C6F',
    iconBg: '#D1CCF4',
    badgeText: '#4A3780'
  },
  yellow: {
    id: 'yellow',
    label: 'Buttercup Yellow',
    bg: '#FFF3CD',
    accent: '#FFD166',
    border: 'rgba(255, 209, 102, 0.45)',
    text: '#785100',
    iconBg: '#FFE69C',
    badgeText: '#855E00'
  },
  sky: {
    id: 'sky',
    label: 'Soft Sky Blue',
    bg: '#E0F2FE',
    accent: '#38BDF8',
    border: 'rgba(56, 189, 248, 0.35)',
    text: '#0369A1',
    iconBg: '#BAE6FD',
    badgeText: '#0284C7'
  },
  coral: {
    id: 'coral',
    label: 'Warm Peach / Coral',
    bg: '#FFE5D9',
    accent: '#F4845F',
    border: 'rgba(244, 132, 95, 0.35)',
    text: '#7C2D12',
    iconBg: '#FCD5CE',
    badgeText: '#9A3412'
  }
};

export const TIIMO_CATEGORIES = [
  { id: 'Morning', label: 'Morning Flow', tint: 'yellow', icon: 'Sun' },
  { id: 'DeepWork', label: 'Deep Work', tint: 'lavender', icon: 'Laptop' },
  { id: 'Health', label: 'Movement & Body', tint: 'mint', icon: 'Footprints' },
  { id: 'Mindfulness', label: 'Sensory Reset', tint: 'sky', icon: 'Heart' },
  { id: 'Evening', label: 'Evening Winddown', tint: 'coral', icon: 'Moon' },
  { id: 'General', label: 'Daily Routine', tint: 'mint', icon: 'Clock' }
];

export const TIIMO_THEMES = [
  { id: 'calm-cream', name: 'Calm Cream (Tiimo Light)', bg: '#F8F8F6', surface: '#FFFFFF', primary: '#52B788' },
  { id: 'deep-charcoal', name: 'Deep Charcoal (Tiimo Dark)', bg: '#1F1F1F', surface: '#292929', primary: '#52B788' }
];
