# Design

## Context

See proposal.md for motivation. The UI is React 19 with Vite, with no router and no auth. `src/api/client.js` wraps `fetch`, and `usePolling` refreshes data every 3 seconds. Paths are proxied to each service, so there is no CORS. The realm already has a public `kafka-demo-ui` client with PKCE and redirect URIs for ports 5173 and 8080, and password login is disabled on it.

## Goals / Non-Goals

**Non-Goals:**
- A custom username and password form.
- URL routing; tabs are component state.
- Paging the customer list.
- A UI for the phone, idempotency-key or incoming-event CRUD APIs.

## Decisions

### Login through `keycloak-js`

Opening the app goes straight to the realm's hosted sign-in page; the app only shows a page of its own when Keycloak
can't be reached. `keycloak-js` handles PKCE, the code exchange and refresh. It starts with `login-required`, so a reload
with a live Keycloak session comes straight back without asking again, and the token is never stored. The sign-in page
uses a `kafka-demo` login theme in `local-docker` that extends Keycloak's own theme with the app's colours. Alternative
considered: a custom form with the password grant, rejected because it handles passwords in the app and the client has
that grant disabled.

The Keycloak URL comes from `VITE_KEYCLOAK_URL`, defaulting to `http://localhost:8180`. A new `src/auth` module exposes the session, the roles from `realm_access.roles`, and a `getToken()` that refreshes when under 30 seconds remain.

### Hiding controls is not the security boundary

The UI hides what a role can't use, for usability only. The services enforce every rule.

### One form for add and edit

`CustomerForm` handles both, with a repeatable phone list, and always uses the customer POST or PUT. A phone edit therefore produces one event and one email per save, and the phones API isn't needed here. `state` is a dropdown of US codes.

### Idempotency key lifetime

The form creates a key with `crypto.randomUUID()` and replaces it when any field changes or a save succeeds. Keying on form contents means a retry after a lost response reuses the key.

### Emails tab

A dedicated paged hook, polling only while the tab is open. The list polls with the current page and filters, and the last-name filter is debounced so typing doesn't send a request per keystroke.

## Risks / Trade-offs

- [The Keycloak URL is fixed at build time in the container image] → Fine for the local demo; documented in the README.
- [Polling continues while idle, keeping the session alive] → Acceptable for a demo; polling stops on sign out.
- [Tests need a fake Keycloak] → Mock the `src/auth` module rather than `keycloak-js` internals.

## Migration Plan

Apply after the three service changes, because this UI depends on the new customer shape, roles and paged emails. Rollback: restore the previous code.
