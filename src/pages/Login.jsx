import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
        console.log(await fetch("/api/hello"))
        navigate('/'); // Sikeres belépés után irány a főoldal
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1e1e1e', color: 'white' }}>
                <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                    Üdvözlet!
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Felhasználónév"
                        variant="outlined"
                        InputLabelProps={{ style: { color: '#aaa' } }}
                        sx={{ input: { color: 'white' }, fieldset: { borderColor: '#555' } }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Jelszó"
                        type="password"
                        InputLabelProps={{ style: { color: '#aaa' } }}
                        sx={{ input: { color: 'white' }, fieldset: { borderColor: '#555' }, mb: 3 }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" fullWidth variant="outlined" sx={{ color: 'white', borderColor: 'white', mb: 2 }}>
                        Bejelentkezés
                    </Button>
                    <Button fullWidth variant="text" sx={{ color: '#aaa' }}>
                        Vissza
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}