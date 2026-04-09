import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Container, Paper, Alert,
    InputAdornment, IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const BEIGE_THEME = {
    background: '#F2EBE3',
    paper: '#FAF9F6',
    text: '#4A4238',
    accent: '#C2B280',
    accentHover: '#A89968',
    border: '#DED3C1'
};

const textFieldSx = {
    '& .MuiInput-underline:before': { borderBottomColor: BEIGE_THEME.border },
    '& .MuiInput-underline:after': { borderBottomColor: BEIGE_THEME.accent },
    '& .MuiInputLabel-root': { color: BEIGE_THEME.text, opacity: 0.6 },
    '& .MuiInputLabel-root.Mui-focused': { color: BEIGE_THEME.accent },
    input: { color: BEIGE_THEME.text }
};

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Szem ikon állapota
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('A két jelszó nem egyezik');
            return;
        }

        try {
            setLoading(true);
            // FIGYELEM: A sorrendnek egyeznie kell az AuthContext register függvényével!
            await register(username, password, email);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Hiba történt a regisztráció során');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: BEIGE_THEME.background, minHeight: '100vh', display: 'flex' }}>
            <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ p: 5, width: '100%', bgcolor: BEIGE_THEME.paper, borderRadius: '24px', border: `1px solid ${BEIGE_THEME.border}` }}>
                    <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 300, textAlign: 'center' }}>regisztráció.</Typography>
                    
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField margin="normal" required fullWidth label="felhasználónév" variant="standard" value={username} onChange={(e) => setUsername(e.target.value)} sx={textFieldSx} />
                        
                        <TextField margin="normal" required fullWidth label="email" type="email" variant="standard" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ ...textFieldSx, mt: 2 }} />

                        <TextField
                            margin="normal" required fullWidth label="jelszó"
                            type={showPassword ? 'text' : 'password'}
                            variant="standard"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ ...textFieldSx, mt: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            margin="normal" required fullWidth label="jelszó megerősítés"
                            type={showPassword ? 'text' : 'password'}
                            variant="standard"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ ...textFieldSx, mt: 2, mb: 4 }}
                        />

                        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: BEIGE_THEME.accent, borderRadius: '12px', py: 1.5, textTransform: 'lowercase', boxShadow: 'none' }}>
                            {loading ? 'regisztráció...' : 'regisztráció'}
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: BEIGE_THEME.border }} />
                            <Typography variant="caption" sx={{ px: 2, color: BEIGE_THEME.text, opacity: 0.5 }}>vagy</Typography>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: BEIGE_THEME.border }} />
                        </Box>

                        {/* Google Regisztráció Gomb */}
                        <Button
                            fullWidth variant="outlined"
                            startIcon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>}
                            onClick={() => console.log("Google regisztráció")}
                            sx={{ color: BEIGE_THEME.text, borderColor: BEIGE_THEME.border, borderRadius: '12px', textTransform: 'none' }}
                        >
                            regisztráció google-fiókkal
                        </Button>

                        <Button fullWidth variant="text" onClick={() => navigate('/login')} sx={{ mt: 2, color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase' }}>
                            már van fiókod? jelentkezz be
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}