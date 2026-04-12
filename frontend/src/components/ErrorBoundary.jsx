import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  border: '#DED3C1'
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error, errorInfo) {
    // Későbbiekben ide loggolhatnánk a hibát valamilyen szolgáltatásba (Sentry, stb.)
    console.error("ErrorBoundary elkapta a hibát:", error, errorInfo);
  }

  handleReload = () => {
    // Egyszerűen újratöltjük az egész weblapot (ez tisztítja az aktuális React state-et)
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
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
              
              <Typography variant="h3" sx={{ fontWeight: 300, color: BEIGE_THEME.text, textTransform: 'lowercase', mb: 2 }}>
                hoppá, valami elromlott.
              </Typography>
              
              <Typography variant="body1" sx={{ color: BEIGE_THEME.text, opacity: 0.6, textTransform: 'lowercase', mb: 3 }}>
                a rendszer váratlan hibába ütközött. próbáld meg újratölteni az oldalt!
              </Typography>

              {/* Ha fejlesztői környezet, bónuszként pici betűkkel megmutathatjuk a hibát */}
              {import.meta.env.DEV && (
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.05)', p: 2, borderRadius: '8px', mb: 4, overflow: 'auto', textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#d32f2f' }}>
                    {this.state.errorInfo}
                  </Typography>
                </Box>
              )}

              <Button 
                variant="contained" 
                startIcon={<ReplayIcon />}
                onClick={this.handleReload} 
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
                oldal újratöltése
              </Button>

            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
