import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  Radio,
  FormGroup,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  Palette,
  Psychology,
  Notifications,
  Security,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Key as KeyIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { UserPreferences } from '@/types';

export const Settings: React.FC = () => {
  const { user, setUser } = useAuthStore();
  // Removed theme-related functionality since theme is now fixed to light mode
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [preferences, setPreferences] = useState<UserPreferences>(
    user?.preferences || {
      theme: 'light', // Fixed to light mode
      language: 'en',
      autoSave: true,
      notificationsEnabled: true,
      aiAssistanceLevel: 'detailed',
      openaiApiKey: '',
    }
  );
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Removed theme updating logic since theme is now fixed
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call to update preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user preferences in store
      if (user) {
        const updatedUser = {
          ...user,
          preferences,
          updatedAt: new Date(),
        };
        setUser(updatedUser);
      }
      
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultPreferences: UserPreferences = {
      theme: 'light', // Fixed to light mode
      language: 'en',
      autoSave: true,
      notificationsEnabled: true,
      aiAssistanceLevel: 'detailed',
      openaiApiKey: '',
    };
    setPreferences(defaultPreferences);
    setShowResetDialog(false);
  };

  const handleExportSettings = () => {
    const settingsData = {
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `care-plus-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        if (importedSettings.preferences) {
          // Force theme to light mode when importing
          const updatedPreferences = { ...importedSettings.preferences, theme: 'light' };
          setPreferences(updatedPreferences);
          setSuccess('Settings imported successfully!');
        }
      } catch (err) {
        setError('Failed to import settings. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to delete account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual account deletion API call
      // await deleteUserAccount(user?.id);
      
      // Sign out user after successful deletion
      // Note: In a real implementation, the user would be redirected to a confirmation page
      setSuccess('Account deletion initiated. You will be logged out shortly.');
      
      setTimeout(() => {
        // signOut(); // Uncomment this line in production
        console.log('Account would be deleted and user logged out');
      }, 2000);
      
    } catch (err) {
      setError('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              
              {/* Removed theme selector - theme is now fixed to light mode */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Theme: Light Mode (Fixed)
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={preferences.language}
                  label="Language"
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.autoSave}
                    onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                  />
                }
                label="Auto-save drafts"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notificationsEnabled}
                    onChange={(e) => handlePreferenceChange('notificationsEnabled', e.target.checked)}
                  />
                }
                label="Enable notifications"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* AI Assistant Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">AI Assistant</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure how detailed AI assistance should be in your workflow
              </Typography>

              <FormControl component="fieldset">
                <RadioGroup
                  value={preferences.aiAssistanceLevel}
                  onChange={(e) => handlePreferenceChange('aiAssistanceLevel', e.target.value)}
                >
                  <FormControlLabel
                    value="basic"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">Basic</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Essential AI suggestions only
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="detailed"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">Detailed</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Comprehensive AI analysis and recommendations
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="comprehensive"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">Comprehensive</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Full AI assistance with detailed explanations
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* OpenAI API Key Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <KeyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">OpenAI API Key</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use your own OpenAI API key for AI analysis. Leave blank to use the default shared key.
              </Typography>

              <TextField
                fullWidth
                label="OpenAI API Key"
                type={showApiKey ? 'text' : 'password'}
                value={preferences.openaiApiKey || ''}
                onChange={(e) => handlePreferenceChange('openaiApiKey', e.target.value)}
                placeholder="sk-..."
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
                helperText={
                  <Box component="span">
                    Your API key is stored securely and encrypted. Get your key from{' '}
                    <Typography 
                      component="a" 
                      href="https://platform.openai.com/account/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ 
                        color: 'primary.main',
                        textDecoration: 'underline',
                        '&:hover': { textDecoration: 'none' }
                      }}
                    >
                      OpenAI Platform
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Notification Preferences</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemText
                    primary="New Visit Notifications"
                    secondary="Get notified when new visits are scheduled"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="AI Analysis Complete"
                    secondary="Notification when AI analysis is finished"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Critical Alerts"
                    secondary="Important medical alerts and red flags"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="System Updates"
                    secondary="Application updates and maintenance notices"
                  />
                  <ListItemSecondaryAction>
                    <Switch />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Security & Privacy</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Session Timeout"
                    secondary="Automatically log out after 30 minutes of inactivity"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data Encryption"
                    secondary="All data is encrypted at rest and in transit"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Always On" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                  <ListItemSecondaryAction>
                    <Button variant="outlined" size="small">
                      Setup
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Login Notifications"
                    secondary="Get notified of new login attempts"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportSettings}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Export Settings
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Download your settings as a JSON file
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Import Settings
                    <input
                      type="file"
                      accept=".json"
                      hidden
                      onChange={handleImportSettings}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Upload settings from a JSON file
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={() => setShowResetDialog(true)}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These actions cannot be undone. Please be careful.
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetToDefaults} variant="contained" color="warning">
            Reset to Defaults
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This action will permanently delete your account and all associated data.
            This cannot be undone.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type "DELETE" to confirm account deletion:
          </Typography>
          
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            error={deleteConfirmText !== '' && deleteConfirmText !== 'DELETE'}
            helperText={deleteConfirmText !== '' && deleteConfirmText !== 'DELETE' ? 'Please type DELETE exactly' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount}
            variant="contained" 
            color="error"
            disabled={deleteConfirmText !== 'DELETE' || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 