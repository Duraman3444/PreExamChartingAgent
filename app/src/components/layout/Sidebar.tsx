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
} from '@mui/icons-material';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: ROUTES.DASHBOARD,
  },
  {
    text: 'Patients',
    icon: <People />,
    path: ROUTES.PATIENTS,
  },
  {
    text: 'Visits',
    icon: <RecordVoiceOver />,
    path: ROUTES.VISITS,
  },
  {
    text: 'Transcripts',
    icon: <Upload />,
    path: ROUTES.TRANSCRIPTS,
  },
  {
    text: 'Visit Notes',
    icon: <Description />,
    path: ROUTES.NOTES,
  },
  {
    text: 'AI Analysis',
    icon: <Psychology />,
    path: ROUTES.AI_ANALYSIS,
  },
  {
    text: 'AI Agent',
    icon: <SmartToy />,
    path: ROUTES.AI_AGENT,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawerWidth = 240;

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
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
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
        </List>
      </Box>
    </Drawer>
  );
}; 