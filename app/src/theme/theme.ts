import { createTheme } from '@mui/material/styles';

// Brand colors from Figma - Updated to use blue instead of orange
const brandColors = {
  purple: '#6C5BD4',
  blue: '#1976D2',
  dark: '#242424',
  light: '#F8F9FA',
  white: '#FFFFFF',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
};

// Fixed to light mode only
export const createAppTheme = () => createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.blue,
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.purple,
      light: '#8A7CE8',
      dark: '#4A3F9A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D',
    },
    divider: '#DEE2E6',
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
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
            backgroundColor: '#E3F2FD',
            color: brandColors.blue,
            '& .MuiListItemIcon-root': {
              color: brandColors.blue,
            },
            '&:hover': {
              backgroundColor: '#BBDEFB',
            },
          },
          '&:hover': {
            backgroundColor: '#F8F9FA',
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

// Default light theme (now the only theme)
export const theme = createAppTheme(); 