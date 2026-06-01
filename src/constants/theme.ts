export const LIGHT_COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#dbeafe',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#06b6d4',
  infoLight: '#cffafe',
  surface: '#ffffff',
  background: '#f1f5f9',
  backgroundDark: '#0f172a',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  notification: '#ef4444',
  gradientStart: '#2563eb',
  gradientEnd: '#7c3aed',
  successGradientStart: '#059669',
  successGradientEnd: '#10b981',
  warningGradientStart: '#d97706',
  warningGradientEnd: '#f59e0b',
  dangerGradientStart: '#dc2626',
  dangerGradientEnd: '#ef4444',
};

export const DARK_COLORS: typeof LIGHT_COLORS = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#1e3a5f',
  success: '#34d399',
  successLight: '#064e3b',
  warning: '#fbbf24',
  warningLight: '#422006',
  danger: '#f87171',
  dangerLight: '#450a0a',
  info: '#22d3ee',
  infoLight: '#083344',
  surface: '#0f172a',
  background: '#020617',
  backgroundDark: '#020617',
  card: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#334155',
  borderLight: '#1e293b',
  notification: '#ef4444',
  gradientStart: '#3b82f6',
  gradientEnd: '#8b5cf6',
  successGradientStart: '#10b981',
  successGradientEnd: '#34d399',
  warningGradientStart: '#f59e0b',
  warningGradientEnd: '#fbbf24',
  dangerGradientStart: '#ef4444',
  dangerGradientEnd: '#f87171',
};

export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 9999,
};

export const FONT = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 28, xxxl: 36,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const STATUS_COLORS: Record<string, string> = {
  pending: LIGHT_COLORS.warning,
  confirmed: LIGHT_COLORS.primary,
  processing: LIGHT_COLORS.info,
  shipped: LIGHT_COLORS.success,
  delivered: LIGHT_COLORS.success,
  cancelled: LIGHT_COLORS.danger,
  returned: LIGHT_COLORS.danger,
  fake: LIGHT_COLORS.danger,
  duplicate: LIGHT_COLORS.warning,
  no_answer_1: LIGHT_COLORS.warning,
  no_answer_2: LIGHT_COLORS.danger,
  no_answer_3: LIGHT_COLORS.danger,
  waiting_callback: LIGHT_COLORS.info,
  postponed: LIGHT_COLORS.warning,
};
