import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

export { LIGHT_COLORS, DARK_COLORS };

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  colors: typeof LIGHT_COLORS;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: LIGHT_COLORS,
  preference: 'system',
  setPreference: () => {},
});

export function useColors() {
  return useContext(ThemeContext).colors;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { ThemeContext };
