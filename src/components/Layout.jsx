import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Ha nincs bejelentkezve, azonnal kidobjuk a loginra
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: '#1e1e1e' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Naptár Projekt
                    </Typography>
                    <IconButton color="inherit" onClick={() => navigate('/')}>
                        <HomeIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={() => navigate('/settings')}>
                        <SettingsIcon />
                    </IconButton>
                    <Button color="inherit" onClick={logout}>Kijelentkezés</Button>
                </Toolbar>
            </AppBar>

            {/* Ide fognak betöltődni az aloldalak (Calendar, Settings) */}
            <Box sx={{ p: 2 }}>
                <Outlet />
            </Box>
        </Box>
    );
}