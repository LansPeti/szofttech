import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { userService } from '../services/api';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

const AVATAR_COLORS = ['#C2B280', '#DED3C1', '#A89968', '#8E806A', '#E3D5CA', '#D5BDAF'];

export default function ProfileSettings() {
  const navigate = useNavigate();

  // Profil adatok állapota
  const [profile, setProfile] = useState({ username: '', avatarColor: '', inviteToken: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // UI állapotok
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ open: false, text: '', severity: 'success' });

  // 1. Profil betöltése indításkor
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Hiba a profil betöltésekor:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Név és szín mentése
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await userService.updateProfile({
        username: profile.username,
        avatarColor: profile.avatarColor
      });
      setMsg({ open: true, text: 'profil sikeresen frissítve', severity: 'success' });
      // Rövid várakozás után visszavisz a főoldalra
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setMsg({ open: true, text: 'hiba a mentés során: ' + error.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // 3. Jelszó módosítása
  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setMsg({ open: true, text: 'az új jelszavak nem egyeznek', severity: 'error' });
      return;
    }
    try {
      setSaving(true);
      await userService.changePassword(passwords.current, passwords.new);
      setMsg({ open: true, text: 'jelszó megváltoztatva', severity: 'success' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      setMsg({ open: true, text: error.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // 4. Meghívó link másolása
  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${profile.inviteToken}`;
    navigator.clipboard.writeText(link);
    setMsg({ open: true, text: 'meghívó link másolva', severity: 'success' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: BEIGE_THEME.background }}>
        <CircularProgress sx={{ color: BEIGE_THEME.accent }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: BEIGE_THEME.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 3,
      pb: 12
    }}>

      <Typography variant="h4" sx={{
        fontWeight: 300,
        color: BEIGE_THEME.text,
        mb: 4,
        textTransform: 'lowercase',
        letterSpacing: 2
      }}>
        profil beállítások.
      </Typography>

      <Paper elevation={0} sx={{
        width: '100%',
        maxWidth: '450px',
        bgcolor: BEIGE_THEME.paper,
        borderRadius: '24px',
        p: 4,
        border: `1px solid ${BEIGE_THEME.border}`
      }}>
        <Stack spacing={3} alignItems="center">

          {/* Avatar megjelenítése a választott színnel */}
          <Avatar sx={{
            width: 90,
            height: 90,
            bgcolor: profile.avatarColor || BEIGE_THEME.accent,
            border: `5px solid white`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <PersonOutlineIcon sx={{ fontSize: 45, color: 'white' }} />
          </Avatar>

          <Box sx={{ width: '100%' }}>
            {/* Felhasználónév módosítása */}
            <TextField
              variant="standard"
              label="felhasználónév"
              fullWidth
              value={profile.username}
              onChange={(e) => setProfile({...profile, username: e.target.value})}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 3, opacity: 0.5 }}>
              <Typography variant="caption" sx={{ color: BEIGE_THEME.text, opacity: 0.5 }}>
                jelszó módosítása
              </Typography>
            </Divider>

            <TextField variant="standard" label="eddigi jelszó" type="password" fullWidth value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} sx={{ mb: 2 }} />
            <TextField variant="standard" label="új jelszó" type="password" fullWidth value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} sx={{ mb: 2 }} />
            <TextField variant="standard" label="új jelszó még egyszer" type="password" fullWidth value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} sx={{ mb: 1 }} />

            <Button
              size="small"
              onClick={handleChangePassword}
              disabled={saving || !passwords.current || !passwords.new}
              sx={{ color: BEIGE_THEME.accent, textTransform: 'lowercase', mb: 4, fontSize: '0.75rem' }}
            >
              jelszó frissítése
            </Button>

            <Divider sx={{ mb: 3, opacity: 0.5 }} />

            {/* Színválasztó körök */}
            <Typography variant="caption" sx={{ color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase', mb: 1.5, display: 'block' }}>
              profilszín választása
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 4 }}>
              {AVATAR_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setProfile({...profile, avatarColor: color})}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    border: profile.avatarColor === color ? `2px solid ${BEIGE_THEME.text}` : '2px solid transparent',
                    transition: '0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              ))}
            </Stack>

            {/* Meghívó link szekció */}
            <Typography variant="caption" sx={{ color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase', display: 'block', mb: 1 }}>
              saját naptárba meghívó link másolása
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={copyInviteLink}
              endIcon={<ContentCopyIcon fontSize="small" />}
              sx={{
                mb: 4,
                borderColor: BEIGE_THEME.border,
                color: BEIGE_THEME.text,
                borderRadius: '12px',
                textTransform: 'lowercase',
                borderStyle: 'dashed'
              }}
            >
              másolás
            </Button>

            {/* Alsó funkciógombok */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/')} // VISSZAKÖRÖZ A FŐOLDALRA
                sx={{ color: BEIGE_THEME.text, textTransform: 'lowercase' }}
              >
                mégse
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveProfile}
                disabled={saving}
                sx={{
                  bgcolor: BEIGE_THEME.accent,
                  boxShadow: 'none',
                  borderRadius: '12px',
                  textTransform: 'lowercase',
                  '&:hover': { bgcolor: '#A89968', boxShadow: 'none' }
                }}
              >
                {saving ? 'mentés...' : 'mentés'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Visszajelzések */}
      <Snackbar open={msg.open} autoHideDuration={3000} onClose={() => setMsg({...msg, open: false})}>
        <Alert
          severity={msg.severity}
          sx={{
            borderRadius: '12px',
            bgcolor: BEIGE_THEME.paper,
            color: BEIGE_THEME.text,
            border: `1px solid ${BEIGE_THEME.border}`
          }}
        >
          {msg.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}