import { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Alkalmazás indulásakor: profil lekérése a token alapján ──
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Megpróbáljuk lekérni a valós profiladatokat a tokennel
            userService.getProfile()
                .then(profile => {
                    setUser({ token, ...profile });
                })
                .catch(() => {
                    // Ha a token lejárt vagy hibás, töröljük
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // ── Bejelentkezés ───────────────────────────────────────────
    const login = async (username, password) => {
        try {
            // Hívás az api.js-ben definiált service-en keresztül
            const data = await authService.login(username, password);

            // Adatok mentése
            localStorage.setItem('token', data.token);
            setUser({
                token: data.token,
                id: data.id,
                username: data.username,
                avatarColor: data.avatarColor
            });

            return data;
        } catch (err) {
            // A hibát továbbdobjuk a Login.jsx-nek, hogy meg tudja jeleníteni
            throw err;
        }
    };

    // ── Regisztráció ────────────────────────────────────────────
    const register = async (username, password, email) => {
        try {
            const data = await authService.register(username, password, email);

            // Regisztráció után automatikusan be is jelentkeztetjük
            localStorage.setItem('token', data.token);
            setUser({
                token: data.token,
                id: data.id,
                username: data.username
            });

            return data;
        } catch (err) {
            throw err;
        }
    };

    // ── Kijelentkezés ───────────────────────────────────────────
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);