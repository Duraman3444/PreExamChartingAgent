import { createTheme } from '@mui/material/styles';

// Brand colors from Figma
const brandColors = {
  purple: '#6C5BD4',
  orange: '#FF6000',
  dark: '#242424',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.orange,
      light: '#FF8533',
      dark: '#CC4D00',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.purple,
      light: '#8A7CE8',
      dark: '#4A3F9A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: brandColors.dark,
      paper: '#2D2D2D',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: 'Manrope, system-ui, sans-serif',
    h1: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: 'Manrope, system-ui, sans-serif',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: 'Manrope, system-ui, sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    button: {
      fontFamily: 'Manrope, system-ui, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D2D2D',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brandColors.dark,
          border: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        secondary: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
      },
    },
  },
}); 