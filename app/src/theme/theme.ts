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

export const theme = createTheme({
  palette: {
    mode: 'light',
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
      color: '#212529',
    },
    h2: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#212529',
    },
    h3: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: '#212529',
    },
    h4: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#212529',
    },
    h5: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#212529',
    },
    h6: {
      fontFamily: '"Clash Display", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      color: '#212529',
    },
    body1: {
      fontFamily: 'Manrope, system-ui, sans-serif',
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#212529',
    },
    body2: {
      fontFamily: 'Manrope, system-ui, sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.4,
      color: '#6C757D',
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
          backgroundColor: '#FFFFFF',
          border: '1px solid #E9ECEF',
          borderRadius: 16,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
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
        root: {
          backgroundColor: '#FFFFFF',
          color: '#212529',
          border: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #E9ECEF',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E9ECEF',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#212529',
          fontWeight: 500,
        },
        secondary: {
          color: '#6C757D',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: '#FFF3E0',
            color: brandColors.orange,
            '& .MuiListItemIcon-root': {
              color: brandColors.orange,
            },
            '&:hover': {
              backgroundColor: '#FFE0B2',
            },
          },
          '&:hover': {
            backgroundColor: '#F8F9FA',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#6C757D',
          minWidth: 40,
        },
      },
    },
  },
}); 