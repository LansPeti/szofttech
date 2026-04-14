import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
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

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    
    // Step 1 fields
    const [username, setUsername] = useState('');
    
    // Step 2 fields
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Common state
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username) {
            setError('Add meg a felhasználóneved!');
            return;
        }

        try {
            setLoading(true);
            const data = await authService.getSecurityQuestion(username);
            setSecurityQuestion(data.securityQuestion);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Hiba történt a felhasználó keresésekor');
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        setError('');

        if (!answer) {
            setError('A válasz megadása kötelező!');
            return;
        }

        if (newPassword.length < 6) {
            setError('A jelszónak legalább 6 karakter hosszúnak kell lennie');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('A két jelszó nem egyezik');
            return;
        }

        try {
            setLoading(true);
            await authService.resetPassword(username, answer, newPassword);
            setSuccessMessage('A jelszó sikeresen megváltoztatva! Most már bejelentkezhetsz.');
            // Késleltetett átirányítás a login oldalra
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Ebben az esetben a válasz helytelen lehet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: BEIGE_THEME.background, minHeight: '100vh', display: 'flex' }}>
            <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ p: 5, width: '100%', bgcolor: BEIGE_THEME.paper, borderRadius: '24px', border: `1px solid ${BEIGE_THEME.border}` }}>
                    
                    <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 300, textAlign: 'center' }}>
                        jelszó pótlása.
                    </Typography>

                    {successMessage && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{successMessage}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

                    {/* LÉPÉS 1: FELHASZNÁLÓNÉV */}
                    {step === 1 && !successMessage && (
                        <Box component="form" onSubmit={handleStep1Submit} sx={{ mt: 1, width: '100%' }}>
                            <Typography variant="body2" sx={{ mb: 3, color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase', textAlign: 'center' }}>
                                add meg a felhasználóneved, hogy lássuk a biztonsági kérdésed
                            </Typography>
                            
                            <TextField
                                margin="normal" required fullWidth label="felhasználónév"
                                variant="standard" value={username}
                                onChange={(e) => setUsername(e.target.value)} sx={{ ...textFieldSx, mb: 4 }}
                            />

                            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: BEIGE_THEME.accent, borderRadius: '12px', py: 1.5, textTransform: 'lowercase', boxShadow: 'none' }}>
                                {loading ? 'keresés...' : 'tovább'}
                            </Button>

                            <Button fullWidth variant="text" onClick={() => navigate('/login')} sx={{ mt: 2, color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase' }}>
                                vissza a bejelentkezéshez
                            </Button>
                        </Box>
                    )}

                    {/* LÉPÉS 2: KÉRDÉS MEGVÁLASZOLÁSA VAGY SIKER */}
                    {step === 2 && !successMessage && (
                        <Box component="form" onSubmit={handleStep2Submit} sx={{ mt: 1, width: '100%' }}>
                            
                            <Box sx={{ bgcolor: 'rgba(194, 178, 128, 0.1)', p: 2, borderRadius: '12px', mb: 3 }}>
                                <Typography variant="caption" sx={{ color: BEIGE_THEME.text, opacity: 0.5, textTransform: 'lowercase' }}>
                                    a te biztonsági kérdésed:
                                </Typography>
                                <Typography variant="body1" sx={{ color: BEIGE_THEME.text, fontWeight: 500 }}>
                                    {securityQuestion}
                                </Typography>
                            </Box>

                            <TextField
                                margin="normal" required fullWidth label="titkos válasz"
                                variant="standard" value={answer}
                                onChange={(e) => setAnswer(e.target.value)} sx={textFieldSx}
                            />

                            <TextField
                                margin="normal" required fullWidth label="új jelszó"
                                type={showPassword ? 'text' : 'password'}
                                variant="standard" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} sx={{ ...textFieldSx, mt: 2 }}
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
                                margin="normal" required fullWidth label="új jelszó megerősítése"
                                type={showPassword ? 'text' : 'password'}
                                variant="standard" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} sx={{ ...textFieldSx, mt: 2, mb: 4 }}
                            />

                            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ bgcolor: BEIGE_THEME.accent, borderRadius: '12px', py: 1.5, textTransform: 'lowercase', boxShadow: 'none' }}>
                                {loading ? 'ellenőrzés...' : 'jelszó megváltoztatása'}
                            </Button>

                            <Button fullWidth variant="text" onClick={() => setStep(1)} sx={{ mt: 2, color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase' }}>
                                újrakezdés
                            </Button>
                        </Box>
                    )}

                </Paper>
            </Container>
        </Box>
    );
}
