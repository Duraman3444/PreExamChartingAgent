import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
  Navigation as NavigationIcon,
  People as PeopleIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useKeyboardShortcuts, ShortcutHelp } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'navigation':
      return <NavigationIcon color="primary" />;
    case 'patient':
      return <PeopleIcon color="secondary" />;
    case 'analysis':
      return <PsychologyIcon color="info" />;
    case 'general':
      return <SettingsIcon color="action" />;
    default:
      return <KeyboardIcon color="action" />;
  }
};

const getCategoryColor = (category: string): "primary" | "secondary" | "info" | "success" | "warning" | "error" | "default" => {
  switch (category) {
    case 'navigation':
      return 'primary';
    case 'patient':
      return 'secondary';
    case 'analysis':
      return 'info';
    case 'general':
      return 'success';
    default:
      return 'default';
  }
};

const getCategoryTitle = (category: string) => {
  switch (category) {
    case 'navigation':
      return 'Navigation';
    case 'patient':
      return 'Patient Management';
    case 'analysis':
      return 'AI Analysis';
    case 'general':
      return 'General';
    default:
      return 'Other';
  }
};

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  open,
  onClose,
}) => {
  const { getShortcutHelp, isMac } = useKeyboardShortcuts();
  const shortcuts = getShortcutHelp();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutHelp[]>);

  const renderShortcutKey = (keyString: string) => {
    return (
      <Chip
        label={keyString}
        size="small"
        variant="outlined"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          backgroundColor: 'background.paper',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 1,
          minWidth: 'auto',
          '& .MuiChip-label': {
            padding: '4px 8px',
          },
        }}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyboardIcon color="primary" />
            <Typography variant="h5" component="span">
              Keyboard Shortcuts
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Speed up your workflow with these keyboard shortcuts
          {isMac && (
            <Box component="span" sx={{ ml: 1, fontStyle: 'italic' }}>
              (⌘ = Command key)
            </Box>
          )}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <Grid item xs={12} md={6} key={category}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getCategoryIcon(category)}
                    <Typography variant="h6" component="div">
                      {getCategoryTitle(category)}
                    </Typography>
                    <Chip
                      label={categoryShortcuts.length}
                      size="small"
                      color={getCategoryColor(category)}
                      variant="outlined"
                    />
                  </Box>
                  
                  <List dense disablePadding>
                    {categoryShortcuts.map((shortcut, index) => (
                      <React.Fragment key={`${category}-${index}`}>
                        <ListItem
                          disablePadding
                          sx={{
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <ListItemText
                            primary={shortcut.description}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontWeight: 500 },
                            }}
                            sx={{ flex: 1, mr: 2 }}
                          />
                          <Box sx={{ flexShrink: 0 }}>
                            {renderShortcutKey(shortcut.key)}
                          </Box>
                        </ListItem>
                        {index < categoryShortcuts.length - 1 && (
                          <Divider sx={{ my: 0.5 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tips section */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 Pro Tips:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>Shortcuts work globally except when typing in input fields</li>
              <li>Use <strong>?</strong> anytime to bring up this help modal</li>
              <li>Press <strong>Escape</strong> to close modals and cancel actions</li>
              <li>Number shortcuts (Alt + 1-9) switch between first 9 patients in lists</li>
              <li>Most shortcuts use {isMac ? 'Command (⌘)' : 'Ctrl'} as the primary modifier</li>
            </Box>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          startIcon={<CloseIcon />}
          fullWidth
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 