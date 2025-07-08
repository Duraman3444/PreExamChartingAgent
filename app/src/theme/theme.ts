import { createTheme } from '@mui/material/styles';

// Brand colors from Figma
const brandColors = {
  purple: '#6C5BD4',
  orange: '#FF6000',
  dark: '#242424',
  light: '#F8F9FA',
  white: '#FFFFFF',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
};

export const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
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
      default: mode === 'light' ? '#F8F9FA' : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    text: {
      primary: mode === 'light' ? '#212529' : '#FFFFFF',
      secondary: mode === 'light' ? '#6C757D' : '#AAAAAA',
    },
    divider: mode === 'light' ? '#DEE2E6' : '#333333',
    success: {
      main: '#28A745',
      light: '#71DD8A',
      dark: '#1E7E34',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#F57C00',
    },
    error: {
      main: '#DC3545',
      light: '#F1959B',
      dark: '#C82333',
    },
    info: {
      main: '#17A2B8',
      light: '#7DD3FC',
      dark: '#117A8B',
    },
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
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 16,
          boxShadow: mode === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(255,255,255,0.1)',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.15)' : '0 4px 8px rgba(255,255,255,0.15)',
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'none',
        },
        contained: {
          boxShadow: mode === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(255,255,255,0.1)',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.15)' : '0 4px 8px rgba(255,255,255,0.15)',
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
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: 'none',
          boxShadow: mode === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(255,255,255,0.1)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: mode === 'light' ? '2px 0 4px rgba(0,0,0,0.1)' : '2px 0 4px rgba(255,255,255,0.1)',
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: ({ theme }) => ({
          color: theme.palette.text.primary,
          fontWeight: 500,
        }),
        secondary: ({ theme }) => ({
          color: theme.palette.text.secondary,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? '#FFF3E0' : '#2D1B0D',
            color: brandColors.orange,
            '& .MuiListItemIcon-root': {
              color: brandColors.orange,
            },
            '&:hover': {
              backgroundColor: mode === 'light' ? '#FFE0B2' : '#3D2B1D',
            },
          },
          '&:hover': {
            backgroundColor: mode === 'light' ? '#F8F9FA' : '#2A2A2A',
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          minWidth: 40,
        }),
      },
    },
  },
});

// Default light theme for initial load
export const theme = createAppTheme('light'); 