/**
 * Modern Monochrome Theme Configuration
 * Color system: white, light gray, dark gray, black
 */

export const monochromeTheme = {
  // Core colors
  colors: {
    white: "#FFFFFF",
    lightGray: "#F5F5F5",
    gray: "#E0E0E0",
    mediumGray: "#9E9E9E",
    darkGray: "#424242",
    charcoal: "#212121",
    black: "#000000",
  },

  // Semantic colors
  semantic: {
    primary: "#000000",
    secondary: "#424242",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    border: "#E0E0E0",
    text: {
      primary: "#000000",
      secondary: "#424242",
      tertiary: "#9E9E9E",
      inverse: "#FFFFFF",
    },
    state: {
      hover: "#F5F5F5",
      active: "#E0E0E0",
      disabled: "#9E9E9E",
      focus: "#000000",
    },
  },

  // Status colors (minimal, monochrome-friendly)
  status: {
    success: "#424242",
    error: "#000000",
    warning: "#424242",
    info: "#212121",
  },

  // Typography
  typography: {
    fontFamily: {
      // Be Vietnam Pro optimized for Vietnamese
      primary:
        "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (8px base)
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
  },

  // Border radius
  borderRadius: {
    none: "0",
    sm: "0.125rem", // 2px
    base: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    full: "9999px",
  },

  // Shadows (subtle, monochrome)
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  // Transitions
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
    notification: 1500,
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// CSS Custom Properties Generator
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  // Colors
  Object.entries(monochromeTheme.colors).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value;
  });

  // Semantic colors
  Object.entries(monochromeTheme.semantic.text).forEach(([key, value]) => {
    cssVars[`--text-${key}`] = value;
  });

  // Spacing
  Object.entries(monochromeTheme.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Shadows
  Object.entries(monochromeTheme.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });

  return cssVars;
};

// Theme utility functions
export const theme = {
  ...monochromeTheme,

  // Utility to get color with opacity
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  // Responsive helper
  media: {
    sm: `@media (min-width: ${monochromeTheme.breakpoints.sm})`,
    md: `@media (min-width: ${monochromeTheme.breakpoints.md})`,
    lg: `@media (min-width: ${monochromeTheme.breakpoints.lg})`,
    xl: `@media (min-width: ${monochromeTheme.breakpoints.xl})`,
    "2xl": `@media (min-width: ${monochromeTheme.breakpoints["2xl"]})`,
  },
};

export default theme;
