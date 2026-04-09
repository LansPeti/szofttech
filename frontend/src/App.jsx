// src/App.jsx
// ================================================================
// Az alkalmazás fő komponense — route-ok definiálása.
// A Layout komponens védi a bejelentkezett útvonalakat:
// ha nincs user, automatikusan a /login-ra irányít.
// ================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CalendarPage from './pages/CalendarPage';
import Settings from './pages/Settings';
import ProfileSettings from "./pages/ProfileSettings";
import SharedWithMe from "./pages/SharedWithMe";
import InvitePage from "./pages/InvitePage.jsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Publikus útvonalak — bejelentkezés nélkül is elérhetők */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Védett útvonalak — a Layout ellenőrzi, hogy be van-e jelentkezve */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<CalendarPage />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/shared" element={<SharedWithMe />} />
                        <Route path="/profile" element={<ProfileSettings />} />
                        <Route path="/invite/:token" element={<InvitePage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;