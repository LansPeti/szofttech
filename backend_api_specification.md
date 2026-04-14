# 🖥️ Backend Fejlesztői Útmutató — Naptár Projekt

> **Projekt:** Google Calendar klón (szoftvertechnológia házi)  
> **Csapat:** 4 fő (2 backend + 2 frontend)  
> **Határidő:** 1 hét  
> **Backend tech stack:** Node.js + Express.js (port `5000`)  
> **Frontend tech stack:** React 19 + Vite (port `5173`) + MUI + FullCalendar  
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
│   React Frontend    │    fetch("localhost:5000")   │   Express Backend   │
│   localhost:5173    │                              │   localhost:5000    │
│                     │    Authorization: Bearer     │                     │
│   (Vite dev server) │    <JWT token>               │   (Node.js)         │
└─────────────────────┘                              └────────┬────────────┘
                                                              │
                                                     ┌────────▼────────────┐
                                                     │   Adatbázis         │
                                                     │   (JSON fájl /      │
                                                     │    SQLite / MongoDB) │
                                                     └─────────────────────┘
```

### Ki mit csinál

| Szerep | Fő felelősség | Fájlok |
|--------|---------------|--------|
| **Backend 1** | Autentikáció + User profil + Settings | `routes/auth.js`, `routes/user.js`, `routes/settings.js`, `middleware/auth.js` |
| **Backend 2** | Események CRUD + Naptár megosztás | `routes/events.js`, `routes/sharing.js` |
| **Frontend 1** | Service réteg + Auth UI + Profil oldal | `services/api.js`, `AuthContext.jsx`, `Register.jsx`, `ProfileSettings.jsx` |
| **Frontend 2** | Naptár CRUD UI + Megosztás oldal + Beállítások | `CalendarPage.jsx`, `SharedWithMe.jsx`, `Settings.jsx` |

---

## 2. Telepítés és indítás

### 2.1 Előfeltételek

A következőknek telepítve kell lenniük a gépeden:
- **Node.js** v18+ (ellenőrzés: `node -v`)
- **npm** (Node-dal jön, ellenőrzés: `npm -v`)
- **Git** (ellenőrzés: `git --version`)
- Egy kódszerkesztő (pl. **VS Code**)

### 2.2 A repo klónozása (egyszeri)

```bash
# 1. Repo letöltése a GitHub-ról
git clone https://github.com/LansPeti/szofttech

# 2. Belépés a projekt mappájába
cd szofttech
```

### 2.3 Backend indítása

```bash
# 1. Belépés a backend mappába
cd server

# 2. Függőségek telepítése (első alkalommal vagy ha valaki új csomagot adott hozzá)
npm install

# 3. Szerver indítása
node index.js
```

A terminálban ezt kell látnod:
```
Server running on http://localhost:5000
```

### 2.4 Frontend indítása (hogy tesztelni tudd a backended!)

> [!IMPORTANT]
> Neked is kell futnia a frontendnek, hogy lásd a te endpointjaid valóban működnek-e a felületen!

**Nyiss egy MÁSODIK terminált** (az első maradjon a backenddel):

```bash
# 1. Belépés a frontend mappába
cd frontend

# 2. Függőségek telepítése
npm install

# 3. Frontend dev szerver indítása
npm run dev
```

Ezután a böngészőben: `http://localhost:5173`

**Szóval fejlesztés közben mindig 2 terminál fut:**
```
Terminál 1:  backend/  → node index.js         → localhost:5000
Terminál 2:  frontend/ → npm run dev            → localhost:5173
```

### 2.5 Szükséges npm csomagok (backend)

```bash
cd backend
npm install express cors jsonwebtoken bcryptjs dotenv uuid
```

| Csomag | Mire kell |
|--------|-----------|
| `express` | Web szerver keretrendszer |
| `cors` | Cross-origin kérések engedélyezése (frontend → backend) |
| `jsonwebtoken` | JWT token generálás és ellenőrzés |
| `bcryptjs` | Jelszó hashelés (titkosítás) |
| `dotenv` | `.env` fájlból konfigurációs értékek olvasása |
| `uuid` | Egyedi azonosítók generálása |

> [!TIP]
> Adatbázisnak egy szofttech házihoz **JSON fájl** vagy **SQLite** is teljesen elég. Nem kell MongoDB/PostgreSQL cluster-t felállítani.
> - JSON fájl → nem kell extra csomag
> - SQLite → `npm install better-sqlite3`
> - MongoDB → `npm install mongoose`

---

## 3. Mappastruktúra

```
naptar-projekt/                   ← GitHub repo gyökere
├── frontend/                     ← React alkalmazás (a frontendesek területe)
│   ├── src/
│   ├── package.json
│   └── ...
├── server/                      ← Express szerver (a TI területetek)
│   ├── index.js                  ← Fő belépési pont (már megvan)
│   ├── package.json
│   ├── .env                      ← Titkos kulcsok (NE COMMITOLD!)
│   ├── middleware/
│   │   └── auth.js               ← JWT token ellenőrző middleware
│   ├── routes/
│   │   ├── auth.js               ← /api/auth/* végpontok (Backend 1)
│   │   ├── events.js             ← /api/events/* végpontok (Backend 2)
│   │   ├── sharing.js            ← /api/sharing/* végpontok (Backend 2)
│   │   ├── user.js               ← /api/user/* végpontok (Backend 1)
│   │   └── settings.js           ← /api/settings/* végpontok (Backend 1)
│   └── data/                     ← JSON fájl alapú tárolás
│       ├── users.json
│       ├── events.json
│       ├── shares.json
│       └── settings.json
├── .gitignore
└── README.md
```

### `.env` fájl (backend mappában)

```env
PORT=5000
JWT_SECRET=szoftech-titkos-kulcs-ide-valami-random-string
```

### `.gitignore` (repo gyökérben)

```gitignore
# Függőségek — soha ne commitold, mindenki maga telepíti npm install-lal
node_modules/

# Titkos kulcsok — soha ne commitold, mindenkinél más lehet
.env

# Build output
dist/
```

---

# II. RÉSZ — GIT ÉS GITHUB ÚTMUTATÓ

---

## 4. Verziókezelés — Git workflow

### 4.1 Branch (ág) struktúra

```
main ──────────────────────────────────────────────── merge ← (hét végén)
  │                                                    ↑
  └── dev ──── merge ←── merge ←── merge ←── merge ───┘
                 ↑         ↑         ↑         ↑
          feat/auth  feat/events feat/reg  feat/cal
          (BE 1)     (BE 2)     (FE 1)    (FE 2)
```

| Branch | Mi ez | Ki nyúl hozzá |
|--------|-------|---------------|
| `main` | Végleges, működő kód. Ide **soha nem push-olunk közvetlenül**. | Senki (csak merge a dev-ből) |
| `dev` | Közös fejlesztési ág. Ide merge-ölnek a feature branch-ek. | Mindenki (merge-ön keresztül) |
| `feature/xyz` | Egy adott feladat saját ága. | Csak az, aki azon dolgozik |

### 4.2 Egyszeri setup (az 1. napon, mindenki megcsinálja) (EZ MÁR KÉSZEN VAN, NEM KELL VELE FOGLALKOZNI)

```bash
# 1. Repo klónozása
git clone https://github.com/<csapat>/naptar-projekt.git
cd naptar-projekt

# 2. Dev branch létrehozása (csak EGY ember csinálja, a többi pull-olja)
git checkout -b dev
git push origin dev

# 3. A többiek:
git checkout dev
git pull origin dev
```

### 4.3 Napi workflow (minden nap ezt csináld)

#### Reggel — frissítés:
```bash
# 1. Átváltás a dev ágra
git checkout dev

# 2. Legfrissebb állapot letöltése (amit mások push-oltak)
git pull origin dev
```

#### Új feladat kezdése:
```bash
# 3. Saját feature branch létrehozása (a dev-ből indul ki)
git checkout -b feature/auth-endpoints
```
> Ettől kezdve a te változtatásaid **csak ezen az ágon** jelennek meg. Másokat NEM zavarasz.

#### Munka közben — commitolás (gyakran!):
```bash
# 4. Módosított fájlok hozzáadása
git add .

# 5. Commit egy leíró üzenettel
git commit -m "feat: login endpoint kész, JWT token generálás működik"
```

**Commit üzenet szabályok:**
```
feat: login endpoint kész              ← új funkció
fix: bcrypt compare hiba javítva       ← hibajavítás
refactor: auth middleware kiszervezve   ← átszervezés
```

#### Nap végén — push:
```bash
# 6. A branch feltolása GitHub-ra
git push origin feature/auth-endpoints
```

### 4.4 Pull Request (PR) — amikor kész egy feature

Amikor a feature-öd **kész és működik**:

1. Menj a GitHub repóra a **böngészőben**
2. Megjelenik egy sárga sáv: *"feature/auth-endpoints had recent pushes"*
3. Klikk: **"Compare & pull request"**
4. Állítsd be: **base: `dev`** ← **compare: `feature/auth-endpoints`**
5. Adj rövid címet: *"Login és register endpoint kész"*
6. Klikk: **"Create pull request"**
7. Valaki a csapatból megnézi → **"Merge pull request"**

> A merge után a kódod bekerül a `dev` ágba, és a többiek is le tudják húzni `git pull origin dev`-vel.

### 4.5 Conflict (ütközés) kezelése

Ha a PR-nál a GitHub azt mondja *"Can't automatically merge"*, vagy `git pull` után conflictot kapsz:

```bash
# A saját branch-eden vagy
git pull origin dev
```

Ha van ütközés, a fájlban ezt látod:
```
<<<<<<< HEAD
// Te kódod
const PORT = 5000;
=======
// A másik ember kódja
const PORT = 5001;
>>>>>>> dev
```

**Megoldás:**
1. Válaszd ki melyik verzió a helyes (vagy kombináld)
2. Töröld a `<<<<<<<`, `=======`, `>>>>>>>` jeleket
3. `git add .` → `git commit -m "fix: merge conflict feloldva"` → `git push`

> [!TIP]
> A mi ütemezésünkben ez **ritkán fordul elő**, mert mindenki más fájlokon dolgozik. Az egyetlen közös fájl az `index.js` (route importok), de ott elég egyértelmű az ütközés feloldása.

### 4.6 Hét végén — dev → main merge

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

---

### 4.7 Backend branch-ek elnevezése

```
Backend 1:
  feature/jwt-middleware        ← 1. nap
  feature/auth-endpoints        ← 1-2. nap
  feature/user-profile          ← 2-3. nap
  feature/settings-endpoints    ← 3. nap

Backend 2:
  feature/events-crud           ← 1-2. nap
  feature/sharing-endpoints     ← 3-4. nap
```

---

# III. RÉSZ — TECHNIKAI SPECIFIKÁCIÓ

---

## 5. Meglévő kiindulópont

A szerver már inicializálva van:

```js
// index.js — már megvan, ebből indulunk ki
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());           // Cross-origin kérések engedélyezése (frontend → backend)
app.use(express.json());   // JSON body parsing (req.body működjön)

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Route-ok bekötése (az index.js-be kell beleírni):

```js
// index.js — kiegészítés a meglévő fájlhoz
require("dotenv").config(); // .env fájl betöltése

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const sharingRoutes = require("./routes/sharing");
const userRoutes = require("./routes/user");
const settingsRoutes = require("./routes/settings");
const authMiddleware = require("./middleware/auth");

// Publikus végpontok (nem kell token)
app.use("/api/auth", authRoutes);

// Védett végpontok (token kötelező)
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/sharing", authMiddleware, sharingRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/settings", authMiddleware, settingsRoutes);
```

---

## 6. JWT Middleware (Backend 1 — az 1. napon kész kell legyen!)

> [!WARNING]
> **Backend 2-nek is kell ez a middleware!** Ezért Backend 1 ezt az **1. napon** kész csinálja és push-olja, hogy Backend 2 tudja használni az events route-okhoz.

```js
// middleware/auth.js
// ==================================================
// JWT autentikációs middleware
// Minden védett végpont előtt lefut.
// A headerből kiolvassa a Bearer tokent, dekódolja,
// és a req.userId-ba teszi a felhasználó ID-ját.
// ==================================================
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "szoftech-secret-key";

function authMiddleware(req, res, next) {
  // 1. Header kiolvasása: "Authorization: Bearer eyJ..."
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Nincs token megadva" });
  }

  // 2. Token kinyerése (a "Bearer " rész utáni string)
  const token = authHeader.split(" ")[1];

  try {
    // 3. Token dekódolása és érvényesség ellenőrzése
    const decoded = jwt.verify(token, JWT_SECRET);
    // 4. A dekódolt user adatok hozzáadása a request objektumhoz
    req.userId = decoded.id;
    req.username = decoded.username;
    next(); // Továbbengedjük a kérést a tényleges route handler-hez
  } catch (err) {
    return res.status(401).json({ error: "Érvénytelen vagy lejárt token" });
  }
}

module.exports = authMiddleware;
```

---

## 7. Adatmodellek

### 7.1 `User` (Felhasználó)

| Mező | Típus | Leírás | Kötelező |
|------|-------|--------|----------|
| `id` | String | Egyedi azonosító (UUID) | auto generált |
| `username` | String | Felhasználónév (egyedi, nem ismétlődhet) | ✅ |
| `email` | String | Email cím (egyedi) | ✅ |
| `passwordHash` | String | Bcrypt-tel hashelt jelszó (a nyers jelszót SOHA nem tároljuk!) | ✅ |
| `avatarColor` | String | Hex szín kód a profil avatárhoz | ❌ (default: `#C2B280`) |
| `inviteToken` | String | Egyedi meghívó token a naptár megosztáshoz | auto generált |
| `createdAt` | String | Regisztráció dátuma (ISO 8601 UTC) | auto generált |

### 7.2 `Event` (Naptáresemény)

| Mező | Típus | Leírás | Kötelező |
|------|-------|--------|----------|
| `id` | String | Egyedi azonosító | auto |
| `userId` | String | Tulajdonos felhasználó ID-ja (FK → User) | ✅ |
| `title` | String | Esemény címe | ✅ |
| `description` | String | Esemény leírása | ❌ |
| `start` | String | Kezdő dátum/idő (ISO 8601 UTC, pl. `"2026-04-03T10:00:00Z"`) | ✅ |
| `end` | String | Befejező dátum/idő (ISO 8601 UTC) | ❌ |
| `allDay` | Boolean | Egész napos esemény-e | ❌ (default: `false`) |
| `color` | String | Esemény háttérszíne (hex kód) | ❌ (default: `#C2B280`) |

### 7.3 `CalendarShare` (Naptár megosztás)

| Mező | Típus | Leírás |
|------|-------|--------|
| `id` | String | Egyedi azonosító |
| `ownerId` | String | A megosztó felhasználó ID-ja (FK → User) |
| `sharedWithId` | String | Akivel megosztották (FK → User) |
| `status` | String | `"PENDING"` / `"ACCEPTED"` / `"REJECTED"` |
| `createdAt` | String | Meghívó küldésének dátuma (ISO 8601 UTC) |

### 7.4 `UserSettings` (Beállítások — beágyazható a User-be is)

| Mező | Típus | Leírás |
|------|-------|--------|
| `userId` | String | FK → User |
| `language` | String | `"hu"`, `"en"`, stb. (default: `"hu"`) |
| `timezone` | String | IANA timezone, pl. `"Europe/Budapest"` |
| `defaultEventColor` | String | Alapértelmezett esemény szín |

---

## 8. Dátumformátum konvenció

> [!CAUTION]
> **Ez kritikus!** A FullCalendar könyvtár nagyon érzékeny a dátum stringek formátumára. Ha a backend nem egységes formátumban küldi a dátumokat, az események rossz időpontban jelennek meg, vagy egyáltalán nem jelennek meg.

### Szabály: Minden dátum **ISO 8601**, **UTC időzóna**, **`Z` végződés**

```
✅ HELYES:   "2026-04-03T10:00:00Z"
✅ HELYES:   "2026-04-03T08:00:00Z"
❌ HIBÁS:    "2026-04-03T10:00:00"          (nincs időzóna → "lebegő" idő)
❌ HIBÁS:    "2026-04-03T10:00:00+02:00"    (offset → inkonzisztens)
❌ HIBÁS:    "2026.04.03 10:00"             (nem ISO formátum)
❌ HIBÁS:    1712134800000                   (Unix timestamp)
```

### Érintett mezők:

| Mező | Entitás | Példa |
|------|---------|-------|
| `start` | Event | `"2026-04-03T10:00:00Z"` |
| `end` | Event | `"2026-04-03T12:00:00Z"` |
| `createdAt` | User, CalendarShare | `"2026-04-01T08:00:00Z"` |
| `sharedSince` | Sharing válasz | `"2026-03-15T10:00:00Z"` |

### Implementáció:

```js
// Mentésnél: a new Date().toISOString() mindig UTC-t ad "Z" végződéssel
const event = {
  start: new Date(req.body.start).toISOString(),  // → "2026-04-03T10:00:00.000Z"
  end: req.body.end ? new Date(req.body.end).toISOString() : null,
  createdAt: new Date().toISOString()
};
```

> [!TIP]
> A JavaScript `new Date().toISOString()` mindig UTC-ben adja vissza `Z` végződéssel — pont amit kell. A frontend (FullCalendar) automatikusan a böngésző helyi időzónájára konvertálja.

---

## 9. REST API Végpontok — Részletes specifikáció

### 9.1 Auth végpontok (`routes/auth.js`) — Backend 1

---

#### `POST /api/auth/register` — Regisztráció

**Request Body:**
```json
{
  "username": "LakatosT",
  "email": "lakatos@example.com",
  "password": "Jelszo123"
}
```

**Response `201 Created`:**
```json
{
  "id": "a1b2c3d4",
  "username": "LakatosT",
  "email": "lakatos@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Hibák:**
- `400` → `{ "error": "Minden mező kitöltése kötelező" }`
- `409` → `{ "error": "Ez a felhasználónév már foglalt" }`

**Implementációs lépések:**
1. Ellenőrizd, hogy `username`, `email`, `password` meg van-e adva
2. Ellenőrizd, hogy a `username` vagy `email` nincs-e már a rendszerben
3. `bcrypt.hash(password, 10)` → jelszó hashelés
4. Generálj egyedi `id`-t és `inviteToken`-t (`uuid` csomag)
5. Mentsd el a user-t
6. `jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "24h" })` → token generálás
7. Válaszban küld vissza: `id`, `username`, `email`, `token`

---

#### `POST /api/auth/login` — Bejelentkezés

**Request Body:**
```json
{
  "username": "LakatosT",
  "password": "Jelszo123"
}
```

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4",
  "username": "LakatosT",
  "email": "lakatos@example.com",
  "avatarColor": "#C2B280",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Hibák:**
- `401` → `{ "error": "Hibás felhasználónév vagy jelszó" }`

**Implementáció:**
1. `username` alapján keresd meg a usert
2. `bcrypt.compare(password, user.passwordHash)` → jelszó ellenőrzés
3. Ha egyezik → JWT token generálás, válasz küldés
4. Ha nem egyezik → 401

> [!IMPORTANT]
> Ne áruld el, hogy a username vagy a jelszó rossz-e! Mindig egységesen: "Hibás felhasználónév **vagy** jelszó". Ez biztonsági best practice.

---

### 9.2 Events végpontok (`routes/events.js`) — Backend 2

> Minden events végpont az `authMiddleware`-t használja. A `req.userId`-ból tudod, ki a bejelentkezett felhasználó.

---

#### `GET /api/events` — Saját események listázása

```
Headers: Authorization: Bearer <token>
Query params (opcionális): ?start=2026-04-01T00:00:00Z&end=2026-04-30T23:59:59Z
```

**Response `200 OK`:**
```json
[
  {
    "id": "evt1",
    "title": "Design megbeszélés",
    "description": "UI review a csapattal",
    "start": "2026-04-03T10:00:00Z",
    "end": "2026-04-03T12:00:00Z",
    "allDay": false,
    "color": "#C2B280"
  },
  {
    "id": "evt2",
    "title": "Kávézás",
    "start": "2026-04-05T14:30:00Z",
    "end": null,
    "allDay": false,
    "color": "#DED3C1"
  }
]
```

**Logika:** Szűrés `userId === req.userId` + opcionálisan `start/end` időintervallum.

---

#### `POST /api/events` — Új esemény létrehozása

**Request Body:**
```json
{
  "title": "Sprint review",
  "description": "Minden csapattag részt vesz",
  "start": "2026-04-10T09:00:00Z",
  "end": "2026-04-10T10:30:00Z",
  "allDay": false,
  "color": "#C2B280"
}
```

**Response `201 Created`:** A létrehozott event objektum (id-val).

**Hibák:**
- `400` → `{ "error": "A 'title' és 'start' mező kötelező" }`

---

#### `PUT /api/events/:id` — Esemény módosítása

**Request Body:** Bármelyik mező küldhető, ami változott:
```json
{
  "title": "Módosított cím",
  "start": "2026-04-10T10:00:00Z"
}
```

**Response `200 OK`:** A frissített event objektum.

**Hibák:**
- `403` → `{ "error": "Nincs jogosultságod ehhez az eseményhez" }` (ha `event.userId !== req.userId`)
- `404` → `{ "error": "Esemény nem található" }`

---

#### `DELETE /api/events/:id` — Esemény törlése

**Response `204 No Content`** (üres body)

**Hibák:**
- `403` → jogosultság hiba
- `404` → nem található

---

### 9.3 Sharing végpontok (`routes/sharing.js`) — Backend 2

---

#### `GET /api/sharing/invites` — Bejövő meghívóim

Visszaadja azokat a meghívókat, amiket MÁSOK küldtek az aktuális felhasználónak.

**Response `200 OK`:**
```json
[
  {
    "id": "share1",
    "owner": {
      "id": "user3",
      "username": "Lakatos Tibor"
    },
    "status": "PENDING",
    "createdAt": "2026-04-01T08:00:00Z"
  }
]
```

**Logika:** `CalendarShare` rekordok ahol `sharedWithId === req.userId` ÉS `status === "PENDING"`

---

#### `POST /api/sharing/invite` — Meghívó küldése token alapján

Amikor valaki bemásolja egy másik felhasználó meghívó linkjét.

**Request Body:**
```json
{
  "inviteToken": "abc123-unique-token"
}
```

**Response `201 Created`:**
```json
{
  "id": "share5",
  "ownerId": "user3",
  "sharedWithId": "user1",
  "status": "PENDING"
}
```

**Logika:**
1. Keresd meg melyik user-hez tartozik ez az `inviteToken`
2. Ha nincs ilyen → `404`
3. Ha saját magát hívná meg → `400`
4. Ha már van köztük share → `409`
5. Hozd létre a `CalendarShare` rekordot `"PENDING"` státusszal

---

#### `PUT /api/sharing/invites/:id/accept` — Meghívó elfogadása

**Response `200 OK`:**
```json
{ "id": "share1", "status": "ACCEPTED" }
```

#### `PUT /api/sharing/invites/:id/reject` — Meghívó elutasítása

**Response `200 OK`:**
```json
{ "id": "share1", "status": "REJECTED" }
```

> Ellenőrizd, hogy a `sharedWithId === req.userId` — csak az utasíthatja el/fogadhatja el, akinek szól!

---

#### `GET /api/sharing/calendars` — Velem megosztott naptárak

**Response `200 OK`:**
```json
[
  {
    "id": "share2",
    "owner": { "id": "user3", "username": "Lapti Ferenc" },
    "sharedSince": "2026-03-15T10:00:00Z"
  },
  {
    "id": "share3",
    "owner": { "id": "user4", "username": "Tódi Márton" },
    "sharedSince": "2026-03-20T14:00:00Z"
  }
]
```

**Logika:** `CalendarShare` rekordok ahol `sharedWithId === req.userId` ÉS `status === "ACCEPTED"`

---

#### `DELETE /api/sharing/calendars/:id` — Kilépés megosztott naptárból

**Response `204 No Content`**

---

#### `GET /api/sharing/calendars/:ownerId/events` — Megosztott naptár eseményei

Egy másik felhasználó naptáreseményeit adja vissza (akit megosztotta velem).

**Response `200 OK`:** Ugyanolyan event tömb mint a `GET /api/events`.

**Hibák:**
- `403` → `{ "error": "Nincs megosztási jogosultságod" }` — ha nincs ACCEPTED share köztük

**Logika:** Ellenőrizd, hogy van-e `ACCEPTED` CalendarShare az `ownerId` és `req.userId` között!

---

### 9.4 User/Profil végpontok (`routes/user.js`) — Backend 1

---

#### `GET /api/user/profile` — Saját profil lekérése

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4",
  "username": "LakatosT",
  "email": "lakatos@example.com",
  "avatarColor": "#C2B280",
  "inviteToken": "abc123-unique-token",
  "createdAt": "2026-01-15T09:00:00Z"
}
```

> [!WARNING]
> A `passwordHash` mezőt **SOHA** ne küldd vissza a válaszban! Csak a publikus adatokat.

---

#### `PUT /api/user/profile` — Profil módosítása

**Request Body:**
```json
{
  "username": "Lakatos Tibor",
  "avatarColor": "#A89968"
}
```

**Response `200 OK`:** A frissített profil objektum.

---

#### `PUT /api/user/password` — Jelszó megváltoztatása

**Request Body:**
```json
{
  "currentPassword": "RegiJelszo123",
  "newPassword": "UjJelszo456"
}
```

**Response `200 OK`:**
```json
{ "message": "Jelszó sikeresen megváltoztatva" }
```

**Hibák:**
- `401` → `{ "error": "A régi jelszó nem helyes" }`
- `400` → `{ "error": "Az új jelszó legalább 6 karakter legyen" }`

**Logika:**
1. `bcrypt.compare(currentPassword, user.passwordHash)` → régi jelszó ellenőrzés
2. Ha nem egyezik → 401
3. `bcrypt.hash(newPassword, 10)` → új jelszó hashelés
4. Mentés

---

#### `GET /api/user/invite-link` — Meghívó link lekérése

**Response `200 OK`:**
```json
{
  "inviteToken": "abc123-unique-token"
}
```

A frontend ebből a tokenből rakja össze a teljes megosztó linket.

---

### 9.5 Settings végpontok (`routes/settings.js`) — Backend 1

---

#### `GET /api/settings` — Beállítások lekérése

**Response `200 OK`:**
```json
{
  "language": "hu",
  "timezone": "Europe/Budapest",
  "defaultEventColor": "#C2B280"
}
```

#### `PUT /api/settings` — Beállítások mentése

**Request Body:**
```json
{
  "language": "en",
  "timezone": "Europe/London"
}
```

**Response `200 OK`:** A frissített beállítások objektum.

---

## 10. Hibakezelés (egységes formátum)

Minden hiba egységesen így nézzen ki:

```json
{ "error": "Leíró hibaüzenet magyarul" }
```

| HTTP kód | Mikor használd |
|----------|----------------|
| `200` | Sikeres lekérés/módosítás |
| `201` | Sikeres létrehozás (POST) |
| `204` | Sikeres törlés (DELETE, üres body) |
| `400` | Hiányzó vagy hibás mező a requestben |
| `401` | Nincs token / rossz jelszó / lejárt token |
| `403` | Van token, de nincs jogosultság az adott erőforráshoz |
| `404` | A keresett erőforrás nem létezik |
| `409` | Ütközés (pl. foglalt username, már létező meghívó) |
| `500` | Váratlan szerver hiba |

---

## 11. Összefoglaló API térkép

```
/api/auth                                   ← Backend 1 (NEM kell token)
├── POST /register
└── POST /login

/api/events                                 ← Backend 2 (TOKEN KELL)
├── GET    /
├── POST   /
├── PUT    /:id
└── DELETE /:id

/api/sharing                                ← Backend 2 (TOKEN KELL)
├── GET    /invites
├── POST   /invite
├── PUT    /invites/:id/accept
├── PUT    /invites/:id/reject
├── GET    /calendars
├── DELETE /calendars/:id
└── GET    /calendars/:ownerId/events

/api/user                                   ← Backend 1 (TOKEN KELL)
├── GET /profile
├── PUT /profile
├── PUT /password
└── GET /invite-link

/api/settings                               ← Backend 1 (TOKEN KELL)
├── GET /
└── PUT /
```

---

# IV. RÉSZ — ÜTEMEZÉS

---

## 12. Feladatfelosztás — Napi bontás

> [!IMPORTANT]
> Az ütemezés úgy van megoldva, hogy a **backend mindig 1 nappal előzze meg a frontendet** az adott funkciónál. Így a frontendnek mindig van kész endpointja amit azonnal tud tesztelni.

### Backend 1: Auth + User + Settings

| Nap | Feladat | Miért ekkor |
|-----|---------|-------------|
| **1** | JWT middleware + User modell + `POST /auth/login` + `POST /auth/register` | Frontend 1-nek a 2. napon kelleni fog |
| **2** | `GET/PUT /user/profile` + `PUT /user/password` + `GET /user/invite-link` | Frontend 1-nek a 3. napon kelleni fog |
| **3** | `GET/PUT /settings` végpontok | Frontend 2-nek a 4. napon kelleni fog |
| **4** | Bugfix + edge case-ek + Backend 2 segítése ha kell | — |
| **5–7** | Közös tesztelés a frontenddel | — |

### Backend 2: Events + Sharing

| Nap | Feladat | Miért ekkor |
|-----|---------|-------------|
| **1** | Event modell + `GET/POST/PUT/DELETE /events` | Frontend 2-nek a 2. napon kelleni fog |
| **2** | Events bugfix + CORS tesztelés frontendről | — |
| **3** | CalendarShare modell + `/sharing/invites` (GET, POST, accept, reject) | Frontend 2-nek a 4. napon kelleni fog |
| **4** | `/sharing/calendars` (GET, DELETE) + `/sharing/calendars/:ownerId/events` | — |
| **5–7** | Közös tesztelés a frontenddel | — |
