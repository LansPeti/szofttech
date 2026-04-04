import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Ez reseteli a böngésző alap stílusait, kell a MUI-hoz */}
        <CssBaseline />
        <App />
    </React.StrictMode>
);