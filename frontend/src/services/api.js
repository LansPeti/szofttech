// src/services/api.js
// ================================================================
// Központi API modul — MINDEN backend hívás ezen keresztül megy.
//
// Miért van erre szükség:
// - Automatikusan hozzáadja a JWT tokent minden kéréshez
// - Ha a token lejárt (401), automatikusan kijelentkezteti a usert
// - Egységes hibakezelés (a hívó oldalon csak try/catch kell)
// - Egy helyen van a backend URL (nem szórjuk szét a kódban)
// ================================================================

// A backend szervere ezen a címen fut (Express, port 5000)
// Production esetén ugyanarról a domainről megy, ezért relatív '/calendar/api'-t használunk.
const API_BASE = import.meta.env.PROD ? "/calendar/api" : "http://localhost:5000/api";

/**
 * Általános fetch wrapper.
 * Automatikusan:
 *   - hozzáadja az Authorization headert (ha van token a localStorage-ben)
 *   - JSON-ként küldi és fogadja az adatokat
 *   - hibát dob ha a response nem OK (a hívó try/catch-csel kapja el)
 *
 * @param {string} endpoint - API végpont, pl. "/auth/login"
 * @param {object} options  - fetch opciók (method, body, headers stb.)
 * @returns {Promise<any>}  - A válasz JSON objektum, vagy null (204 esetén)
 */
async function apiFetch(endpoint, options = {}) {
  // Token kiolvasása — ha a felhasználó be van jelentkezve, ez tartalmazza a JWT-t
  const token = localStorage.getItem("token");

  // Header-ek összerakása: alap JSON + opcionális Bearer token
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // A tényleges fetch hívás a backend felé
  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // Ez ág akkor fut le, ha a fetch hálózati szinten szakad meg (pl. backend halott)
    throw new Error("Nem sikerült kapcsolódni a szerverhez. Ellenőrizd az interneted vagy a szervert!");
  }

  // ── 401 kezelés ──────────────────────────────────────────────
  // Ha a backend 401-et ad (pl. lejárt token), automatikusan kijelentkeztetjük
  // a felhasználót és átirányítjuk a login oldalra (KIVÉVE magát a login-t).
  if (response.status === 401 && endpoint !== "/auth/login") {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Lejárt a munkamenet");
  }

  // ── Egyéb hibák kezelése ─────────────────────────────────────
  // Ha a válasz nem OK (4xx, 5xx), megpróbáljuk kiolvasni az error üzenetet
  // a backend JSON válaszából, és azt dobjuk tovább mint Error.
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP hiba: ${response.status}`);
  }

  // ── 204 No Content ───────────────────────────────────────────
  // DELETE kéréseknél a backend üres választ küld (nincs JSON body).
  if (response.status === 204) return null;

  // ── Sikeres válasz ───────────────────────────────────────────
  return response.json();
}


// ================================================================
// AUTH SERVICE — Bejelentkezés és regisztráció
// ================================================================
export const authService = {
  /**
   * Bejelentkezés felhasználónév + jelszóval.
   * A backend JWT tokent ad vissza, amit a localStorage-ben tárolunk.
   * Emma route: /api/auth/login
   * @returns {{ id, username, email, avatarColor, token }}
   */
  login: (username, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  /**
   * Új felhasználó regisztrációja.
   * Sikeres regisztráció után a backend azonnal tokent is ad (auto-login).
   * Emma route: /api/auth/register
   * @returns {{ id, username, email, token }}
   */
  register: (username, email, password, securityQuestion, securityAnswer) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, securityQuestion, securityAnswer }),
    }),

  /**
   * Lekéri a felhasználóhoz tartozó biztonsági kérdést.
   */
  getSecurityQuestion: (username) =>
    apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ username }),
    }),

  /**
   * Jelszó visszaállítása a helyes biztonsági válasszal.
   */
  resetPassword: (username, answer, newPassword) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ username, answer, newPassword }),
    }),
};
// ================================================================
// EVENT SERVICE — Naptáresemények CRUD műveletei
// ================================================================
export const eventService = {
  /**
   * Saját események lekérése.
   * Opcionális start/end szűrővel adott időintervallumra szűkíthető.
   * @returns {Array<{ id, title, start, end, description, allDay, color }>}
   */
  getAll: (start, end) => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    const query = params.toString() ? `?${params}` : "";
    return apiFetch(`/events${query}`);
  },

  /**
   * Új esemény létrehozása.
   * @param {{ title, start, end?, description?, allDay?, color? }} eventData
   * @returns {Object} - A létrehozott event (id-val kiegészítve)
   */
  create: (eventData) =>
    apiFetch("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),

  /**
   * Meglévő esemény módosítása. Csak a küldött mezők frissülnek.
   * @param {string} id - Az esemény azonosítója
   * @param {Object} eventData - A módosított mezők
   * @returns {Object} - A frissített event
   */
  update: (id, eventData) =>
    apiFetch(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }),

  /**
   * Esemény törlése.
   * @param {string} id - A törlendő esemény azonosítója
   * @returns {null} - 204 No Content
   */
  delete: (id) =>
    apiFetch(`/events/${id}`, { method: "DELETE" }),
};


// ================================================================
// SHARING SERVICE — Naptár megosztás és meghívók kezelése
// ================================================================
export const sharingService = {
  /** Bejövő (PENDING státuszú) meghívók lekérése */
  getInvites: () => apiFetch("/sharing/invites"),

  /** Meghívó küldése egy másik felhasználónak a meghívó tokenje alapján */
  sendInvite: (inviteToken) =>
    apiFetch("/sharing/invite", {
      method: "POST",
      body: JSON.stringify({ inviteToken }),
    }),

  /** Bejövő meghívó elfogadása — a megosztott naptár megjelenik */
  acceptInvite: (id) =>
    apiFetch(`/sharing/invites/${id}/accept`, { method: "PUT" }),

  /** Bejövő meghívó elutasítása */
  rejectInvite: (id) =>
    apiFetch(`/sharing/invites/${id}/reject`, { method: "PUT" }),

  /** Velem megosztott naptárak listája (ACCEPTED státuszúak) */
  getSharedCalendars: () => apiFetch("/sharing/calendars"),

  /** Kilépés egy megosztott naptárból (többé nem látom az eseményeit) */
  leaveCalendar: (id) =>
    apiFetch(`/sharing/calendars/${id}`, { method: "DELETE" }),

  /** Egy megosztott naptár eseményeinek lekérése (read-only) */
  getSharedEvents: (ownerId) =>
    apiFetch(`/sharing/calendars/${ownerId}/events`),
};


// ================================================================
// USER SERVICE — Profil adatok, jelszó, meghívó link
// ================================================================
export const userService = {
  /** Saját profil adatok lekérése (username, email, avatarColor, inviteToken) */
  getProfile: () => apiFetch("/user/profile"),

  /** Profil adatok módosítása (pl. username, avatarColor) */
  updateProfile: (data) =>
    apiFetch("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Jelszó megváltoztatása.
   * A backend ellenőrzi a régi jelszót mielőtt az újra cseréli.
   */
  changePassword: (currentPassword, newPassword) =>
    apiFetch("/user/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  /** Saját meghívó token lekérése (ezzel más felhasználók hozzáférhetnek a naptáradhoz) */
  getInviteLink: () => apiFetch("/user/invite-link"),
};


// ================================================================
// SETTINGS SERVICE — Felhasználói beállítások (nyelv, időzóna)
// ================================================================
export const settingsService = {
  /** Felhasználói beállítások lekérése */
  get: () => apiFetch("/settings"),

  /** Beállítások mentése/módosítása */
  update: (data) =>
    apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
