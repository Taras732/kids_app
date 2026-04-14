export const colors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  success: '#95E1D3',
  danger: '#F38181',
  bg: '#FFF8E7',
  card: '#FFFFFF',
  text: '#2D3436',
  textMuted: '#636E72',
  border: '#E8E8E8',
  islandMath: '#FF6B6B',
  islandLetters: '#4ECDC4',
  islandEnglish: '#FFA07A',
  islandLogic: '#A8E6CF',
  islandMemory: '#C8A8E9',
  islandScience: '#7FB3D5',
  islandEmotions: '#F8B195',
  islandCreativity: '#F67280',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  display: 48,
} as const;
