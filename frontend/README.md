
# Naptár Projekt - Frontend (Szoftvertechnológia)

Ez a repository tartalmazza a naptár alkalmazás kliensoldali (frontend) részét a szoftech tárgyhoz. A projekt alapjai, a navigáció és a bejelentkezés logikája (mockolva) már inicializálva lettek. 

A megjelenítéshez Material UI (MUI), a naptár funkciókhoz pedig a FullCalendar könyvtár lett bekötve.

## Előfeltételek

A projekt futtatásához a következő eszközök megléte szükséges a gépen:
* **Node.js** (ajánlott v18 vagy újabb) - ez tartalmazza az **npm** csomagkezelőt is.
* **Git** - a verziókövetéshez és a kód letöltéséhez.
* Egy kódszerkesztő (pl. VS Code).

## Telepítés és Futtatás

A projekt elindításához a terminálban (vagy a VS Code beépített termináljában) a következő parancsokat kell kiadni sorrendben:

1. **A repository letöltése:**
   ```bash
   git clone <IDE_MAJD_IRD_BE_A_GITHUB_REPO_LINKEDET>
   ```

2. **Belépés a mappába:**
   ```bash
   cd eu-calendar-app
   ```

3. **Függőségek (csomagok) telepítése:**
   ```bash
   npm install
   ```
   *(Ez eltarthat egy-két percig, amíg letölti a Reactot, MUI-t, stb.)*

4. **Fejlesztői szerver indítása:**
   ```bash
   npm run dev
   ```
   A parancs lefutása után a terminál kiír egy 'Local' linket (általában `http://localhost:5173`). Ezt kell megnyitni a böngészőben.

## Mappastruktúra (Mi hol van?)

A kód érdemi része az `src` mappában található. A feladatok szétválasztása miatt érdemes figyelni, hogy mihez nyúlunk:

* `src/context/AuthContext.jsx`: Itt van a bejelentkezés logikája. Egyelőre egy fix fake tokennel működik, amíg a backend el nem készül a JWT végpontokkal. **Ezt egyelőre nem kell módosítani.**
* `src/components/Layout.jsx`: A fő keret, ami a menüsávot és a navigációt tartalmazza.
* `src/pages/Login.jsx`: A bejelentkezési képernyő UI-ja.
* `src/pages/CalendarPage.jsx`: **Fő fejlesztési terület.** Ide kell megvalósítani a FullCalendar alapú naptárnézetet és az események listázását.
* `src/pages/Settings.jsx`: A beállítások oldal helye (későbbi fejlesztéshez).

## Fejlesztési irányelvek (UI és AI asszisztencia)

A projektben nem használunk hagyományos CSS vagy SCSS fájlokat. A kinézet a **Material UI (MUI)** komponenseivel van megoldva. 

**Tippek a fejlesztéshez (vagy az AI promptolásához):**
* Ha kell egy gomb, beviteli mező vagy felugró ablak (Modal/Dialog), a MUI dokumentációjából kell átemelni a kész komponenseket (`<Button>`, `<TextField>`, `<Box>`).
* A naptár UI-hoz a `@fullcalendar/react` csomag van telepítve. 
* Jelenleg nincs valós backend kapcsolat adatbázissal (a CRUD és a jelszókezelés a backendes csapat feladata lesz a követelmények szerint). A UI teszteléséhez frontend oldalon statikus mock adatokat (hardkódolt tömböket) érdemes használni a `CalendarPage.jsx`-ben.

