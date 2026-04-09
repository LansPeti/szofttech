import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress, Stack } from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { sharingService } from '../services/api';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

export default function InvitePage() {
  const { token } = useParams(); // Kinyeri a token-t az URL-ből
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAcceptInvite = async () => {
    try {
      setLoading(true);
      await sharingService.sendInvite(token); // Az api.js-ben ez küldi el a tokent
      navigate('/shared-with-me'); // Siker esetén a közös naptárakhoz visz
    } catch (err) {
      setError('A meghívó érvénytelen vagy már felhasználták.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: BEIGE_THEME.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: 3
    }}>
      <Paper elevation={0} sx={{
        p: 5,
        borderRadius: '30px',
        bgcolor: BEIGE_THEME.paper,
        border: `1px solid ${BEIGE_THEME.border}`,
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <PeopleOutlineIcon sx={{ fontSize: 60, color: BEIGE_THEME.accent, mb: 2 }} />

        <Typography variant="h5" sx={{ color: BEIGE_THEME.text, fontWeight: 300, mb: 2, textTransform: 'lowercase' }}>
          meghívót kaptál!
        </Typography>

        <Typography sx={{ color: BEIGE_THEME.text, opacity: 0.8, mb: 4, lineHeight: 1.6 }}>
          egy barátod szeretné megosztani veled a naptárát, hogy lássátok egymás szabadidőit.
        </Typography>

        {error && (
          <Typography sx={{ color: '#d32f2f', mb: 2, fontSize: '0.9rem' }}>
            {error}
          </Typography>
        )}

        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAcceptInvite}
            disabled={loading}
            sx={{
              bgcolor: BEIGE_THEME.accent,
              boxShadow: 'none',
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'lowercase',
              '&:hover': { bgcolor: '#A89968' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'naptár hozzáadása'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/')}
            sx={{ color: BEIGE_THEME.text, textTransform: 'lowercase' }}
          >
            mégse
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}