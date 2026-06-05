export const API_BASE_URL = 'https://www.sahla4eco.com';

// Google OAuth Web Client ID (from Google Cloud Console).
// The server uses the SAME value to verify the ID token (GOOGLE_OAUTH_CLIENT_ID env var).
// expo-auth-session also uses this as the `webClientId` so the returned
// `id_token` will be issued for this client and accepted by the server.
export const GOOGLE_WEB_CLIENT_ID = '978157694668-vg25hlfd3vmkqvu6n607nnceijjkvhk2.apps.googleusercontent.com';

export const STORAGE_KEYS = {
  JWT: 'sahla4eco_jwt',
  REFRESH_TOKEN: 'sahla4eco_refresh',
  USER: 'sahla4eco_user',
  PUSH_TOKEN: 'sahla4eco_push_token',
  BIOMETRIC_ENABLED: 'sahla4eco_biometric',
  NOTIF_PREFERENCES: 'sahla4eco_notif_prefs',
};
