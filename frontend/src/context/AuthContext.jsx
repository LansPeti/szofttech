// src/context/AuthContext.jsx
// ================================================================
// Autentikációs context — a bejelentkezési állapotot kezeli.
//
// Jelenlegi állapot (1. nap):
//   - A login és register még MOCK (fake token) — a backend még nem kész.
//   - A 2. napon fogjuk átírni valós API hívásokra (authService.login/register).
//
// Amit biztosít a többi komponensnek:
//   - user: a bejelentkezett felhasználó adatai (vagy null ha nincs)
//   - loading: true amíg induláskor ellenőrizzük a tokent
//   - login(username, password): bejelentkezés
//   - register(username, email, password): regisztráció + automatikus bejelentkezés
//   - logout(): kijelentkezés
// ================================================================

import { createContext, useState, useContext, useEffect } from 'react';
// TODO (2. nap): importáljuk az API service-eket:
// import { authService, userService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Induláskor töltődik

    // ── Alkalmazás indulásakor: van-e elmentett token? ──────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // TODO (2. nap): valós profil lekérés a backendtől:
            // userService.getProfile()
            //     .then(profile => setUser({ token, ...profile }))
            //     .catch(() => { localStorage.removeItem('token'); setUser(null); })
            //     .finally(() => setLoading(false));
            setUser({ token });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    // ── Bejelentkezés ───────────────────────────────────────────
    const login = async (username, password) => {
        // TODO (2. nap): Valós backend hívás:
        // const data = await authService.login(username, password);
        // localStorage.setItem('token', data.token);
        // setUser({ token: data.token, id: data.id, username: data.username, email: data.email, avatarColor: data.avatarColor });

        // MOCK — amíg a backend nincs kész, fake tokennel dolgozunk
        console.log("Login kísérlet (mock):", username);
        const fakeToken = "szoftech_titkos_token_123";
        localStorage.setItem('token', fakeToken);
        setUser({ token: fakeToken, username });
    };

    // ── Regisztráció — sikeres esetben automatikus bejelentkezés ─
    const register = async (username, email, password) => {
        // TODO (2. nap): Valós backend hívás:
        // const data = await authService.register(username, email, password);
        // localStorage.setItem('token', data.token);
        // setUser({ token: data.token, id: data.id, username: data.username, email: data.email });

        // MOCK — amíg a backend nincs kész
        console.log("Register kísérlet (mock):", username, email);
        const fakeToken = "szoftech_titkos_token_register_123";
        localStorage.setItem('token', fakeToken);
        setUser({ token: fakeToken, username, email });
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