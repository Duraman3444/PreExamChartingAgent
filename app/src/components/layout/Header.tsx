import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Check,
  Delete,
  AccessTime,
  Info,
  Warning,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { ROUTES } from '@/constants';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuthStore();
  const { notifications, markNotificationAsRead, removeNotification, clearNotifications } = useAppStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate(ROUTES.PROFILE);
    handleProfileMenuClose();
  };

  const handleSettingsClick = () => {
    navigate(ROUTES.SETTINGS);
    handleProfileMenuClose();
  };

  const handleSignOut = async () => {
    await signOut();
    handleProfileMenuClose();
  };

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const handleRemoveNotification = (notificationId: string) => {
    removeNotification(notificationId);
  };

  const handleClearAllNotifications = () => {
    clearNotifications();
    handleNotificationMenuClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <AppBar position="fixed" elevation={1} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2, color: theme.palette.text.primary }}
        >
          <MenuIcon />
        </IconButton>

        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontFamily: '"Clash Display", sans-serif', 
            fontWeight: 600,
            color: theme.palette.primary.main,
          }}
        >
          Care+
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handleNotificationMenuOpen}
            sx={{ color: theme.palette.text.primary }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            sx={{ color: theme.palette.text.primary }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { width: 350, maxHeight: 400 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Notifications</Typography>
              {notifications.length > 0 && (
                <Button size="small" onClick={handleClearAllNotifications}>
                  Clear All
                </Button>
              )}
            </Box>
          </Box>
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    backgroundColor: !notification.read ? 'action.hover' : 'transparent'
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={!notification.read ? 'bold' : 'normal'}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="New" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <AccessTime fontSize="small" sx={{ fontSize: 12 }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!notification.read && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveNotification(notification.id)}
                        title="Remove notification"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <AccountCircle sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <Settings sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <Logout sx={{ mr: 2 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}; 