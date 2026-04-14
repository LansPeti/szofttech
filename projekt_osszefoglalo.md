# 🗂️ Szofttech Naptár Projekt — Teljes Összefoglaló Dokumentáció

Ez a dokumentum átfogó képet ad a Google Calendar klón (szoftvertechnológia házi feladat) teljes architektúrájáról, funkcióiról, a komponensek elhelyezkedéséről és az alkalmazott technikai megoldásokról.

---

## 1. A Projekt Áttekintése és Architektúra

Egy teljes értékű naptár alkalmazást építettünk, amely lehetőséget biztosít a felhasználóknak események kezelésére, és saját naptáruk megosztására. A rendszer egyértelmű **kliens-szerver architektúrát** követ, ahol a kliens egy beágyazott böngészős alkalmazás, a backend pedig REST alapú API-n keresztül kommunikál vele.

### Technológiai Stack
- **Frontend (Kliens):** React 19 + Vite. UI felület felépítése MUI komponensekkel, naptár motor: FullCalendar. A frontend a `5173`-as porton fut.
- **Backend (Szerver):** Node.js + Express.js alapú HTTP szerver, a `5000`-es porton elérhető.
- **Adattárolás:** Helyi fájlalapú (`.json` fájlok a `server/data/` mappában) beágyazott adatbázis megoldás (könnyen cserélhető SQLite-ra).

### Mappastruktúra és "Mi Hol Található"
- **`frontend/`**: A vizuális felületet, React komponenseket adja.
  - `src/pages/`: Az egyes nézetek (oldalak), pl. `Login.jsx`, `Register.jsx`, `CalendarPage.jsx`, `SharedWithMe.jsx`, `ProfileSettings.jsx`.
  - `src/components/`: Újrahasznosítható UI elemek (pl. layout).
  - `src/context/`: `AuthContext.jsx` - a globális felhasználói állapotkezelésre ("kinek a nevében vagyunk belépve").
  - `src/services/api.js`: Központi API réteg, ami a backenddel kommunikál.
- **`server/`**: A logika, biztonság és adatszolgáltató réteg.
  - `index.js`: Express belépési pont.
  - `routes/`: Az egyes szolgáltatások végpontcsoportjai (`auth.js`, `events.js`, `sharing.js`, `user.js`, `settings.js`).
  - `middleware/`: Biztonsági és hitelesítő funkciók (`auth.js`).
  - `data/`: Letárolt rekordok (`users.json`, `events.json`, stb.).

---

## 2. Megvalósított Funkciók (Features) és Logikájuk

Minden funkció szigorú frontend-backend szeparációban épült fel. A frontend csak vizualizál és kéréseket fogalmaz meg, a validációk és jogosultság-ellenőrzések a backend oldalon futnak le.

### 2.1. Felhasználó kezelés és Autentikáció (Auth)
**Miért és hogyan működik:**
- Minden művelet védett. Csak bejelentkezett felhasználók érhetik el az útvonalakat.
- **Regisztráció:** A rendszer bcrypt-et használ a jelszavak titkosításához mentés előtt. Egyedi `UUID` és `inviteToken` jön létre minden felhasználóhoz regisztrációkor.
- **Bejelentkezés:** Készítettünk egy JSON Web Token (JWT) alapú azonosítást. Ha a bejelentkezés sikeres (jelszóegyezés), a backend egy 24 órás lejárati idejű tokent állít ki.
- **Autentikációs Middleware:** A `server/middleware/auth.js` ellenőrzi a tokent az `Authorization: Bearer <token>` fejlécekből minden további kérés (Pl. saját események kérése) előtt, majd továbbítja a `req.userId` tulajdonságot, így elkerülhető, hogy felhasználók egymás adataihoz férjenek.

### 2.2. Naptáresemények Kezelése (Event CRUD)
**Miért és hogyan működik:**
- Felhasználók egyedi (saját) naptárt látnak. Az eseményeket lehet újként rögzíteni, frissíteni (módosítható kezdés, vég, leírás, szín, egész napos paraméterek) és törölni.
- **FullCalendar Integráció:** A naptárt egy dialógusablak fedi (react modal). Új esemény felvitele gombra kattintva POST hívás indul, eseményre (eventClick) kattintva PUT kéréssel módosítunk.
- **Drag & Drop:** A `eventDrop` és `eventResize` callbackek is bekötésre kerültek, hogy ha a felhasználó optikailag átrak egy elemet más időpontra, azonnal `PUT` hálózati kérés frissítse a rekodok kezdeti és végső dátumait.

### 2.3. Naptármegosztás és Meghívók
**Miért és hogyan működik:**
- Cél: csapattagok, barátok láthassák egymás időbeosztását engedély alapján. Biztonsági okokból egyedi *"inviteToken"* (meghívó link) rendszert alkottunk.
- **Meghívó Link küldése (token alapú):** A felhasználó kimásolhat egy fix meghívó linket, amit elküld. A fogadó fél beírja, ezáltal POST kérés indul a token alapján. Olyan mintha elküldene egy "PENDING" (függő) jelzést a másiknak.
- **Elfogadás/Elutasítás:** A "SharedWithMe" oldal leolvassa a bejövő "PENDING" kéréseket. Gombnyomásra "ACCEPTED"-re (Elfogadva) vált. Ekkor jön létre a jogosultság.
- **Megosztott adatok olvasása:** A hozzáférés elnyerése után a hitelesítő middleware már engedni fogja, hogy egy másik `ownerId` eseményeit "Csak Olvasás" jogkörben lehívjuk.

### 2.4. Profilbeállítások
**Miért és hogyan működik:**
- Personalizáció. Név áthangolása, profilképszínek váltása (hex color) és jelszó csere.
- **Beállítások szinkronja:** Ezen túl létezik default naptár nyelv (`hu`/`en`), időzóna beállítás (pl. "Europe/Budapest"), amelyet egy külön beállítás specifikus végpont kezel. A Frontend a felcsatlakozást követően ezt alkalmazza a UI elemeken.

---

## 3. Fontos API Végpontok (Endpoints)

| Modul | Method | Végpont (Endpoint) | Funkció |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Új fiók regisztrálása, titkosított jelszó mentése |
| **Auth** | `POST` | `/api/auth/login` | Belépés és JWT token visszaadása |
| **Events** | `GET` | `/api/events` | A belépett felhasználó eseményinek listázása (opcionális időszakos szűréssel) |
| **Events** | `POST` | `/api/events` | Új naptáresemény (Event) felvitele |
| **Events** | `PUT` | `/api/events/:id` | Meglévő esemény módosítása (sajat ellenőrzéssel) |
| **Events** | `DELETE` | `/api/events/:id` | Meglévő esemény törlése |
| **Sharing**| `GET` | `/api/sharing/invites` | Félkész, hozzám bejövő (PENDING) naptármegosztó meghívóim lekérése |
| **Sharing**| `POST` | `/api/sharing/invite` | Másolás alapján egyedi `inviteToken`-ből megosztási kérelmet teszünk (nyitunk) valaki felé |
| **Sharing**| `PUT` | `/api/sharing/invites/:id/accept` | Meghívó Elfogadása |
| **Sharing**| `PUT` | `/api/sharing/invites/:id/reject` | Meghívó Elutasítása |
| **Sharing**| `GET` | `/api/sharing/calendars`| Azok a naptárak (userek) akiket én "figyelhetek" (ACCEPTED státusz) |
| **Sharing**| `GET` | `/api/sharing/calendars/:ownerId/events`| Védett, megosztott események (Csak Olvasható) lekérése jogosultság megléte mellett |
| **User** | `GET / PUT` | `/api/user/profile` | A profil adatok, és vizuális beállítások felolvasása és módosítása |
| **User** | `PUT` | `/api/user/password` | Biztonságos jelszócsere régi jelszó megadása mellett |
| **User** | `GET` | `/api/user/invite-link` | Egyedi invitáló azonosító token generálása vagy elkérése |

---

## 4. Kihívások és Mestertervek (Megoldások Tárháza)

A projekt életciklusa alatt felmerült problémák és az alkalmazott kreatív megoldások.

### 4.1. Az Időzóna- és Dátumformátum Káosz Megoldása
* **Kihívás:** A FullCalendar komponens a kliensidőt (böngészőt) használta, a backend elcsúszott a nyári/téli időszámítással, így a délután 2 órás megbeszélés hol 12, hol 4 órakor jelent meg a felületen. 
* **Megoldás (Kőbe vésett ISO szabvány):** A rendszer kötelező érvényűvé tette, hogy a dátumok **`ISO 8601 UTC ("Z" végződés)`** formátumban (`"2026-04-03T10:00:00Z"`) kerülnek forgalomba. A `new Date(req.body.start).toISOString()` beépített JavaScript függvénye garantálta a tiszta fordítást, a böngészők pedig helyesen rajzolták fel a "helyi" időzónára transzformálva.

### 4.2. Biztonsági Konvenciók: Hibakezelések elrejtése
* **Biztonsági Rendelet:** Nyers Jelszavakról (PlainText) nincs szó, mindig `bcryptHash`-re épít a Backend. Amikor bejelentkezünk és elrontunk valamit, a `401 - Unauthorized` hibaüzenet egységes: *"Hibás felhasználónév vagy jelszó"*. Nem áruljuk el a próbálkozónak, hogy csupán a jelszó hibás-e, ezzel megakadályozva a fiók keresési kísérleteket, bot neteket. Profiladat lekéréskor (`GET /user/profile`) a `passwordHash` paraméter blokkolva van a szerver kimenetében.

### 4.3. Központi Frontend HTTP Wrapper API (Zseniális API Layer)
* **Kihívás:** Korai fázisban mindenhol hívták a `fetch` parancsot a token header kézi injektálásával (AuthContext, CalendarPage). Sok volt a duplikáció és mikor a jogosultságok lejártak a felhasználó beragadt törött oldalakon. 
* **Megoldás (Wrapper Architecture):** A `services/api.js` létrehozása. Egy darab központi `apiFetch` függvényt írtunk, ami láthatatlanul fűzi be a `.getItem("token")`-t a fejlécekbe minden hálózati kiáramlásnál. Ráadásul rendelkezik automatikus `status === 401` vizsgálattal: amennyiben lejárt, azonnal törli a sessiont (`localStorage.removeItem("token")`) és kényszer navigál a Login oldalra. Ezzel eltűnt a redundancia és professzionális lett a munkamenet-menedzsment.

### 4.4. A Csapatos Verziókezelés Stratégiája (Git Flow)
* **Konfliktuskezelés beállása:** 4 ember (2 BE, 2 FE) 1 hetes ciklusban összetörte volna a Master branch-et a hirtelen PR áradattal.
* **A megoldás (Időzített Workflow):** Rögzítettük, hogy tilos egyenesen `dev`/`main`-re írni. Mindenki saját `feature/<feladat-neve>` ágra vitte a fejlesztést. Hogy elejét vegyük annak is, hogy a frontend hiába vár a backend végpontjaira, beiktattunk egy eltolást: A Backend tagoknak legalább 1 napos előnye kellett legyen konkrét útvonalak és modellek leprogramozásában, mielőtt a megfelelő Frontend csapattag nekifogott a UI kötésnek, garantálva a tökéletes ritmust.

### 4.5. Nem-Relációs Fájl-Beágyazott Adatbázis Voksolás
* **Bázis probléma:** Házifeladathoz komplex SQL relációk és külső szververfelállítás túlzói lennének és lassítanák a tesztelést.
* **Megoldás:** Minden adattáblát (`users`, `events`, `shares`, `settings`) egy beágyazott `.json` flat-file hurokban oldottunk meg lokális futtatásban (`data/` mappa). A UUID generálásokkal megelőztük a primary key index ütközéseket. Amennyiben a jövőben mégis adatbázis csatlakozásra adnánk a fejünket, csak a Service-Store logikát kell lecserélni egy Prisma/Mongoose ORM megvalósításra érintetlen API mellett.

---

**Szerkesztve:** AntiGravity Assistant
**Dokumentáció státusz:** KÉSZ (Véglegesített Architektúra)
