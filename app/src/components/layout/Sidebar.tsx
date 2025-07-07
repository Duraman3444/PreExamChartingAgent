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
  Assessment,
  LocalHospital,
  Assignment,
  Settings,
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
    text: 'Screening',
    icon: <Assessment />,
    path: ROUTES.SCREENING,
  },
  {
    text: 'Vitals',
    icon: <LocalHospital />,
    path: ROUTES.VITALS,
  },
  {
    text: 'Charts',
    icon: <Assignment />,
    path: ROUTES.CHARTS,
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
            Medical Charts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.name} • {user?.role}
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
            <ListItemButton onClick={() => handleNavigation(ROUTES.SETTINGS)}>
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