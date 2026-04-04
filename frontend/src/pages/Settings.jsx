import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Divider
} from '@mui/material';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

export default function Settings() {
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: BEIGE_THEME.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 3
    }}>
      {/* Címsor a wireframe szerint */}
      <Typography variant="h4" sx={{
        fontWeight: 300,
        color: BEIGE_THEME.text,
        mb: 4,
        textTransform: 'lowercase',
        letterSpacing: 2
      }}>
        beállítások.
      </Typography>

      <Paper elevation={0} sx={{
        width: '100%',
        maxWidth: '400px',
        bgcolor: BEIGE_THEME.paper,
        borderRadius: '24px',
        p: 4,
        border: `1px solid ${BEIGE_THEME.border}`
      }}>
        <Stack spacing={3}>
          {/* Fő gombok a wireframe alapján */}
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: BEIGE_THEME.border,
              color: BEIGE_THEME.text,
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'lowercase'
            }}
          >
            nyelv választása
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: BEIGE_THEME.border,
              color: BEIGE_THEME.text,
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'lowercase'
            }}
          >
            időzóna választása
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: BEIGE_THEME.border,
              color: BEIGE_THEME.text,
              borderRadius: '12px',
              py: 1.5,
              textTransform: 'lowercase'
            }}
          >
            egyéb beállítások
          </Button>

          <Divider sx={{ my: 2, borderColor: BEIGE_THEME.border }} />

          {/* Probléma jelzése gomb */}
          <Button
            fullWidth
            variant="text"
            sx={{
              color: '#d32f2f', // Finom piros a hiba jelzéséhez
              opacity: 0.8,
              textTransform: 'lowercase'
            }}
          >
            probléma jelzése
          </Button>

          {/* Alsó akciógombok (Mégse / Mentés) */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="text"
              sx={{ color: BEIGE_THEME.text, textTransform: 'lowercase' }}
            >
              mégse
            </Button>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: BEIGE_THEME.accent,
                boxShadow: 'none',
                borderRadius: '12px',
                textTransform: 'lowercase',
                '&:hover': { bgcolor: '#A89968', boxShadow: 'none' }
              }}
            >
              mentés
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}