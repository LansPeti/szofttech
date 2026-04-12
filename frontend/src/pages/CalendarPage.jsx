import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Stack, Paper, CircularProgress,
  Switch, FormControlLabel, Snackbar, Alert
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import huLocale from '@fullcalendar/core/locales/hu';

// API importálása — minden backend hívás ezen keresztül megy
import { eventService, sharingService } from '../services/api';

// ================================================================
// Egységes beige szín téma az egész alkalmazásban
// ================================================================
const BEIGE_THEME = {
  background: '#F2EBE3',
  paper: '#FAF9F6',
  text: '#4A4238',
  accent: '#C2B280',
  accentHover: '#A89968',
  border: '#DED3C1'
};

// Választható eseményszínek — ugyanazok mint a ProfileSettings-ben
const EVENT_COLORS = ['#C2B280', '#DED3C1', '#A89968', '#8E806A', '#E3D5CA', '#D5BDAF'];

// Üres esemény sablon — új esemény létrehozásakor vagy dialog alaphelyzetbe állításakor
const EMPTY_EVENT = {
  id: null,
  title: '',
  description: '',
  start: '',
  end: '',
  allDay: false,
  color: '#C2B280'
};

export default function CalendarPage() {
  // ── Állapotok ──────────────────────────────────────────────────
  const [events, setEvents] = useState([]);            // Az összes esemény a naptárban
  const [loading, setLoading] = useState(true);         // Betöltési állapot
  const [open, setOpen] = useState(false);              // Dialog nyitva/zárva
  const [isEditing, setIsEditing] = useState(false);    // Szerkesztés mód (true) vagy új létrehozás (false)
  const [newEvent, setNewEvent] = useState({ ...EMPTY_EVENT }); // A dialog által kezelt esemény adatai
  const [msg, setMsg] = useState({ open: false, text: '', severity: 'success' }); // Visszajelző üzenetek

  // ── 1. ESEMÉNYEK BETÖLTÉSE A BACKEND-RŐL ──────────────────────
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // 1. Lekérjük a saját eseményeket
      const myEventsData = await eventService.getAll();
      const myFormattedEvents = myEventsData.map(ev => ({
        ...ev,
        backgroundColor: ev.color || BEIGE_THEME.accent,
        borderColor: ev.color || BEIGE_THEME.accent,
        textColor: '#fff'
      }));

      // 2. Lekérjük a megosztott naptárak (akik felvettek engem) listáját
      const sharedCalendars = await sharingService.getSharedCalendars();
      
      // 3. Lekérjük a megosztó kollégák összes eseményét
      const sharedEventsPromises = sharedCalendars.map(async (cal) => {
        try {
          const ownerEvents = await sharingService.getSharedEvents(cal.owner.id);
          return ownerEvents.map(ev => ({
            ...ev,
            title: `${ev.title} (${cal.owner.username})`, // Megkülönböztetjük a címet
            backgroundColor: ev.color || '#8E806A', // Kicsit sötétebb alapszín fallback
            borderColor: ev.color || '#8E806A',
            textColor: '#fff',
            editable: false, // Fontos! Megakadályozza a Drag & Drop-ot a kalendárban
            extendedProps: {
              ...ev, // Ha van description azt is megtartjuk
              isShared: true,
              ownerUsername: cal.owner.username
            }
          }));
        } catch (err) {
          console.error(`Nem sikerült letölteni ${cal.owner.username} naptárát`, err);
          return []; // Ha az egyiké elszáll, a többit még betöltjük
        }
      });

      // Megvárjuk a Promise tömb végét és kilaposítjuk az eredményt
      const sharedEventsNested = await Promise.all(sharedEventsPromises);
      const allSharedEvents = sharedEventsNested.flat();

      // 4. Bepumpáljuk mindet a közös naptárba
      setEvents([...myFormattedEvents, ...allSharedEvents]);
    } catch (error) {
      console.error("Hiba az események lekérésekor:", error.message);
      setMsg({ open: true, text: 'Nem sikerült betölteni az eseményeket', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Komponens betöltésekor egyszer lekérdezzük az eseményeket
  useEffect(() => {
    fetchEvents();
  }, []);

  // ── Dialog kezelés ─────────────────────────────────────────────
  const handleOpen = () => {
    setNewEvent({ ...EMPTY_EVENT });
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewEvent({ ...EMPTY_EVENT });
    setIsEditing(false);
  };

  // ── 2. ÚJ ESEMÉNY MENTÉSE VAGY MEGLÉVŐ SZERKESZTÉSE ───────────
  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.start) return;

    try {
      // Az adatokat összeállítjuk a backend számára
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || '',
        start: newEvent.start,
        end: newEvent.end || newEvent.start,
        allDay: newEvent.allDay,
        color: newEvent.color || BEIGE_THEME.accent
      };

      if (isEditing && newEvent.id) {
        // ── SZERKESZTÉS: PUT kérés a backend felé ──
        const updated = await eventService.update(newEvent.id, eventData);
        // A lokális events listában is frissítjük a módosított eseményt
        setEvents(events.map(e =>
          e.id === updated.id
            ? { ...updated, backgroundColor: updated.color, borderColor: updated.color, textColor: '#fff' }
            : e
        ));
        setMsg({ open: true, text: 'Esemény módosítva', severity: 'success' });
      } else {
        // ── LÉTREHOZÁS: POST kérés a backend felé ──
        const created = await eventService.create(eventData);
        // A létrehozott eseményt hozzáadjuk a lokális listához
        setEvents([...events, {
          ...created,
          backgroundColor: created.color || BEIGE_THEME.accent,
          borderColor: created.color || BEIGE_THEME.accent,
          textColor: '#fff'
        }]);
        setMsg({ open: true, text: 'Esemény létrehozva', severity: 'success' });
      }

      handleClose();
    } catch (error) {
      setMsg({ open: true, text: 'Hiba: ' + error.message, severity: 'error' });
    }
  };

  // ── 3. ESEMÉNY TÖRLÉSE ─────────────────────────────────────────
  const handleDeleteEvent = async () => {
    try {
      await eventService.delete(newEvent.id);
      // A törölt eseményt eltávolítjuk a lokális listából
      setEvents(events.filter(e => e.id !== newEvent.id));
      setMsg({ open: true, text: 'Esemény törölve', severity: 'success' });
      handleClose();
    } catch (error) {
      setMsg({ open: true, text: 'Nem sikerült törölni: ' + error.message, severity: 'error' });
    }
  };

  // ── 4. KATTINTÁS MEGLÉVŐ ESEMÉNYRE — Szerkesztés dialog megnyitása ──
  const handleEventClick = (info) => {
    const event = info.event;

    // 🔥 Read-Only VÉDELEM: Ha ez egy megosztott esemény, ne nyissuk meg a szerkesztőt!
    if (event.extendedProps?.isShared) {
      setMsg({ open: true, text: `Ezt az eseményt ${event.extendedProps.ownerUsername} osztotta meg veled, így nem módosíthatod.`, severity: 'info' });
      return;
    }

    // A FullCalendar event objektumából kiolvassuk az adatokat
    setNewEvent({
      id: event.id,
      title: event.title,
      description: event.extendedProps?.description || '',
      // Az ISO stringet visszaalakítjuk datetime-local input formátumra
      start: formatToLocalInput(event.start),
      end: event.end ? formatToLocalInput(event.end) : '',
      allDay: event.allDay || false,
      color: event.backgroundColor || BEIGE_THEME.accent
    });
    setIsEditing(true);
    setOpen(true);
  };

  // ── 5. DRAG & DROP — Esemény áthúzása másik időpontra ──────────
  const handleEventDrop = async (info) => {
    try {
      await eventService.update(info.event.id, {
        start: info.event.start.toISOString(),
        end: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()
      });
      // A lokális listát is frissítjük
      setEvents(events.map(e =>
        e.id === info.event.id
          ? { ...e, start: info.event.startStr, end: info.event.endStr }
          : e
      ));
    } catch (error) {
      // Ha a mentés nem sikerült, visszahelyezzük az eredeti pozícióba
      info.revert();
      setMsg({ open: true, text: 'Nem sikerült áthelyezni', severity: 'error' });
    }
  };

  // ── 6. RESIZE — Esemény méretének megváltoztatása (végidőpont húzás) ──
  const handleEventResize = async (info) => {
    try {
      await eventService.update(info.event.id, {
        end: info.event.end ? info.event.end.toISOString() : null
      });
      setEvents(events.map(e =>
        e.id === info.event.id
          ? { ...e, end: info.event.endStr }
          : e
      ));
    } catch (error) {
      info.revert();
      setMsg({ open: true, text: 'Nem sikerült átméretezni', severity: 'error' });
    }
  };

  // ── Segédfüggvény: ISO dátumot datetime-local input formátumra ──
  // Az input type="datetime-local" ezt a formátumot várja: "2026-04-10T09:00"
  function formatToLocalInput(date) {
    if (!date) return '';
    const d = new Date(date);
    // Helyi időzóna szerinti formázás az input számára
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Mai nap kiírása a fejlécben
  const today = new Date();
  const formattedToday = `mai nap: ${today.toLocaleDateString('hu-HU', {
    year: '2-digit', month: '2-digit', day: '2-digit'
  }).replace(/\s/g, '')}`;

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <Box sx={{
      maxHeight: '100vh', overflow: 'hidden', bgcolor: BEIGE_THEME.background,
      p: { xs: 1, md: 3 }, color: BEIGE_THEME.text
    }}>
      {/* ── Fejléc: mai dátum + új esemény gomb ── */}
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

      {/* ── FullCalendar nézet ── */}
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
          views={{
            dayGridMonth: {
              dayHeaderFormat: { weekday: 'long' }
            },
            timeGrid: {
              dayHeaderFormat: { month: '2-digit', day: '2-digit', weekday: 'long', omitCommas: true }
            }
          }}
          allDaySlot={true}
          nowIndicator={true}
          stickyHeaderDates={true}
          // ── Interaktivitás: szerkesztés, drag & drop ──
          editable={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
        />
      </Paper>

      {/* ════════════════════════════════════════════════════════════
          ESEMÉNY DIALOG — Létrehozás és szerkesztés egyaránt
          ════════════════════════════════════════════════════════════ */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { borderRadius: '16px', bgcolor: BEIGE_THEME.paper, minWidth: '380px' } }}
      >
        <DialogTitle sx={{ color: BEIGE_THEME.text, fontWeight: 400 }}>
          {isEditing ? 'Esemény szerkesztése' : 'Új esemény rögzítése'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Esemény címe */}
            <TextField
              variant="standard"
              label="Cím"
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />

            {/* Leírás — opcionális szöveges mező */}
            <TextField
              variant="standard"
              label="Leírás (opcionális)"
              fullWidth
              multiline
              minRows={2}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />

            {/* Egész napos kapcsoló */}
            <FormControlLabel
              control={
                <Switch
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: BEIGE_THEME.accent },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: BEIGE_THEME.accent }
                  }}
                />
              }
              label={<Typography variant="body2" sx={{ color: BEIGE_THEME.text }}>Egész napos</Typography>}
            />

            {/* Kezdő dátum/idő */}
            <TextField
              variant="standard"
              type={newEvent.allDay ? "date" : "datetime-local"}
              label="Kezdet"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
            />

            {/* Befejező dátum/idő */}
            <TextField
              variant="standard"
              type={newEvent.allDay ? "date" : "datetime-local"}
              label="Vége (opcionális)"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
            />

            {/* Színválasztó körök */}
            <Box>
              <Typography variant="caption" sx={{ color: BEIGE_THEME.text, opacity: 0.7, mb: 1, display: 'block' }}>
                Esemény színe
              </Typography>
              <Stack direction="row" spacing={1}>
                {EVENT_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: color,
                      cursor: 'pointer',
                      border: newEvent.color === color ? `3px solid ${BEIGE_THEME.text}` : '3px solid transparent',
                      transition: '0.2s',
                      '&:hover': { transform: 'scale(1.15)' }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: isEditing ? 'space-between' : 'flex-end' }}>
          {/* Törlés gomb — csak szerkesztés módban jelenik meg */}
          {isEditing && (
            <Button
              onClick={handleDeleteEvent}
              startIcon={<DeleteOutlineIcon />}
              sx={{ color: '#d32f2f', textTransform: 'lowercase' }}
            >
              Törlés
            </Button>
          )}

          <Stack direction="row" spacing={1}>
            <Button onClick={handleClose} sx={{ color: BEIGE_THEME.text, textTransform: 'lowercase' }}>
              Mégse
            </Button>
            <Button
              onClick={handleSaveEvent}
              variant="contained"
              disabled={!newEvent.title || !newEvent.start}
              sx={{ bgcolor: BEIGE_THEME.accent, boxShadow: 'none', borderRadius: '10px', textTransform: 'lowercase', '&:hover': { bgcolor: BEIGE_THEME.accentHover } }}
            >
              {isEditing ? 'Mentés' : 'Létrehozás'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* ── Visszajelző üzenetek (Snackbar) ── */}
      <Snackbar open={msg.open} autoHideDuration={3000} onClose={() => setMsg({ ...msg, open: false })}>
        <Alert
          severity={msg.severity}
          sx={{ borderRadius: '12px', bgcolor: BEIGE_THEME.paper, color: BEIGE_THEME.text, border: `1px solid ${BEIGE_THEME.border}` }}
        >
          {msg.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}