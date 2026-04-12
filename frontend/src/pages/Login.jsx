import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Design konstansok
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

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Visszanavigálás oda, ahonnan a user kidobódott
    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Minden mező kitöltése kötelező');
            return;
        }

        try {
            setLoading(true);
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Hiba történt a bejelentkezés során');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: BEIGE_THEME.background, minHeight: '100vh', display: 'flex' }}>
            <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: BEIGE_THEME.paper,
                        color: BEIGE_THEME.text,
                        borderRadius: '24px',
                        border: `1px solid ${BEIGE_THEME.border}`,
                        boxShadow: '0 10px 30px rgba(74, 66, 56, 0.05)'
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 300, letterSpacing: -1 }}>
                        üdvözlet.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 4, color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase', letterSpacing: 1 }}>
                        jelentkezz be a naptáradba
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="felhasználónév"
                            variant="standard"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={textFieldSx}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="jelszó"
                            type={showPassword ? 'text' : 'password'}
                            variant="standard"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ ...textFieldSx, mt: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: BEIGE_THEME.text, opacity: 0.6 }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* ELFELEJTETT JELSZÓ LINK */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 0.5 }}>
                            <Button
                                variant="text"
                                onClick={() => navigate('/forgot-password')}
                                sx={{
                                    color: BEIGE_THEME.text,
                                    opacity: 0.5,
                                    fontSize: '0.7rem',
                                    textTransform: 'lowercase',
                                    '&:hover': { bgcolor: 'transparent', opacity: 1 }
                                }}
                            >
                                elfelejtett jelszó?
                            </Button>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                bgcolor: BEIGE_THEME.accent,
                                color: 'white',
                                '&:hover': { bgcolor: BEIGE_THEME.accentHover },
                                borderRadius: '12px',
                                py: 1.5,
                                textTransform: 'lowercase',
                                boxShadow: 'none'
                            }}
                        >
                            {loading ? 'bejelentkezés...' : 'bejelentkezés'}
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/register')}
                            sx={{ mt: 2, color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase' }}
                        >
                            nincs még fiókod? regisztrálj
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}