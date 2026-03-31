import { Box, Typography } from '@mui/material';

// TODO:
// Cél: Naptár nézet megvalósítása FullCalendar segítségével a 'Mai nap: XX.XX' wireframe alapján.
// Layout: Használj MUI Box-ot a naptár köré.
// State: A naptár eseményeket egyelőre veheted statikus mock adatból (egy tömbből) ebben a fájlban.
// Akciók: Gomb hozzáadása 'Új esemény' felirattal, ami egy MUI Dialog-ot (Modalt) nyit meg.

export default function CalendarPage() {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>Naptár Nézet</Typography>
            <Typography color="text.secondary">
                Ide jöhet a FullCalendar komponens az eseményekkel!
            </Typography>
        </Box>
    );
}