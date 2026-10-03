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
    darkBg: 'rgba(82, 183, 136, 0.16)',
    accent: '#52B788',
    border: 'rgba(82, 183, 136, 0.35)',
    darkBorder: 'rgba(82, 183, 136, 0.45)',
    text: '#1B4332',
    darkText: '#D8F3DC',
    iconBg: '#B7E4C7',
    darkIconBg: 'rgba(82, 183, 136, 0.28)',
    badgeText: '#2D6A4F',
    darkBadgeText: '#74C69D'
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender / Purple',
    bg: '#E8E5F8',
    darkBg: 'rgba(155, 134, 237, 0.16)',
    accent: '#9B86ED',
    border: 'rgba(155, 134, 237, 0.35)',
    darkBorder: 'rgba(155, 134, 237, 0.45)',
    text: '#3B2C6F',
    darkText: '#E8E5F8',
    iconBg: '#D1CCF4',
    darkIconBg: 'rgba(155, 134, 237, 0.28)',
    badgeText: '#4A3780',
    darkBadgeText: '#B8A8F4'
  },
  yellow: {
    id: 'yellow',
    label: 'Buttercup Yellow',
    bg: '#FFF3CD',
    darkBg: 'rgba(255, 209, 102, 0.16)',
    accent: '#FFD166',
    border: 'rgba(255, 209, 102, 0.45)',
    darkBorder: 'rgba(255, 209, 102, 0.45)',
    text: '#785100',
    darkText: '#FFF3CD',
    iconBg: '#FFE69C',
    darkIconBg: 'rgba(255, 209, 102, 0.28)',
    badgeText: '#855E00',
    darkBadgeText: '#FFE082'
  },
  sky: {
    id: 'sky',
    label: 'Soft Sky Blue',
    bg: '#E0F2FE',
    darkBg: 'rgba(56, 189, 248, 0.16)',
    accent: '#38BDF8',
    border: 'rgba(56, 189, 248, 0.35)',
    darkBorder: 'rgba(56, 189, 248, 0.45)',
    text: '#0369A1',
    darkText: '#E0F2FE',
    iconBg: '#BAE6FD',
    darkIconBg: 'rgba(56, 189, 248, 0.28)',
    badgeText: '#0284C7',
    darkBadgeText: '#7DD3FC'
  },
  coral: {
    id: 'coral',
    label: 'Warm Peach / Coral',
    bg: '#FFE5D9',
    darkBg: 'rgba(244, 132, 95, 0.16)',
    accent: '#F4845F',
    border: 'rgba(244, 132, 95, 0.35)',
    darkBorder: 'rgba(244, 132, 95, 0.45)',
    text: '#7C2D12',
    darkText: '#FFE5D9',
    iconBg: '#FCD5CE',
    darkIconBg: 'rgba(244, 132, 95, 0.28)',
    badgeText: '#9A3412',
    darkBadgeText: '#FFAF87'
  }
};

/**
 * Get active tint colors based on current mode (Light vs Dark)
 */
export function getCardTint(tintId, isDarkMode = false) {
  const base = TIIMO_TINTS[tintId] || TIIMO_TINTS.mint;
  if (!isDarkMode) {
    return base;
  }
  return {
    ...base,
    bg: base.darkBg || 'rgba(255, 255, 255, 0.08)',
    border: base.darkBorder || 'rgba(255, 255, 255, 0.18)',
    text: base.darkText || '#F8F9FA',
    iconBg: base.darkIconBg || 'rgba(255, 255, 255, 0.15)',
    badgeText: base.darkBadgeText || '#A0AEC0'
  };
}

export const TIIMO_CATEGORIES = [
  { id: 'Morning', label: 'Morning Flow', tint: 'yellow', icon: 'Sun' },
  { id: 'DeepWork', label: 'Deep Work', tint: 'lavender', icon: 'Laptop' },
  { id: 'Health', label: 'Movement & Body', tint: 'mint', icon: 'Footprints' },
  { id: 'Mindfulness', label: 'Sensory Reset', tint: 'sky', icon: 'Heart' },
  { id: 'Evening', label: 'Evening Winddown', tint: 'coral', icon: 'Moon' },
  { id: 'General', label: 'Daily Routine', tint: 'mint', icon: 'Clock' }
];

export const TIIMO_THEMES = [
  { 
    id: 'calm-cream', 
    name: 'Calm Cream', 
    modeLabel: 'Light Mode',
    desc: 'Soft daylight warmth designed to reduce glare and boost daytime clarity.',
    bg: '#F8F8F6', 
    surface: '#FFFFFF', 
    primary: '#52B788',
    icon: 'Sun'
  },
  { 
    id: 'deep-charcoal', 
    name: 'Deep Charcoal', 
    modeLabel: 'Dark Mode',
    desc: 'Low-stimulation deep graphite canvas that eliminates nighttime eye fatigue.',
    bg: '#1F1F1F', 
    surface: '#292929', 
    primary: '#52B788',
    icon: 'Moon'
  }
];
