# 🎨 Frontend Fejlesztői Útmutató — Naptár Projekt

> **Projekt:** Google Calendar klón (szoftvertechnológia házi)  
> **Csapat:** 4 fő (2 backend + 2 frontend)  
> **Határidő:** 1 hét  
> **Frontend tech stack:** React 19 + Vite (port `5173`) + MUI + FullCalendar  
> **Backend tech stack:** Node.js + Express.js (port `5000`)  
> **Verziókezelés:** Git + GitHub

---

# I. RÉSZ — ÁTTEKINTÉS ÉS SETUP

---

## 1. A projekt összefoglaló

Egy naptár alkalmazást építünk, ahol a felhasználók:
- Bejelentkezhetnek / regisztrálhatnak (JWT token alapú autentikáció)
- Eseményeket hozhatnak létre, szerkeszthetnek, törölhetnek a naptárukban
- Megoszthatják a naptárukat más felhasználókkal (meghívó link alapján)
- Profiljukat szerkeszthetik (név, jelszó, avatár szín)
- Beállításokat módosíthatnak (nyelv, időzóna)

### A teljes rendszer architektúrája

```
┌─────────────────────┐         HTTP (JSON)         ┌─────────────────────┐
│                     │  ←──────────────────────→    │                     │
│   React Frontend    │   fetch("localhost:5000")    │   Express Backend   │
│   localhost:5173    │                              │   localhost:5000    │
│                     │   Authorization: Bearer      │                     │
│   (Vite dev server) │   <JWT token>                │   (Node.js)         │
└─────────────────────┘                              └─────────────────────┘
```

A frontend nem közvetlenül adatbázisból olvas — **minden adat a backend API-n keresztül jön és megy**.

### Ki mit csinál

| Szerep | Fő felelősség | Fájlok |
|--------|---------------|--------|
| **Frontend 1** | Service réteg + Auth (login/register) + Profil oldal | `services/api.js`, `AuthContext.jsx`, `Register.jsx`, `Login.jsx`, `ProfileSettings.jsx` |
| **Frontend 2** | Naptár CRUD + Megosztás oldal + Beállítások | `CalendarPage.jsx`, `SharedWithMe.jsx`, `Settings.jsx` |
| **Backend 1** | Auth végpontok + User profil + Settings | `routes/auth.js`, `routes/user.js`, `routes/settings.js` |
| **Backend 2** | Events CRUD + Naptár megosztás | `routes/events.js`, `routes/sharing.js` |

---

## 2. Telepítés és indítás

### 2.1 Előfeltételek

- **Node.js** v18+ (`node -v`)
- **npm** (`npm -v`)
- **Git** (`git --version`)
- VS Code (ajánlott)

### 2.2 Repo klónozása (egyszeri)

```bash
git clone https://github.com/LansPeti/szofttech
cd szofttech
```

### 2.3 Frontend indítása

```bash
# 1. Belépés a frontend mappába
cd frontend

# 2. Függőségek telepítése (első alkalommal vagy ha valaki új csomagot adott hozzá)
npm install

# 3. Dev szerver indítása
npm run dev
```

Böngészőben: `http://localhost:5173`

### 2.4 Backend indítása (hogy tesztelni tudd az API hívásaidat!)

> [!IMPORTANT]
> Neked is futnia kell a backendnek, hogy az API hívásaid valóban működjenek! Nyiss egy **második terminált:**

```bash
# Második terminálban:
cd backend
npm install
node index.js
```

**Szóval fejlesztés közben mindig 2 terminál fut:**
```
Terminál 1:  frontend/ → npm run dev      → localhost:5173  (a böngészőben ezt nézed)
Terminál 2:  backend/  → node index.js    → localhost:5000  (háttérben fut, kiszolgálja az API kéréseket)
```

---

## 3. Mappastruktúra

### A repo felépítése

```
naptar-projekt/                        ← GitHub repo gyökere
├── frontend/                          ← A TI területetek
│   ├── src/
│   │   ├── App.jsx                    ← Route-ok (módosítandó: + /register)
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx        ← MÓDOSÍTANDÓ (Frontend 1)
│   │   ├── pages/
│   │   │   ├── Login.jsx              ← MÓDOSÍTANDÓ (Frontend 1)
│   │   │   ├── Register.jsx           ← ÚJ (Frontend 1)
│   │   │   ├── CalendarPage.jsx       ← MÓDOSÍTANDÓ (Frontend 2)
│   │   │   ├── Settings.jsx           ← MÓDOSÍTANDÓ (Frontend 2)
│   │   │   ├── ProfileSettings.jsx    ← MÓDOSÍTANDÓ (Frontend 1)
│   │   │   └── SharedWithMe.jsx       ← MÓDOSÍTANDÓ (Frontend 2)
│   │   └── services/
│   │       └── api.js                 ← ÚJ (Frontend 1, 1. nap!)
│   ├── package.json
│   └── vite.config.js
├── backend/                           ← A backendesek területe
│   ├── index.js
│   └── ...
├── .gitignore
└── README.md
```

---

# II. RÉSZ — GIT ÉS GITHUB ÚTMUTATÓ

---

## 4. Verziókezelés — Git workflow

### 4.1 Branch (ág) struktúra

Képzeld el a kódot mint egy Word dokumentumot. Ha 4-en szerkesztenétek egyszerre, káosz lenne. A branch-ek olyanok, hogy **mindenki kap egy saját másolatot**, és amikor kész, **összeolvasztjátok**.

```
main ──────────────────────────────────────────────── merge ← (hét végén)
  │                                                    ↑
  └── dev ──── merge ←── merge ←── merge ←── merge ───┘
                 ↑         ↑         ↑         ↑
          feat/auth  feat/events feat/reg  feat/cal
          (BE 1)     (BE 2)     (FE 1)    (FE 2)
```

| Branch | Mi ez | Szabály |
|--------|-------|---------|
| `main` | Végleges, működő kód | Ide **soha** nem push-olsz közvetlenül |
| `dev` | Közös fejlesztési ág | Ide merge-ölnek a feature branch-ek |
| `feature/xyz` | Saját feladat ága | Csak te dolgozol rajta |

### 4.2 Egyszeri setup (az 1. napon)

```bash
# 1. Repo klónozása
git clone https://github.com/LansPeti/szofttech
cd szofttech

# 2. Dev branch (EGY ember hozza létre, a többiek pull-olják)
# Ha te hozod létre:
git checkout -b dev
git push origin dev

# Ha más már létrehozta:
git checkout dev
git pull origin dev
```

### 4.3 Napi workflow

#### Reggel — frissítés:
```bash
# Mindig frissíts, mielőtt elkezdesz dolgozni!
git checkout dev
git pull origin dev
```

#### Új feladat kezdése:
```bash
# Saját ág létrehozása (a dev-ből indul)
git checkout -b feature/register-page
```
> Ettől a pillanattól a te módosításaid **csak ezen az ágon** látszanak. Másokat nem zavarsz.

#### Munka közben — commitolj gyakran:
```bash
# Mi változott?
git status

# Minden módosítás hozzáadása
git add .

# Commit (= mentési pont) leíró üzenettel
git commit -m "feat: register oldal UI kész, form validáció működik"
```

**Commit üzenetek:**
```
feat: register oldal kész              ← új funkció
fix: login hibaüzenet nem jelent meg   ← hibajavítás
refactor: api.js átszervezés           ← kód-átrendezés
```

#### Nap végén — push:
```bash
git push origin feature/register-page
```

### 4.4 Pull Request (PR)

Amikor a feature-öd **kész és működik**:

1. Menj a **GitHub** repóra a böngészőben
2. Sárga sáv: *"feature/register-page had recent pushes"*
3. Klikk: **"Compare & pull request"**
4. Állítsd be: **base: `dev`** ← **compare: `feature/register-page`**
5. Adj címet: *"Register oldal + AuthContext átírás"*
6. **"Create pull request"**
7. Valaki megnézi → **"Merge pull request"**

> A merge után a kódod benne van a `dev`-ben, és mindenki le tudja húzni: `git pull origin dev`

### 4.5 Ha conflict (ütközés) van

Ez ritkán fordul elő, mert más fájlokon dolgoztok. De ha mégis:

```bash
# A saját branch-eden lehúzod a friss dev-et
git pull origin dev
```

Ha ütközés van, ezt látod a fájlban:
```
<<<<<<< HEAD
// Te verziód
const API_BASE = "http://localhost:5000/api";
=======
// A másik ember verziója
const API_BASE = "http://localhost:5001/api";
>>>>>>> dev
```

**Megoldás:** Válaszd ki a helyes verziót, töröld a jelölőket, commitolj:
```bash
git add .
git commit -m "fix: merge conflict feloldva"
git push
```

### 4.6 Hét végén: dev → main

```bash
git checkout main
git merge dev
git push origin main
```

### 4.7 Frontend branch elnevezések

```
Frontend 1:
  feature/api-service             ← 1. nap
  feature/auth-context            ← 2. nap
  feature/register-page           ← 1-2. nap
  feature/profile-settings        ← 3. nap

Frontend 2:
  feature/event-dialog            ← 1. nap
  feature/calendar-crud           ← 2. nap
  feature/shared-with-me          ← 3-4. nap
  feature/settings-page           ← 4. nap
```

---

# III. RÉSZ — TECHNIKAI SPECIFIKÁCIÓ

---

## 5. Jelenlegi állapot — mi működik és mi nem

| Funkció | Jelenlegi állapot | Mi kell hozzá |
|---------|-------------------|---------------|
| Login UI | ✅ Van felület | ❌ Fake token → valós API kell |
| Kijelentkezés | ✅ Működik | ✅ OK, nem kell backend |
| Regisztráció | ❌ Nincs oldal | Új oldal + API kell |
| Google login gomb | ❌ Csak `console.log` | Google OAuth SDK kell (opcionális) |
| Naptár megjelenítés | ✅ FullCalendar működik | — |
| Események listázása | ⚠️ Hardkódolt mock tömb | API bekötés kell |
| Esemény létrehozás | ⚠️ Csak lokális state-be ment | API bekötés kell |
| Esemény szerkesztés | ❌ Nincs | eventClick + edit dialog kell |
| Esemény törlés | ❌ Nincs | Törlés gomb + confirm dialog kell |
| Drag & drop | ❌ Plugin telepítve, nincs bekötve | `editable={true}` + callback-ek |
| Megosztott naptárak | ⚠️ Mock tömb, gombok halottak | API bekötés kell |
| Meghívó elfogad/elutasít | ❌ Nem csinálnak semmit | API bekötés kell |
| Profil szerkesztés | ⚠️ Hardkódolt "Lakatos Tibor" | API bekötés kell |
| Jelszóváltoztatás | ❌ Mezők vannak, nem működnek | API bekötés kell |
| Meghívó link másolás | ❌ Nem csinál semmit | API + clipboard kell |
| Beállítások | ❌ Statikus gombok | API bekötés + dropdown-ok kell |

---

## 6. API Service Réteg (`services/api.js`)

> [!WARNING]
> **Frontend 1 csinálja meg az 1. napon LEGELŐSZÖR!** Frontend 2 is erre épít — nélküle nem tud API-t hívni.

### Új fájl: `src/services/api.js`

```js
// src/services/api.js
// ================================================================
// Központi API modul — MINDEN backend hívás ezen keresztül megy.
//
// Miért van erre szükség:
// - Automatikusan hozzáadja a JWT tokent minden kéréshez
// - Ha a token lejárt (401), automatikusan kijelentkezteti a usert
// - Egységes hibakezelés
// - Egy helyen van a backend URL (nem szórjuk szét a kódban)
// ================================================================

const API_BASE = "http://localhost:5000/api";

/**
 * Általános fetch wrapper.
 * Automatikusan hozzáadja az Authorization headert,
 * JSON-ként küldi/fogadja az adatokat,
 * és hibát dob ha a response nem OK.
 *
 * @param {string} endpoint - API végpont (pl. "/auth/login")
 * @param {object} options - fetch options (method, body, stb.)
 * @returns {Promise<any>} - A válasz JSON objektum
 */
async function apiFetch(endpoint, options = {}) {
  // Token kiolvasása a localStorage-ből (ha be van jelentkezve a user)
  const token = localStorage.getItem("token");

  // Header-ek összerakása
  const headers = {
    "Content-Type": "application/json",
    // Ha van token, hozzáadjuk az Authorization headert
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Fetch hívás a backend felé
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Ha 401-et kapunk (lejárt token) → automatikus kijelentkeztetés
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Lejárt a munkamenet");
  }

  // Ha a válasz nem OK → hibaüzenet kinyerése és dobása
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP hiba: ${response.status}`);
  }

  // 204 No Content (pl. DELETE) → nincs body
  if (response.status === 204) return null;

  // Sikeres válasz → JSON parse
  return response.json();
}

// ================================================================
// AUTH SERVICE — Bejelentkezés, regisztráció
// ================================================================
export const authService = {
  /** Bejelentkezés username + jelszóval. Visszaad: { id, username, email, token } */
  login: (username, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  /** Regisztráció. Visszaad: { id, username, email, token } */
  register: (username, email, password) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
};

// ================================================================
// EVENT SERVICE — Naptáresemények CRUD
// ================================================================
export const eventService = {
  /** Saját események lekérése. Opcionális start/end szűrő. */
  getAll: (start, end) => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    const query = params.toString() ? `?${params}` : "";
    return apiFetch(`/events${query}`);
  },

  /** Új esemény létrehozása. eventData: { title, start, end, description, color, allDay } */
  create: (eventData) =>
    apiFetch("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),

  /** Esemény módosítása. Bármelyik mező küldhető. */
  update: (id, eventData) =>
    apiFetch(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }),

  /** Esemény törlése. */
  delete: (id) =>
    apiFetch(`/events/${id}`, { method: "DELETE" }),
};

// ================================================================
// SHARING SERVICE — Naptár megosztás, meghívók kezelése
// ================================================================
export const sharingService = {
  /** Bejövő (PENDING) meghívók lekérése */
  getInvites: () => apiFetch("/sharing/invites"),

  /** Meghívó küldése egy meghívó token alapján */
  sendInvite: (inviteToken) =>
    apiFetch("/sharing/invite", {
      method: "POST",
      body: JSON.stringify({ inviteToken }),
    }),

  /** Meghívó elfogadása */
  acceptInvite: (id) =>
    apiFetch(`/sharing/invites/${id}/accept`, { method: "PUT" }),

  /** Meghívó elutasítása */
  rejectInvite: (id) =>
    apiFetch(`/sharing/invites/${id}/reject`, { method: "PUT" }),

  /** Velem megosztott naptárak lekérése (ACCEPTED státuszúak) */
  getSharedCalendars: () => apiFetch("/sharing/calendars"),

  /** Kilépés egy megosztott naptárból */
  leaveCalendar: (id) =>
    apiFetch(`/sharing/calendars/${id}`, { method: "DELETE" }),

  /** Egy megosztott naptár eseményeinek lekérése */
  getSharedEvents: (ownerId) =>
    apiFetch(`/sharing/calendars/${ownerId}/events`),
};

// ================================================================
// USER SERVICE — Profil, jelszó, meghívó link
// ================================================================
export const userService = {
  /** Saját profil adatok lekérése */
  getProfile: () => apiFetch("/user/profile"),

  /** Profil módosítása (username, avatarColor) */
  updateProfile: (data) =>
    apiFetch("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Jelszó megváltoztatása */
  changePassword: (currentPassword, newPassword) =>
    apiFetch("/user/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  /** Meghívó link/token lekérése */
  getInviteLink: () => apiFetch("/user/invite-link"),
};

// ================================================================
// SETTINGS SERVICE — Nyelv, időzóna, stb.
// ================================================================
export const settingsService = {
  /** Beállítások lekérése */
  get: () => apiFetch("/settings"),

  /** Beállítások mentése */
  update: (data) =>
    apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
```

---

## 7. AuthContext.jsx — Átírás valós backend-re

**Frontend 1 feladata — 2. nap** (mert Backend 1 az 1. napon csinálja meg a login/register endpointokat).

### Jelenlegi probléma:
```js
// JELENLEGI KÓD — ez fake, törölni kell:
const fakeToken = "szoftech_titkos_token_123";
localStorage.setItem('token', fakeToken);
setUser({ token: fakeToken });
```

### Mire kell cserélni:

```jsx
// src/context/AuthContext.jsx — MÓDOSÍTOTT VERZIÓ
import { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Loading state: amíg induláskor ellenőrizzük a tokent, ne rendereljünk semmit
    const [loading, setLoading] = useState(true);

    // Alkalmazás indulásakor: van-e elmentett token? Ha igen, érvényes-e még?
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Profil lekérés → ha 401 jön, az apiFetch automatikusan kijelentkeztet
            userService.getProfile()
                .then(profile => setUser({ token, ...profile }))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Bejelentkezés — a backend-től kapjuk a JWT tokent
    const login = async (username, password) => {
        const data = await authService.login(username, password);
        localStorage.setItem('token', data.token);
        setUser({
            token: data.token,
            id: data.id,
            username: data.username,
            email: data.email,
            avatarColor: data.avatarColor
        });
    };

    // Regisztráció — sikeres esetben automatikusan be is jelentkezik
    const register = async (username, email, password) => {
        const data = await authService.register(username, email, password);
        localStorage.setItem('token', data.token);
        setUser({
            token: data.token,
            id: data.id,
            username: data.username,
            email: data.email
        });
    };

    // Kijelentkezés — token törlése, user state nullázása
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
```

---

## 8. Register.jsx — Új oldal

**Frontend 1 feladata — 1-2 nap.**

### Új fájl: `src/pages/Register.jsx`

**Szükséges mezők:**
- Felhasználónév (username)
- Email
- Jelszó
- Jelszó megerősítés

**Működés:**
1. Form validáció: email formátum, min. jelszóhossz, jelszavak egyezése
2. Submit → `register(username, email, password)` (az AuthContext-ből)
3. Sikeres regisztráció → navigáció `/`-re (automatikusan bejelentkezik)
4. Hibák megjelenítése (pl. "Ez a felhasználónév már foglalt")

**Stílus:** Ugyanaz a `BEIGE_THEME` mint a Login oldalon.

### App.jsx módosítás:
```jsx
import Register from './pages/Register';
// ...
<Route path="/register" element={<Register />} />
```

### Login.jsx módosítás:
```jsx
// A "vissza" gomb helyett/mellé:
<Button onClick={() => navigate('/register')}>
    nincs még fiókod? regisztrálj
</Button>
```

---

## 9. CalendarPage.jsx — CRUD bekötés

**Frontend 2 feladata.**

### 9.1 Események betöltése a backendből (2. nap)

```jsx
// A MOCK_EVENTS tömböt és const-ot TÖRÖLNI kell!
// Helyette useEffect-tel töltjük be:
import { eventService } from '../services/api';

// A komponensen belül:
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      // A FullCalendar "backgroundColor" mezőt vár, a backend "color"-t küld
      setEvents(data.map(e => ({
        ...e,
        backgroundColor: e.color,
        borderColor: e.color
      })));
    } catch (err) {
      console.error("Események betöltése sikertelen:", err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchEvents();
}, []);
```

### 9.2 Esemény dialog bővítése (1. nap — csak UI, backend nem kell hozzá!)

A jelenlegi dialog csak `title` és `start` (date) mezőt tartalmaz.

**Bővítendő mezők:**

| Mező | Input típus | Megjegyzés |
|------|-------------|------------|
| `title` | TextField | Már megvan |
| `description` | TextField (multiline) | ÚJ — leírás |
| `start` | `type="datetime-local"` | Átírás! Jelenleg `type="date"`, de idő is kell |
| `end` | `type="datetime-local"` | ÚJ — befejező időpont |
| `allDay` | Switch / Checkbox | ÚJ — egész napos-e |
| `color` | Szín választó körök | ÚJ — mint a ProfileSettings-ben |

### 9.3 Esemény mentése API-val (2. nap)

```jsx
const handleAddEvent = async () => {
  if (newEvent.title && newEvent.start) {
    try {
      // API hívás — a backend menti el és visszaadja id-val
      const created = await eventService.create(newEvent);
      // A visszakapott eseményt hozzáadjuk a lokális listához
      setEvents([...events, {
        ...created,
        backgroundColor: created.color,
        borderColor: created.color
      }]);
      handleClose();
    } catch (err) {
      console.error("Esemény létrehozása sikertelen:", err.message);
    }
  }
};
```

### 9.4 Esemény szerkesztés — eventClick (2. nap)

```jsx
<FullCalendar
  // ... meglévő propok ...
  eventClick={(info) => {
    // A kattintott esemény adatait betöltjük a dialogba
    setNewEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      description: info.event.extendedProps.description,
      color: info.event.backgroundColor
    });
    setIsEditing(true);  // Új state: szerkesztés módban vagyunk
    setOpen(true);
  }}
/>
```

Mentésnél:
```jsx
// Ha szerkesztünk (van id) → PUT, ha újat hozunk létre → POST
if (isEditing) {
  const updated = await eventService.update(newEvent.id, newEvent);
  setEvents(events.map(e => e.id === updated.id ? { ...updated, backgroundColor: updated.color } : e));
} else {
  const created = await eventService.create(newEvent);
  setEvents([...events, { ...created, backgroundColor: created.color }]);
}
```

### 9.5 Esemény törlés (2. nap)

A szerkesztő dialogba egy "Törlés" gomb:
```jsx
const handleDelete = async () => {
  if (window.confirm("Biztosan törlöd ezt az eseményt?")) {
    await eventService.delete(newEvent.id);
    setEvents(events.filter(e => e.id !== newEvent.id));
    handleClose();
  }
};
```

### 9.6 Drag & Drop bekötés (1. nap — UI, 2. nap — API)

```jsx
<FullCalendar
  editable={true}  // ← Ezzel engedélyezzük a drag & drop-ot

  // Amikor a user áthúz egy eseményt másik napra/időpontra
  eventDrop={async (info) => {
    try {
      await eventService.update(info.event.id, {
        start: info.event.startStr,
        end: info.event.endStr
      });
    } catch (err) {
      info.revert(); // Ha hiba van, visszahelyezzük az eredetire
    }
  }}

  // Amikor a user átméretezi (húzza a szélét) egy eseménynek
  eventResize={async (info) => {
    try {
      await eventService.update(info.event.id, {
        end: info.event.endStr
      });
    } catch (err) {
      info.revert();
    }
  }}
/>
```

---

## 10. SharedWithMe.jsx — API bekötés

**Frontend 2 feladata — 3-4. nap** (mert Backend 2 a 3-4. napon csinálja a sharing endpointokat).

### Mi változik:

| Funkció | Jelenlegi kód | Mire kell cserélni |
|---------|---------------|---------------------|
| Meghívók listázása | `PENDING_INVITES` hardkódolt tömb | `useEffect` → `sharingService.getInvites()` |
| "elfogad" gomb | Nem csinál semmit | `sharingService.acceptInvite(id)` → lista újratöltés |
| "elutasít" gomb | Nem csinál semmit | `sharingService.rejectInvite(id)` → lista újratöltés |
| Megosztott naptárak | `SHARED_CALENDARS` hardkódolt tömb | `useEffect` → `sharingService.getSharedCalendars()` |
| "kilépés" gomb | Nem csinál semmit | `sharingService.leaveCalendar(id)` → lista újratöltés |
| Meghívó link másolás | Nem csinál semmit | `userService.getInviteLink()` → `navigator.clipboard.writeText()` |

### Példa — meghívó elfogadás:

```jsx
const handleAccept = async (inviteId) => {
  try {
    await sharingService.acceptInvite(inviteId);
    // Meghívók lista újratöltése (az elfogadott eltűnik)
    const updatedInvites = await sharingService.getInvites();
    setInvites(updatedInvites);
    // Megosztott naptárak is frissülnek (az elfogadott megjelenik)
    const updatedCalendars = await sharingService.getSharedCalendars();
    setSharedCalendars(updatedCalendars);
  } catch (err) {
    console.error("Meghívó elfogadása sikertelen:", err.message);
  }
};
```

### Példa — meghívó link másolás:

```jsx
const handleCopyInviteLink = async () => {
  try {
    const data = await userService.getInviteLink();
    await navigator.clipboard.writeText(data.inviteToken);
    alert("Meghívó link vágólapra másolva!");
  } catch (err) {
    console.error("Másolás sikertelen:", err.message);
  }
};
```

---

## 11. ProfileSettings.jsx — API bekötés

**Frontend 1 feladata — 3. nap** (mert Backend 1 a 2. napon csinálja a profile endpointokat).

| Funkció | Jelenlegi | Mire kell cserélni |
|---------|-----------|---------------------|
| Felhasználónév | `defaultValue="Lakatos Tibor"` | `useEffect` → `userService.getProfile()` → `value={profile.username}` |
| Jelszó mezők | 3 üres mező, nem csinálnak semmit | "mentés" → `userService.changePassword(current, new)` |
| Profilszín | Lokális state, nem mentődik | "mentés" → `userService.updateProfile({ avatarColor })` |
| Meghívó link | Nem csinál semmit | `userService.getInviteLink()` → clipboard |
| "mentés" gomb | Nem csinál semmit | API hívások (username + szín + jelszó ha kitöltve) |
| "mégse" gomb | Nem csinál semmit | `setProfile(originalProfile)` — visszaáll az eredeti értékekre |

### Profil betöltés minta:

```jsx
const [profile, setProfile] = useState(null);

useEffect(() => {
  const fetchProfile = async () => {
    const data = await userService.getProfile();
    setProfile(data);
    setSelectedColor(data.avatarColor || '#C2B280');
  };
  fetchProfile();
}, []);
```

---

## 12. Settings.jsx — API bekötés

**Frontend 2 feladata — 4. nap** (mert Backend 1 a 3. napon csinálja a settings endpointokat).

| Funkció | Jelenlegi | Mire kell cserélni |
|---------|-----------|---------------------|
| Nyelv választás | Statikus gomb | MUI `Select` dropdown (`hu`, `en`) + `settingsService.get()` betöltés |
| Időzóna választás | Statikus gomb | MUI `Select` dropdown (IANA timezone lista) |
| "mentés" gomb | Nem csinál semmit | `settingsService.update(data)` |
| "mégse" gomb | Nem csinál semmit | Visszaállítás az eredeti értékekre |

---

## 13. UX Kiegészítések

Mindkét frontend fejlesztő felelőssége a saját oldalain:

### Loading állapot
- API hívás közben → MUI `CircularProgress` megjelenítése
- Gombok `disabled` amíg a mentés/törlés fut

### Hibaüzenetek
- Login oldalon: "Hibás felhasználónév vagy jelszó" piros szöveggel
- Ha az API hiba dob, jelenítsük meg (pl. MUI `Alert` komponens)

### Form validáció (frontenden is!)
- Login: username és password kötelező
- Register: email formátum, min. 6 karakteres jelszó, jelszavak egyezése
- Event dialog: cím és kezdő időpont kötelező
- Profil: ha kitöltötte az új jelszó mezőt, a régi jelszó is kötelező

---

# IV. RÉSZ — ÜTEMEZÉS

---

## 14. Feladatfelosztás — Napi bontás

> [!IMPORTANT]
> Az ütemezés összehangolva a backend csapatéval: **mindig másnap kötöd be azt, amit a backend előző nap elkészített**. Így azonnal tudsz tesztelni működő endpointok ellen.

### Frontend 1: Service réteg + Auth + Profil

| Nap | Feladat | Miért ekkor |
|-----|---------|-------------|
| **1** | `services/api.js` (**ELSŐKÉNT!**) + `Register.jsx` oldal UI + `SnackbarContext` (opcionális) + App.jsx route kiegészítés | API.js-re Frontend 2 is épít; Register UI-hoz nem kell backend |
| **2** | `AuthContext.jsx` átírás valós JWT-re + `Login.jsx` hibakezelés + regisztráció link | Backend 1 login/register endpointja **MÁR kész** az 1. napról |
| **3** | `ProfileSettings.jsx` API bekötés + jelszóváltoztatás logika + meghívó link másolás | Backend 1 profile endpointjai **MÁR kész** a 2. napról |
| **4** | Loading/error állapotok + formavalidáció a saját oldalakon | — |
| **5–7** | Közös tesztelés a backend csapattal + bugfix | — |

### Frontend 2: Naptár + Megosztás + Beállítások

| Nap | Feladat | Miért ekkor |
|-----|---------|-------------|
| **1** | Event dialog bővítése (datetime, leírás, szín, allDay) + FullCalendar drag & drop UI setup | Csak UI munka → **nem kell backend hozzá** |
| **2** | `CalendarPage` CRUD bekötés (események betöltés, létrehozás, szerkesztés, törlés) | Backend 2 events endpointja **MÁR kész** az 1. napról |
| **3** | `SharedWithMe.jsx` UI előkészítés + meghívó link másolás | Backend 2 sharing endpointokat a 3-4. napon készíti |
| **4** | `SharedWithMe.jsx` API bekötés (elfogad/elutasít/kilépés) + `Settings.jsx` API bekötés | Backend 2 sharing **MÁR kész**, Backend 1 settings **MÁR kész** a 3. napról |
| **5–7** | Megosztott naptárak overlay a fő naptárban (opcionális) + közös tesztelés + bugfix | — |

---

## 15. Cross-referencia — Backend és Frontend összehangolás

| Nap | Backend elkészíti | Másnap a Frontend bekötő |
|-----|-------------------|--------------------------|
| **1. nap** | BE1: `/auth/login` + `/auth/register` | → **2. nap** FE1: AuthContext átírás |
| **1. nap** | BE2: `/events` CRUD | → **2. nap** FE2: CalendarPage CRUD |
| **2. nap** | BE1: `/user/profile` + `/user/password` | → **3. nap** FE1: ProfileSettings bekötés |
| **3. nap** | BE1: `/settings` | → **4. nap** FE2: Settings bekötés |
| **3-4. nap** | BE2: `/sharing/*` | → **4. nap** FE2: SharedWithMe bekötés |
