/** Tipagens mínimas do Google Identity Services (GIS) e OAuth token client. */

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: { type?: string; message?: string }) => void;
  prompt?: '' | 'none' | 'consent' | 'select_account';
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
  revoke: (token: string, callback?: () => void) => void;
}

interface GoogleAccountsId {
  initialize: (config: Record<string, unknown>) => void;
  prompt: (momentListener?: (notification: unknown) => void) => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
  oauth2: GoogleAccountsOAuth2;
}

interface GoogleGis {
  accounts: GoogleAccounts;
}

interface Window {
  google?: GoogleGis;
}
