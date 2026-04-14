import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'; // Új gombhoz
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // Új gombhoz

// Sad Beige Színpaletta
const BEIGE_THEME = {
    background: '#F2EBE3',
    paper: '#FAF9F6',
    text: '#4A4238',
    accent: '#C2B280',
    border: '#DED3C1'
};

export default function Layout() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Ha még tölt a session, ne csináljunk semmit (különben az F5 kidobna)
    if (loading) {
        return null;
    }

    // Logika változatlan: Ha nincs bejelentkezve, azonnal kidobjuk a loginra,
    // de eltároljuk, hogy hova akart menni
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: BEIGE_THEME.background }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: BEIGE_THEME.paper,
                    borderBottom: `1px solid ${BEIGE_THEME.border}`,
                    color: BEIGE_THEME.text
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 300,
                            letterSpacing: 1,
                            textTransform: 'lowercase'
                        }}
                    >
                        naptár projekt.
                    </Typography>

                    <Stack direction="row" spacing={1}>
                        <Tooltip title="főoldal">
                            <IconButton onClick={() => navigate('/')} sx={{ color: BEIGE_THEME.text }}>
                                <HomeIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {/* ÚJ GOMB: Velem megosztva */}
                        <Tooltip title="velem megosztva">
                            <IconButton onClick={() => navigate('/shared')} sx={{ color: BEIGE_THEME.text }}>
                                <PeopleOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {/* ÚJ GOMB: Profil */}
                        <Tooltip title="profil">
                            <IconButton onClick={() => navigate('/profile')} sx={{ color: BEIGE_THEME.text }}>
                                <PersonOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Button
                            onClick={logout}
                            sx={{
                                color: BEIGE_THEME.text,
                                textTransform: 'lowercase',
                                ml: 2,
                                opacity: 0.7,
                                '&:hover': { opacity: 1, bgcolor: 'transparent' }
                            }}
                        >
                            kijelentkezés
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Ide fognak betöltődni az aloldalak (Calendar, Settings, Shared, Profile) */}
            <Box sx={{ p: 0 }}>
                <Outlet />
            </Box>
        </Box>
    );
}

// Segédkomponens a Stack-hez, ha nincs importálva:
import { Stack } from '@mui/material';