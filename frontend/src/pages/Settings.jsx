import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '../services/api';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

export default function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    language: 'magyar',
    timezone: 'Budapest (GMT+1)',
    other: 'Értesítések: BE'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ open: false, text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        if (data) setSettings(data);
      } catch (error) {
        console.error("Hiba:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.update(settings);
      navigate('/');
    } catch (error) {
      setMsg({ open: true, text: 'Hiba a mentés során' });
      setSaving(false);
    }
  };

  // Közös stílus a dropdownoknak, hogy úgy nézzenek ki, mint a wireframe gombjai
  const selectStyle = {
    bgcolor: 'transparent',
    color: BEIGE_THEME.text,
    borderRadius: '12px',
    textTransform: 'lowercase',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: BEIGE_THEME.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: BEIGE_THEME.accent },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BEIGE_THEME.accent },
    '.MuiSelect-select': { py: 1.5 }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress sx={{ color: BEIGE_THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BEIGE_THEME.background, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>

      <Typography variant="h4" sx={{ fontWeight: 300, color: BEIGE_THEME.text, mb: 4, textTransform: 'lowercase', letterSpacing: 2 }}>
        beállítások.
      </Typography>

      <Paper elevation={0} sx={{ width: '100%', maxWidth: '400px', bgcolor: BEIGE_THEME.paper, borderRadius: '24px', p: 4, border: `1px solid ${BEIGE_THEME.border}` }}>
        <Stack spacing={3}>

          {/* NYELV DROPDOWN */}
          <FormControl fullWidth>
            <Select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              sx={selectStyle}
            >
              <MenuItem value="magyar">magyar</MenuItem>
              <MenuItem value="english">english</MenuItem>
              <MenuItem value="deutsch">deutsch</MenuItem>
            </Select>
          </FormControl>

          {/* IDŐZÓNA DROPDOWN */}
          <FormControl fullWidth>
            <Select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              sx={selectStyle}
            >
              <MenuItem value="Budapest (GMT+1)">Budapest (GMT+1)</MenuItem>
              <MenuItem value="London (GMT+0)">London (GMT+0)</MenuItem>
              <MenuItem value="New York (GMT-5)">New York (GMT-5)</MenuItem>
            </Select>
          </FormControl>

          {/* EGYÉB BEÁLLÍTÁSOK DROPDOWN */}
          <FormControl fullWidth>
            <Select
              value={settings.other}
              onChange={(e) => setSettings({...settings, other: e.target.value})}
              sx={selectStyle}
            >
              <MenuItem value="Értesítések: BE">Értesítések: BE</MenuItem>
              <MenuItem value="Értesítések: KI">Értesítések: KI</MenuItem>
              <MenuItem value="Sötét mód: BE">Sötét mód: BE</MenuItem>
              <MenuItem value="Sötét mód: KI">Sötét mód: KI</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2, borderColor: BEIGE_THEME.border }} />

          {/* PROBLÉMA JELZÉSE */}
          <Button fullWidth variant="text" sx={{ color: '#d32f2f', opacity: 0.8, textTransform: 'lowercase' }}>
            probléma jelzése
          </Button>

          {/* ALSÓ GOMBOK */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              fullWidth variant="text"
              onClick={() => navigate('/')} // Mégse -> Vissza a főoldalra
              sx={{ color: BEIGE_THEME.text, textTransform: 'lowercase' }}
            >
              mégse
            </Button>
            <Button
              fullWidth variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{ bgcolor: BEIGE_THEME.accent, boxShadow: 'none', borderRadius: '12px', textTransform: 'lowercase', '&:hover': { bgcolor: '#A89968', boxShadow: 'none' } }}
            >
              {saving ? 'mentés...' : 'mentés'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar open={msg.open} autoHideDuration={3000} onClose={() => setMsg({ ...msg, open: false })}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{msg.text}</Alert>
      </Snackbar>
    </Box>
  );
}