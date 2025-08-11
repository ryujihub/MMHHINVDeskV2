import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const Settings = () => {
  const { currentUser, updatePassword, updateEmail } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile Settings
  const [email, setEmail] = useState(currentUser?.email || '');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (email !== currentUser?.email) {
        await updateEmail(email);
      }
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updatePassword(newPassword);
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError('Failed to update password');
    }
    setLoading(false);
  };

  const handleAppSettingsSave = () => {
    // TODO: Implement app settings save functionality
    setSuccess('Settings saved successfully');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Typography variant="h5" sx={{ p: 2 }}>
          Settings
        </Typography>
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Profile" />
            <Tab label="Password" />
            <Tab label="Application" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ m: 2 }}>
            {success}
          </Alert>
        )}

        <TabPanel value={activeTab} index={0}>
          <Box component="form" onSubmit={handleProfileUpdate}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </Box>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box component="form" onSubmit={handlePasswordChange}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </Box>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                }
                label="Dark Mode"
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.checked)}
                  />
                }
                label="Low Stock Alerts"
              />
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={handleAppSettingsSave}
                disabled={loading}
              >
                Save Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};
