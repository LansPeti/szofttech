import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import CalendarPage from './pages/CalendarPage';
import Settings from './pages/Settings';
import ProfileSettings from "./pages/ProfileSettings"; // Javítva
import SharedWithMe from "./pages/SharedWithMe"; // Hozzáadva

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Védett útvonalak a Layout-on belül */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<CalendarPage />} />
                        <Route path="/settings" element={<Settings />} />
                        {/* Figyelj, hogy a path-ek egyezzenek a Layout navigációjával! */}
                        <Route path="/shared" element={<SharedWithMe />} />
                        <Route path="/profile" element={<ProfileSettings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;