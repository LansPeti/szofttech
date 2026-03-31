import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Alkalmazás indulásakor megnézzük, van-e elmentett token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ token }); // Itt később a tokenből dekódolt adatokat is beteheted
        }
    }, []);

    const login = async (username, password) => {
        // TODO: Itt lesz a valós backend hívás a Spring Boot felé!
        // const response = await axios.post('/api/auth/login', { username, password });
        // const token = response.data.token;

        console.log("Login kísérlet:", username);
        const fakeToken = "szoftech_titkos_token_123";
        localStorage.setItem('token', fakeToken);
        setUser({ token: fakeToken });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);