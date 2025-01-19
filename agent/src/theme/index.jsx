import PropTypes from 'prop-types';
import { useMemo } from 'react';

import {
  createTheme,
  StyledEngineProvider,
  CssBaseline,
  ThemeProvider as MUIThemeProvider,
} from '@mui/material';

import palette from './palette';
import shadows from './shadows';
import typography from './typography';
import customShadows from './customShadows';
import componentsOverride from './overrides';

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function ThemeProvider({ children }) {
  // const colorMode = useMediaQuery('(prefers-color-scheme:dark)');
  const themeOptions = useMemo(
    () => ({
      palette: {
        // mode: colorMode ? 'dark' : 'light',
        ...palette,
      },
      shape: { borderRadius: 6 },
      typography,
      shadows: shadows(),
      customShadows: customShadows(),
    }),
    []
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
