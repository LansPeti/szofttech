import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

// Mock adatok a wireframe alapján
const PENDING_INVITES = [
  { id: 1, name: 'Lakatos Tibor', message: 'meghívott a naptárába' }
];

const SHARED_CALENDARS = [
  { id: 2, name: 'Lapti Ferenc naptára' },
  { id: 3, name: 'Tódi Márton naptára' },
  { id: 4, name: 'Teleki Barnabás Zsolt naptára' }
];

export default function SharedWithMe() {
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: BEIGE_THEME.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 3,
      pb: 12 // Hely az alsó navigációnak
    }}>
      {/* Cím a wireframe alapján */}
      <Typography variant="h4" sx={{
        fontWeight: 300,
        color: BEIGE_THEME.text,
        mb: 4,
        textTransform: 'lowercase',
        letterSpacing: 2
      }}>
        veled megosztva.
      </Typography>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: '500px' }}>

        {/* FÜGGŐBEN LÉVŐ MEGHÍVÓK */}
        {PENDING_INVITES.map((invite) => (
          <Paper key={invite.id} elevation={0} sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: BEIGE_THEME.paper,
            border: `1px solid ${BEIGE_THEME.accent}` // Kiemelés a meghívónak
          }}>
            <Typography sx={{ color: BEIGE_THEME.text, mb: 2, fontWeight: 500 }}>
              {invite.name} {invite.message}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                sx={{ borderColor: BEIGE_THEME.border, color: BEIGE_THEME.text, textTransform: 'lowercase', borderRadius: '8px' }}
              >
                elutasít
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{ bgcolor: BEIGE_THEME.accent, color: 'white', boxShadow: 'none', textTransform: 'lowercase', borderRadius: '8px', '&:hover': { bgcolor: '#A89968' } }}
              >
                elfogad
              </Button>
            </Stack>
          </Paper>
        ))}

        <Divider sx={{ my: 1, borderColor: BEIGE_THEME.border, opacity: 0.5 }} />

        {/* MÁR MEGOSZTOTT NAPTÁRAK */}
        {SHARED_CALENDARS.map((calendar) => (
          <Paper key={calendar.id} elevation={0} sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: BEIGE_THEME.paper,
            border: `1px solid ${BEIGE_THEME.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PeopleOutlineIcon sx={{ color: BEIGE_THEME.accent, opacity: 0.7 }} />
              <Typography sx={{ color: BEIGE_THEME.text }}>
                {calendar.name}
              </Typography>
            </Box>
            <Button
              variant="text"
              sx={{ color: BEIGE_THEME.text, opacity: 0.6, textTransform: 'lowercase', fontSize: '0.8rem' }}
            >
              kilépés
            </Button>
          </Paper>
        ))}

        {/* ALSÓ FUNKCIÓ: Link másolása */}
        <Box sx={{ pt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ContentCopyIcon fontSize="small" />}
            sx={{
              py: 1.5,
              borderColor: BEIGE_THEME.border,
              color: BEIGE_THEME.text,
              borderRadius: '15px',
              textTransform: 'lowercase',
              fontSize: '0.85rem',
              borderStyle: 'dashed' // Jelezve, hogy ez egy speciális akció
            }}
          >
            saját naptárba meghívó link másolása
          </Button>
        </Box>

      </Stack>
    </Box>
  );
}