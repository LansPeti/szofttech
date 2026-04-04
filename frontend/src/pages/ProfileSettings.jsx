import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '../context/AuthContext';

// Sad Beige Színpaletta
const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

const AVATAR_COLORS = ['#C2B280', '#DED3C1', '#A89968', '#8E806A', '#E3D5CA', '#D5BDAF'];

export default function ProfileSettings() {
  const { logout } = useAuth();
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

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
        profil beállítások.
      </Typography>

      <Paper elevation={0} sx={{
        width: '100%',
        maxWidth: '450px',
        bgcolor: BEIGE_THEME.paper,
        borderRadius: '24px',
        p: 4,
        border: `1px solid ${BEIGE_THEME.border}`,
        boxShadow: '0 10px 30px rgba(74, 66, 56, 0.03)'
      }}>
        <Stack spacing={3} alignItems="center">

          {/* Profilkép ikon (Wireframe felső kör) */}
          <Avatar sx={{
            width: 90,
            height: 90,
            bgcolor: selectedColor,
            border: `5px solid white`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}>
            <PersonOutlineIcon sx={{ fontSize: 45, color: 'white' }} />
          </Avatar>

          {/* Adatbeviteli mezők (Wireframe középső rész) */}
          <Box sx={{ width: '100%' }}>
            <TextField
              variant="standard"
              label="felhasználónév"
              fullWidth
              defaultValue="Lakatos Tibor"
              sx={{ mb: 2, '& .MuiInputLabel-root': { textTransform: 'lowercase' } }}
            />
            <TextField
              variant="standard"
              label="eddigi jelszó"
              type="password"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              variant="standard"
              label="új jelszó"
              type="password"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              variant="standard"
              label="új jelszó még egyszer"
              type="password"
              fullWidth
              sx={{ mb: 4 }}
            />

            {/* Profilszín választása (A wireframe kis körei) */}
            <Typography variant="caption" sx={{ color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase', mb: 1, display: 'block' }}>
              profilszín választása
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: 4 }}>
              {AVATAR_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    border: selectedColor === color ? `2px solid ${BEIGE_THEME.text}` : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              ))}
            </Stack>

            {/* Meghívó link másolása (Wireframe alsó szekció) */}
            <Typography variant="caption" sx={{ color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase', display: 'block', mb: 1 }}>
              saját naptárba meghívó link másolása
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              endIcon={<ContentCopyIcon fontSize="small" />}
              sx={{
                mb: 4,
                borderColor: BEIGE_THEME.border,
                color: BEIGE_THEME.text,
                borderRadius: '12px',
                textTransform: 'lowercase',
                '&:hover': { borderColor: BEIGE_THEME.accent, bgcolor: 'transparent' }
              }}
            >
              másolás
            </Button>

            <Divider sx={{ mb: 2, borderColor: BEIGE_THEME.border, opacity: 0.5 }} />

            {/* Kiegészítő funkciók */}
            <Button fullWidth sx={{ color: '#d32f2f', textTransform: 'lowercase', opacity: 0.7, mb: 0.5 }}>
              probléma jelzése
            </Button>
            <Button
              fullWidth
              onClick={logout}
              sx={{ color: BEIGE_THEME.text, textTransform: 'lowercase', opacity: 0.7, mb: 4 }}
            >
              kijelentkezés
            </Button>

            {/* Fő akciógombok (Wireframe legalja) */}
            <Stack direction="row" spacing={2}>
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
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}