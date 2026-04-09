import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stack, Paper, Divider, CircularProgress, Snackbar, Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

// API importok
import { sharingService, userService } from '../services/api';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

export default function SharedWithMe() {
  const [invites, setInvites] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [inviteToken, setInviteToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ open: false, text: '', severity: 'success' });

  // 1. ADATOK BETÖLTÉSE
  const loadData = async () => {
    try {
      setLoading(true);
      const [invitesData, calendarsData, profileData] = await Promise.all([
        sharingService.getInvites(),
        sharingService.getSharedCalendars(),
        userService.getProfile()
      ]);

      setInvites(invitesData);
      setCalendars(calendarsData);
      setInviteToken(profileData.inviteToken);
    } catch (error) {
      console.error("Hiba az adatok betöltésekor:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. MEGHÍVÓ KEZELÉSE (Elfogad/Elutasít)
  const handleInviteAction = async (id, action) => {
    try {
      if (action === 'accept') {
        await sharingService.acceptInvite(id);
        setMsg({ open: true, text: 'meghívó elfogadva', severity: 'success' });
      } else {
        await sharingService.rejectInvite(id);
        setMsg({ open: true, text: 'meghívó elutasítva', severity: 'info' });
      }
      loadData(); // Lista frissítése
    } catch (error) {
      setMsg({ open: true, text: 'hiba történt', severity: 'error' });
    }
  };

  // 3. KILÉPÉS NAPTÁRBÓL
  const handleLeave = async (id) => {
    if (window.confirm("biztosan ki akarsz lépni ebből a naptárból?")) {
      try {
        await sharingService.leaveCalendar(id);
        setMsg({ open: true, text: 'kiléptél a naptárból', severity: 'info' });
        loadData();
      } catch (error) {
        setMsg({ open: true, text: 'nem sikerült a kilépés', severity: 'error' });
      }
    }
  };

  // 4. LINK MÁSOLÁSA
  const copyLink = () => {
    const link = `${window.location.origin}/invite/${inviteToken}`;
    navigator.clipboard.writeText(link);
    setMsg({ open: true, text: 'link másolva a vágólapra', severity: 'success' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: BEIGE_THEME.background }}>
        <CircularProgress sx={{ color: BEIGE_THEME.accent }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BEIGE_THEME.background, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, pb: 12 }}>

      <Typography variant="h4" sx={{ fontWeight: 300, color: BEIGE_THEME.text, mb: 4, textTransform: 'lowercase', letterSpacing: 2 }}>
        veled megosztva.
      </Typography>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: '500px' }}>

        {/* FÜGGŐBEN LÉVŐ MEGHÍVÓK */}
        {invites.length > 0 && invites.map((invite) => (
          <Paper key={invite.id} elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: BEIGE_THEME.paper, border: `1px solid ${BEIGE_THEME.accent}` }}>
            <Typography sx={{ color: BEIGE_THEME.text, mb: 2, fontWeight: 500 }}>
              {invite.senderName} meghívott a naptárába
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => handleInviteAction(invite.id, 'reject')} variant="outlined" size="small" sx={{ borderColor: BEIGE_THEME.border, color: BEIGE_THEME.text, textTransform: 'lowercase', borderRadius: '8px' }}>
                elutasít
              </Button>
              <Button onClick={() => handleInviteAction(invite.id, 'accept')} variant="contained" size="small" sx={{ bgcolor: BEIGE_THEME.accent, color: 'white', boxShadow: 'none', textTransform: 'lowercase', borderRadius: '8px', '&:hover': { bgcolor: '#A89968' } }}>
                elfogad
              </Button>
            </Stack>
          </Paper>
        ))}

        {invites.length > 0 && <Divider sx={{ my: 1, borderColor: BEIGE_THEME.border, opacity: 0.5 }} />}

        {/* MÁR MEGOSZTOTT NAPTÁRAK */}
        {calendars.length === 0 && invites.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: BEIGE_THEME.text, opacity: 0.5, py: 4 }}>
            nincs jelenleg megosztott naptárad.
          </Typography>
        )}

        {calendars.map((cal) => (
          <Paper key={cal.id} elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: BEIGE_THEME.paper, border: `1px solid ${BEIGE_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PeopleOutlineIcon sx={{ color: BEIGE_THEME.accent, opacity: 0.7 }} />
              <Typography sx={{ color: BEIGE_THEME.text }}>
                {cal.ownerName} naptára
              </Typography>
            </Box>
            <Button onClick={() => handleLeave(cal.id)} variant="text" sx={{ color: BEIGE_THEME.text, opacity: 0.6, textTransform: 'lowercase', fontSize: '0.8rem' }}>
              kilépés
            </Button>
          </Paper>
        ))}

        {/* ALSÓ FUNKCIÓ: Link másolása */}
        <Box sx={{ pt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={copyLink}
            startIcon={<ContentCopyIcon fontSize="small" />}
            sx={{ py: 1.5, borderColor: BEIGE_THEME.border, color: BEIGE_THEME.text, borderRadius: '15px', textTransform: 'lowercase', fontSize: '0.85rem', borderStyle: 'dashed' }}
          >
            saját naptárba meghívó link másolása
          </Button>
        </Box>
      </Stack>

      {/* Visszajelző üzenetek (Sad Beige stílusban) */}
      <Snackbar open={msg.open} autoHideDuration={3000} onClose={() => setMsg({ ...msg, open: false })}>
        <Alert severity={msg.severity} sx={{ borderRadius: '12px', bgcolor: BEIGE_THEME.paper, color: BEIGE_THEME.text, border: `1px solid ${BEIGE_THEME.border}` }}>
          {msg.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}