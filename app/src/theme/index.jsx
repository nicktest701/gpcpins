import PropTypes from "prop-types";
import React, { useMemo } from "react";
import {
  createTheme,
  responsiveFontSizes,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider,
  alpha,
  lighten,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import palette from "./palette";
import shadows from "./shadows";
import typography from "./typography";
import customShadows from "./customShadows";
import componentsOverride from "./overrides";

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function ThemeProvider({ children }) {
  const theme = useMemo(() => {
    // 1. Base theme config
    let baseTheme = createTheme({
      direction: "ltr", // ✅ CRITICAL FIX (prevents your error)
      palette: {
        mode: "light", // ready for dark mode extension
        ...palette,
      },
      shape: { borderRadius: 8 }, // slightly modernized
      typography,
      shadows: shadows(),
      // spacing: 4, // 4px grid system
    });

    // 2. Extend with custom shadows
    baseTheme.customShadows = customShadows(baseTheme);

    // 3. Component overrides (proper pattern)
    baseTheme.components = componentsOverride(baseTheme);

    // 4. Responsive typography
    baseTheme = responsiveFontSizes(baseTheme);

    baseTheme.alpha = alpha; // ✅ PATCH
    baseTheme.lighten  = lighten ; // ✅ PATCH

    return baseTheme;
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}