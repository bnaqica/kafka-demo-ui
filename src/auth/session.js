import Keycloak from 'keycloak-js';

// Keycloak's session in the browser. Opening the app goes straight to the Keycloak sign-in page, and tokens stay in
// memory only; a reload with a live Keycloak session comes straight back without asking again.
const MIN_TOKEN_SECONDS = 30;

let keycloak;
let initialized;
let sessionEnded = () => {};

function currentUser() {
  const { name, preferred_username: username, realm_access: realmAccess } = keycloak.tokenParsed;
  return { name: name ?? username, isAdmin: (realmAccess?.roles ?? []).includes('customer-admin') };
}

/** Resolves to the signed-in user, redirecting to sign in first if needed; safe to call twice (StrictMode). */
export function initSession() {
  initialized ??= (() => {
    keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8180',
      realm: 'kafka-demo',
      clientId: 'kafka-demo-ui',
    });
    return keycloak
      .init({ onLoad: 'login-required', pkceMethod: 'S256' })
      .then((authenticated) => (authenticated ? currentUser() : null));
  })();
  return initialized;
}

export function onSessionEnded(callback) {
  sessionEnded = callback;
}

export function signIn() {
  keycloak.login();
}

export function signOut() {
  keycloak.logout({ redirectUri: window.location.origin });
}

/** A valid access token, refreshed first if it is about to expire. */
export async function getToken() {
  try {
    await keycloak.updateToken(MIN_TOKEN_SECONDS);
  } catch {
    sessionEnded();
    throw new Error('Your session has expired');
  }
  return keycloak.token;
}
