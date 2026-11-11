import { beforeEach, describe, expect, it, vi } from 'vitest';

const keycloak = {
  init: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  updateToken: vi.fn(),
  token: 'access-token',
  tokenParsed: {},
};
const Keycloak = vi.fn(function FakeKeycloak() {
  return keycloak;
});
vi.mock('keycloak-js', () => ({ default: Keycloak }));

async function freshSession() {
  vi.resetModules();
  return import('./session.js');
}

describe('session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    keycloak.tokenParsed = {};
  });

  it('sends a visitor straight to the kafka-demo realm sign-in, with PKCE', async () => {
    keycloak.init.mockResolvedValue(false);
    const { initSession } = await freshSession();

    await initSession();

    expect(Keycloak).toHaveBeenCalledWith(
      expect.objectContaining({ realm: 'kafka-demo', clientId: 'kafka-demo-ui' }),
    );
    expect(keycloak.init).toHaveBeenCalledWith(
      expect.objectContaining({ onLoad: 'login-required', pkceMethod: 'S256' }),
    );
    expect(keycloak.init.mock.calls[0][0]).not.toHaveProperty('silentCheckSsoRedirectUri');
  });

  it('returns nothing when there is no session', async () => {
    keycloak.init.mockResolvedValue(false);
    const { initSession } = await freshSession();

    expect(await initSession()).toBeNull();
  });

  it('only initializes once, as StrictMode mounts twice', async () => {
    keycloak.init.mockResolvedValue(false);
    const { initSession } = await freshSession();

    await Promise.all([initSession(), initSession()]);

    expect(keycloak.init).toHaveBeenCalledTimes(1);
  });

  it('returns the user with their name and admin role', async () => {
    keycloak.init.mockResolvedValue(true);
    keycloak.tokenParsed = { name: 'Admin User', realm_access: { roles: ['customer-admin'] } };
    const { initSession } = await freshSession();

    expect(await initSession()).toEqual({ name: 'Admin User', isAdmin: true });
  });

  it('treats a viewer as not admin and falls back to the username', async () => {
    keycloak.init.mockResolvedValue(true);
    keycloak.tokenParsed = { preferred_username: 'viewer', realm_access: { roles: ['customer-viewer'] } };
    const { initSession } = await freshSession();

    expect(await initSession()).toEqual({ name: 'viewer', isAdmin: false });
  });

  it('refreshes before handing out a token', async () => {
    keycloak.init.mockResolvedValue(true);
    keycloak.updateToken.mockResolvedValue(true);
    const { initSession, getToken } = await freshSession();
    await initSession();

    expect(await getToken()).toBe('access-token');
    expect(keycloak.updateToken).toHaveBeenCalledWith(30);
  });

  it('ends the session when the token cannot be refreshed', async () => {
    keycloak.init.mockResolvedValue(true);
    keycloak.updateToken.mockRejectedValue(new Error('expired'));
    const { initSession, getToken, onSessionEnded } = await freshSession();
    await initSession();
    const ended = vi.fn();
    onSessionEnded(ended);

    await expect(getToken()).rejects.toThrow('Your session has expired');
    expect(ended).toHaveBeenCalled();
  });

  it('keeps the token out of browser storage', async () => {
    keycloak.init.mockResolvedValue(true);
    keycloak.updateToken.mockResolvedValue(true);
    const { initSession, getToken } = await freshSession();
    await initSession();
    await getToken();

    expect(JSON.stringify({ ...localStorage })).not.toContain('access-token');
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('access-token');
  });

  it('signs in and out through Keycloak', async () => {
    keycloak.init.mockResolvedValue(false);
    const { initSession, signIn, signOut } = await freshSession();
    await initSession();

    signIn();
    signOut();

    expect(keycloak.login).toHaveBeenCalled();
    expect(keycloak.logout).toHaveBeenCalledWith({ redirectUri: window.location.origin });
  });
});
