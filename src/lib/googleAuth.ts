const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

const TOKEN_STORAGE_KEY = 'integrar_central_google_token';

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface StoredGoogleSession {
  accessToken: string;
  expiresAt: number;
  profile: GoogleProfile;
}

export function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || '';
}

export function isGoogleConfigured(): boolean {
  return Boolean(getGoogleClientId());
}

function waitForGoogle(): Promise<GoogleGis> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.oauth2) {
        window.clearInterval(timer);
        resolve(window.google);
      } else if (attempts > 50) {
        window.clearInterval(timer);
        reject(new Error('Google Identity Services não carregou. Verifique a conexão e o script no index.html.'));
      }
    }, 100);
  });
}

export function loadStoredSession(): StoredGoogleSession | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredGoogleSession;
    if (!parsed.accessToken || !parsed.profile?.email) return null;
    if (parsed.expiresAt && Date.now() >= parsed.expiresAt - 60_000) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredGoogleSession): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error('Não foi possível obter o perfil Google.');
  }
  const data = await res.json();
  return {
    sub: data.sub,
    email: data.email,
    name: data.name || data.email,
    picture: data.picture
  };
}

export async function requestGoogleAccessToken(options?: { forceConsent?: boolean }): Promise<StoredGoogleSession> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Defina VITE_GOOGLE_CLIENT_ID no arquivo .env na raiz do projeto.');
  }

  const google = await waitForGoogle();

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      prompt: options?.forceConsent ? 'consent' : '',
      callback: async (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'Login Google cancelado ou falhou.'));
          return;
        }
        try {
          const profile = await fetchGoogleProfile(response.access_token);
          const expiresInMs = (response.expires_in ?? 3600) * 1000;
          const session: StoredGoogleSession = {
            accessToken: response.access_token,
            expiresAt: Date.now() + expiresInMs,
            profile
          };
          saveSession(session);
          resolve(session);
        } catch (err) {
          reject(err);
        }
      },
      error_callback: (error) => {
        reject(new Error(error.message || 'Falha no fluxo OAuth do Google.'));
      }
    });

    client.requestAccessToken({ prompt: options?.forceConsent ? 'consent' : 'select_account' });
  });
}

export async function ensureValidAccessToken(): Promise<string> {
  const existing = loadStoredSession();
  if (existing?.accessToken && Date.now() < existing.expiresAt - 60_000) {
    return existing.accessToken;
  }
  const refreshed = await requestGoogleAccessToken();
  return refreshed.accessToken;
}

export async function revokeGoogleAccess(): Promise<void> {
  const existing = loadStoredSession();
  clearSession();
  if (!existing?.accessToken || !window.google?.accounts?.oauth2) return;
  await new Promise<void>((resolve) => {
    window.google!.accounts.oauth2.revoke(existing.accessToken, () => resolve());
  });
}
