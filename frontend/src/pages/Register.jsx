// src/pages/Register.jsx
// ================================================================
// Regisztrációs oldal — új felhasználó fiók létrehozása.
// Mezők: felhasználónév, email, jelszó, jelszó megerősítés.
// Sikeres regisztráció után automatikusan bejelentkezik és a főoldalra navigál.
// Stílus: azonos a Login oldallal (BEIGE_THEME).
// ================================================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert
} from '@mui/material';

// Azonos színpaletta a Login oldallal és a naptárral
const BEIGE_THEME = {
    background: '#F2EBE3',
    paper: '#FAF9F6',
    text: '#4A4238',
    accent: '#C2B280',
    accentHover: '#A89968',
    border: '#DED3C1'
};

// Közös stílus a TextField komponensekhez (DRY — ne ismételjük meg 4x)
const textFieldSx = {
    '& .MuiInput-underline:before': { borderBottomColor: BEIGE_THEME.border },
    '& .MuiInput-underline:after': { borderBottomColor: BEIGE_THEME.accent },
    '& .MuiInputLabel-root': { color: BEIGE_THEME.text, opacity: 0.6 },
    '& .MuiInputLabel-root.Mui-focused': { color: BEIGE_THEME.accent },
    input: { color: BEIGE_THEME.text }
};

export default function Register() {
    // ── State-ek ────────────────────────────────────────────────
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');        // Hibaüzenet megjelenítéséhez
    const [loading, setLoading] = useState(false);  // Gomb disabled állapothoz

    const { register } = useAuth();
    const navigate = useNavigate();

    // ── Form beküldés ───────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Előző hiba törlése

        // ── Frontend oldali validáció ───────────────────────────
        // Ezeket a backend is ellenőrzi, de jobb UX ha a frontend is szól.

        if (!username || !email || !password || !confirmPassword) {
            setError('Minden mező kitöltése kötelező');
            return;
        }

        // Email formátum ellenőrzés (egyszerű regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Érvénytelen email cím formátum');
            return;
        }

        // Jelszó minimum hossz
        if (password.length < 6) {
            setError('A jelszó legalább 6 karakter legyen');
            return;
        }

        // Jelszavak egyezésének ellenőrzése
        if (password !== confirmPassword) {
            setError('A két jelszó nem egyezik');
            return;
        }

        // ── API hívás ──────────────────────────────────────────
        try {
            setLoading(true);
            await register(username, email, password);
            // Sikeres regisztráció → automatikus bejelentkezés → főoldal
            navigate('/');
        } catch (err) {
            // A backend hibaüzenetét jelenítjük meg (pl. "Ez a felhasználónév már foglalt")
            setError(err.message || 'Hiba történt a regisztráció során');
        } finally {
            setLoading(false);
        }
    };

    // ── Megjelenítés ────────────────────────────────────────────
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
                    {/* ── Fejléc szövegek ──────────────────────── */}
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ mb: 1, fontWeight: 300, letterSpacing: -1 }}
                    >
                        regisztráció.
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ mb: 4, color: BEIGE_THEME.text, opacity: 0.7, textTransform: 'lowercase', letterSpacing: 1 }}
                    >
                        hozd létre a fiókodat
                    </Typography>

                    {/* ── Hibaüzenet megjelenítése ─────────────── */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                width: '100%',
                                mb: 2,
                                borderRadius: '12px',
                                backgroundColor: 'rgba(211, 47, 47, 0.05)',
                                color: '#d32f2f'
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* ── Form ────────────────────────────────── */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>

                        {/* Felhasználónév */}
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

                        {/* Email */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="email"
                            type="email"
                            variant="standard"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ ...textFieldSx, mt: 2 }}
                        />

                        {/* Jelszó */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="jelszó"
                            type="password"
                            variant="standard"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="minimum 6 karakter"
                            sx={{ ...textFieldSx, mt: 2 }}
                            FormHelperTextProps={{
                                sx: { color: BEIGE_THEME.text, opacity: 0.4 }
                            }}
                        />

                        {/* Jelszó megerősítés */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="jelszó megerősítés"
                            type="password"
                            variant="standard"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            // Ha a két jelszó nem egyezik és mindkettő ki van töltve, jelezzük
                            error={confirmPassword.length > 0 && password !== confirmPassword}
                            helperText={
                                confirmPassword.length > 0 && password !== confirmPassword
                                    ? 'a jelszavak nem egyeznek'
                                    : ''
                            }
                            sx={{ ...textFieldSx, mt: 2, mb: 4 }}
                        />

                        {/* ── Regisztráció gomb ───────────────── */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading} // Betöltés közben nem kattintható
                            sx={{
                                bgcolor: BEIGE_THEME.accent,
                                color: 'white',
                                '&:hover': { bgcolor: BEIGE_THEME.accentHover },
                                borderRadius: '12px',
                                py: 1.5,
                                textTransform: 'lowercase',
                                boxShadow: 'none',
                                fontSize: '1rem',
                                '&:disabled': { bgcolor: BEIGE_THEME.border }
                            }}
                        >
                            {loading ? 'regisztráció...' : 'regisztráció'}
                        </Button>

                        {/* ── Választóvonal ────────────────────── */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, width: '100%' }}>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: BEIGE_THEME.border }} />
                            <Typography variant="caption" sx={{ px: 2, color: BEIGE_THEME.text, opacity: 0.5, textTransform: 'lowercase' }}>
                                vagy
                            </Typography>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: BEIGE_THEME.border }} />
                        </Box>

                        {/* ── Bejelentkezés link ──────────────── */}
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                            sx={{
                                color: BEIGE_THEME.text,
                                opacity: 0.7,
                                textTransform: 'lowercase',
                                '&:hover': { bgcolor: 'transparent', opacity: 1 }
                            }}
                        >
                            már van fiókod? jelentkezz be
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
