import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Container, Paper, Alert,
    InputAdornment, IconButton, Select, MenuItem, FormControl, InputLabel
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
    input: { color: BEIGE_THEME.text },
    '.MuiSelect-select': { color: BEIGE_THEME.text }
};

const SECURITY_QUESTIONS = [
    "Mi volt a jeled az óvodában?",
    "Mi a kedvenc könyved címe?",
    "Mi a kedvenc versed?",
    "Mi az édesanyád leánykori neve?",
    "Gyerekkori háziállatod neve?"
];

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Szem ikon állapota
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A jelszónak legalább 6 karakter hosszúnak kell lennie');
            return;
        }

        if (password !== confirmPassword) {
            setError('A két jelszó nem egyezik');
            return;
        }

        if (!securityAnswer.trim()) {
            setError('A biztonsági kérdésre adott válasz megadása kötelező');
            return;
        }

        try {
            setLoading(true);
            // FIGYELEM: A sorrendnek egyeznie kell az AuthContext register függvényével!
            await register(username, email, password, securityQuestion, securityAnswer);
            navigate(from, { replace: true });
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
                            sx={{ ...textFieldSx, mt: 2, mb: 3 }}
                        />

                        <FormControl fullWidth variant="standard" sx={{ ...textFieldSx, mb: 2 }}>
                            <InputLabel>biztonsági kérdés</InputLabel>
                            <Select
                                value={securityQuestion}
                                onChange={(e) => setSecurityQuestion(e.target.value)}
                                label="biztonsági kérdés"
                            >
                                {SECURITY_QUESTIONS.map((q, idx) => (
                                    <MenuItem key={idx} value={q}>{q}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            margin="normal" required fullWidth label="biztonsági válasz"
                            variant="standard"
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            sx={{ ...textFieldSx, mb: 4 }}
                        />

                        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: BEIGE_THEME.accent, borderRadius: '12px', py: 1.5, textTransform: 'lowercase', boxShadow: 'none' }}>
                            {loading ? 'regisztráció...' : 'regisztráció'}
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