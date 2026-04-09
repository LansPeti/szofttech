import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Stack, Paper, CircularProgress
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import huLocale from '@fullcalendar/core/locales/hu';

// API importálása
import { eventService } from '../services/api';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  accentHover: '#A89968',
  border: '#DED3C1'
};

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Betöltési állapot
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });

  // 1. ADATOK LEKÉRÉSE A BACKEND-RŐL
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      // A backendről jövő adatokat FullCalendar formátumra igazítjuk (színek hozzáadása)
      const formattedEvents = data.map(ev => ({
        ...ev,
        backgroundColor: ev.color || BEIGE_THEME.accent,
        borderColor: ev.color || BEIGE_THEME.accent,
        textColor: '#fff'
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Hiba az események lekérésekor:", error.message);
      // Itt később megjeleníthetsz egy hibaüzenetet a usernek (pl. Snackbar)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewEvent({ title: '', start: '', end: '' });
  };

  // 2. ÚJ ESEMÉNY MENTÉSE AZ API-VAL
  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.start) {
      try {
        const savedEvent = await eventService.create({
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end || newEvent.start, // Ha nincs vége, a kezdettel egyezik meg
          color: BEIGE_THEME.accent
        });

        // Hozzáadjuk a helyi állapothoz a szerver által adott ID-val
        setEvents([...events, {
          ...savedEvent,
          backgroundColor: BEIGE_THEME.accent,
          borderColor: BEIGE_THEME.accent,
          textColor: '#fff'
        }]);

        handleClose();
      } catch (error) {
        alert("Nem sikerült menteni az eseményt: " + error.message);
      }
    }
  };

  const today = new Date();
  const formattedToday = `mai nap: ${today.toLocaleDateString('hu-HU', { 
    year: '2-digit', month: '2-digit', day: '2-digit' 
  }).replace(/\s/g, '')}`;

  return (
    <Box sx={{
      maxHeight: '100vh', overflow: 'hidden', bgcolor: BEIGE_THEME.background,
      p: { xs: 1, md: 3 }, color: BEIGE_THEME.text
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 300, letterSpacing: -1, color: BEIGE_THEME.text, textTransform: 'lowercase' }}>
            {formattedToday}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          {loading && <CircularProgress size={20} sx={{ color: BEIGE_THEME.accent }} />}
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              bgcolor: BEIGE_THEME.accent,
              '&:hover': { bgcolor: BEIGE_THEME.accentHover },
              borderRadius: '12px', px: 3, textTransform: 'none', boxShadow: 'none', height: '40px'
            }}
          >
            Új esemény
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{
        p: 2, borderRadius: '12px', bgcolor: BEIGE_THEME.paper, border: `1px solid ${BEIGE_THEME.border}`,
        '& .fc': { '--fc-border-color': BEIGE_THEME.border, fontFamily: 'inherit', fontSize: '0.85rem' },
        '& .fc-toolbar-title': { fontSize: '1.1rem !important', fontWeight: 400 },
        '& .fc-button': {
          bgcolor: 'transparent', color: BEIGE_THEME.text, border: `1px solid ${BEIGE_THEME.border}`,
          textTransform: 'lowercase', padding: '4px 8px'
        },
        '& .fc-button-active': { bgcolor: `${BEIGE_THEME.accent} !important`, border: 'none !important', color: '#fff !important' },
        '& .fc-timegrid-slot': { height: '3em !important' }
      }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale={huLocale}
          events={events}
          height="calc(100vh - 180px)"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          dayHeaderFormat={{ month: '2-digit', day: '2-digit', weekday: 'long', omitCommas: true }}
          allDaySlot={true}
          nowIndicator={true}
          stickyHeaderDates={true}
          // Itt lehetne kezelni a kattintást vagy húzást is:
          // eventClick={(info) => console.log('Törlés/Módosítás?', info.event.id)}
        />
      </Paper>

      {/* Dialog az új eseményhez */}
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: '12px', bgcolor: BEIGE_THEME.paper } }}>
        <DialogTitle sx={{ color: BEIGE_THEME.text }}>Esemény rögzítése</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: '300px' }}>
            <TextField
              variant="standard"
              label="Cím"
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <TextField
              variant="standard"
              type="datetime-local" // Átírva dátum+időre az ergonómia miatt
              label="Kezdet"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
            />
            <TextField
              variant="standard"
              type="datetime-local"
              label="Vége (opcionális)"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} sx={{ color: BEIGE_THEME.text }}>Mégse</Button>
          <Button
            onClick={handleAddEvent}
            variant="contained"
            disabled={!newEvent.title || !newEvent.start}
            sx={{ bgcolor: BEIGE_THEME.accent, boxShadow: 'none' }}
          >
            Mentés
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}