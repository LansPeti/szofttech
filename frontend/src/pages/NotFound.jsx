import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BEIGE_THEME.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          bgcolor: BEIGE_THEME.paper,
          borderRadius: '24px',
          p: 6,
          border: `1px solid ${BEIGE_THEME.border}`,
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
        }}>
          
          <Typography variant="h1" sx={{ fontWeight: 300, color: BEIGE_THEME.accent, fontSize: '6rem', letterSpacing: -2, mb: 2 }}>
            404.
          </Typography>
          
          <Typography variant="h5" sx={{ fontWeight: 300, color: BEIGE_THEME.text, mb: 1, textTransform: 'lowercase' }}>
            úgy tűnik, nagyon eltévedtél...
          </Typography>
          
          <Typography variant="body1" sx={{ color: BEIGE_THEME.text, opacity: 0.6, textTransform: 'lowercase', mb: 4 }}>
            az oldal, amit keresel valószínűleg nem is létezik, vagy elmozdították a helyéről.
          </Typography>

          <Button 
            variant="contained" 
            onClick={() => navigate('/')} 
            sx={{ 
              bgcolor: BEIGE_THEME.accent, 
              boxShadow: 'none', 
              borderRadius: '12px', 
              textTransform: 'lowercase', 
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              '&:hover': { bgcolor: '#A89968', boxShadow: 'none' } 
            }}
          >
            vissza a biztos pontra
          </Button>

        </Paper>
      </Container>
    </Box>
  );
}
