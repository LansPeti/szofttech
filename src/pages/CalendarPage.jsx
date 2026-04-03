import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack,
  Paper
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import huLocale from '@fullcalendar/core/locales/hu';

const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  accentHover: '#A89968',
  border: '#DED3C1'
};

const MOCK_EVENTS = [
  { id: '1', title: 'Design megbeszélés', start: '2026-04-03T10:00:00', end: '2026-04-03T12:00:00', backgroundColor: '#C2B280', borderColor: '#C2B280' },
  { id: '2', title: 'Kávézás', start: '2026-04-05T14:30:00', backgroundColor: '#DED3C1', borderColor: '#DED3C1', textColor: '#4A4238' },
];

export default function CalendarPage() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewEvent({ title: '', start: '' });
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start) {
      setEvents([...events, {
        id: Math.random().toString(),
        ...newEvent,
        backgroundColor: BEIGE_THEME.accent,
        borderColor: BEIGE_THEME.accent
      }]);
      handleClose();
    }
  };

  // Mai dátum formázása: "mai nap: 04.03.26"
  const today = new Date();
  const formattedToday = `mai nap: ${today.toLocaleDateString('hu-HU', { 
    year: '2-digit', 
    month: '2-digit', 
    day: '2-digit' 
  }).replace(/\s/g, '')}`;

  return (
    <Box sx={{
      maxHeight: '100vh',
      overflow: 'hidden',
      bgcolor: BEIGE_THEME.background,
      p: { xs: 1, md: 3 },
      color: BEIGE_THEME.text
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 300, letterSpacing: -1, color: BEIGE_THEME.text, textTransform: 'lowercase' }}>
            {formattedToday}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            bgcolor: BEIGE_THEME.accent,
            '&:hover': { bgcolor: BEIGE_THEME.accentHover },
            borderRadius: '12px',
            px: 3,
            textTransform: 'none',
            boxShadow: 'none',
            height: '40px'
          }}
        >
          Új esemény
        </Button>
      </Stack>

      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: '12px',
        bgcolor: BEIGE_THEME.paper,
        border: `1px solid ${BEIGE_THEME.border}`,
        '& .fc': {
            '--fc-border-color': BEIGE_THEME.border,
            fontFamily: 'inherit',
            fontSize: '0.85rem'
        },
        '& .fc-toolbar-title': { fontSize: '1.1rem !important', fontWeight: 400 },
        '& .fc-button': {
          bgcolor: 'transparent',
          color: BEIGE_THEME.text,
          border: `1px solid ${BEIGE_THEME.border}`,
          textTransform: 'lowercase',
          padding: '4px 8px'
        },
        '& .fc-button-active': { bgcolor: `${BEIGE_THEME.accent} !important`, border: 'none !important', color: '#fff !important' },
        // Idősáv rácsának finomítása
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

          // 1. Megoldás: 0-tól 24 óráig tartó skála a heti/napi nézetben
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"

          // 2. Megoldás: Fejléc formátuma a heti nézethez (pl. 04.03 Péntek)
          dayHeaderFormat={{
            month: '2-digit',
            day: '2-digit',
            weekday: 'long',
            omitCommas: true
          }}

          allDaySlot={true}
          nowIndicator={true}
          stickyHeaderDates={true}
        />
      </Paper>

      {/* Dialog változatlanul */}
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: '12px', bgcolor: BEIGE_THEME.paper } }}>
        <DialogTitle sx={{ color: BEIGE_THEME.text }}>Esemény rögzítése</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: '300px' }}>
            <TextField variant="standard" label="Cím" fullWidth value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            <TextField variant="standard" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newEvent.start} onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} sx={{ color: BEIGE_THEME.text }}>Mégse</Button>
          <Button onClick={handleAddEvent} variant="contained" sx={{ bgcolor: BEIGE_THEME.accent, boxShadow: 'none' }}>Mentés</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}