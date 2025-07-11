import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  RecordVoiceOver,
  Psychology,
  Settings,
  Person,
  Description,
  Upload,
  SmartToy,
  Assessment,
  Help as HelpIcon,
  Mic,
} from '@mui/icons-material';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: ROUTES.DASHBOARD,
    shortcut: `⇧ + D`,
  },
  {
    text: 'Record',
    icon: <Mic />,
    path: ROUTES.TRANSCRIBE,
    shortcut: `⇧ + R`,
  },
  {
    text: 'Patients',
    icon: <People />,
    path: ROUTES.PATIENTS,
    shortcut: `⇧ + P`,
  },
  {
    text: 'Visits',
    icon: <RecordVoiceOver />,
    path: ROUTES.VISITS,
    shortcut: `⇧ + V`,
  },
  {
    text: 'Transcripts',
    icon: <Upload />,
    path: ROUTES.TRANSCRIPTS,
    shortcut: `⇧ + T`,
  },
  {
    text: 'Visit Notes',
    icon: <Description />,
    path: ROUTES.NOTES,
    shortcut: '',
  },
  {
    text: 'AI Analysis',
    icon: <Psychology />,
    path: ROUTES.AI_ANALYSIS,
    shortcut: '',
  },
  {
    text: 'AI Agent',
    icon: <SmartToy />,
    path: ROUTES.AI_AGENT,
    shortcut: `⇧ + A`,
  },
  {
    text: 'AI Evaluation',
    icon: <Assessment />,
    path: '/evaluation',
    shortcut: '',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { setShowHelpModal } = useKeyboardShortcuts();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawerWidth = 280; // Increased width to accommodate shortcuts

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" noWrap>
            Care+
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.displayName} • {user?.role}
          </Typography>
        </Box>
        <Divider />
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Tooltip
                title={item.shortcut ? `Navigate to ${item.text} (${item.shortcut})` : `Navigate to ${item.text}`}
                placement="right"
                arrow
              >
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                      '& .MuiChip-root': {
                        backgroundColor: 'primary.contrastText',
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.shortcut && (
                    <Chip
                      label={item.shortcut}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.7rem',
                        height: '20px',
                        '& .MuiChip-label': {
                          px: 1,
                          py: 0,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              selected={location.pathname === ROUTES.PROFILE}
              onClick={() => handleNavigation(ROUTES.PROFILE)}
            >
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              selected={location.pathname === ROUTES.SETTINGS}
              onClick={() => handleNavigation(ROUTES.SETTINGS)}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip
              title="Show keyboard shortcuts (?)"
              placement="right"
              arrow
            >
              <ListItemButton onClick={() => setShowHelpModal(true)}>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText primary="Keyboard Shortcuts" />
                <Chip
                  label="?"
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.7rem',
                    height: '20px',
                    '& .MuiChip-label': {
                      px: 1,
                      py: 0,
                    },
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}; 