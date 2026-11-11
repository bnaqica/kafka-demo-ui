# Proposal

## Why

The services now require Keycloak tokens and enforce roles, so the UI has no way to reach them without signing in. The demo also needs role-based customer management and a paged view of sent emails for administrators.

## What Changes

- Make the `kafka-demo` Keycloak realm's sign-in page, in the app's colours, the landing page, plus sign out.
- **BREAKING** Every service call sends the bearer token; the app shows nothing until signed in.
- Show all customers with the full customer details. `customer-admin` can add, edit and delete; `customer-viewer` can only view.
- Send an `Idempotency-Key` when adding a customer.
- Add an Emails tab for `customer-admin` only: paged, newest first, filtered by last name and state.
- Move the analytics summary to its own tab, for both roles.

## Capabilities

### New Capabilities

- `ui-authentication`: signing in and out, and attaching tokens to API calls.
- `ui-customer-management`: viewing customers, and adding, editing and deleting them by role.
- `ui-sent-emails`: the administrator's paged, filterable list of sent emails.
- `ui-analytics-summary`: showing event counts by type to signed-in users.

### Modified Capabilities

None. `openspec/specs/` is empty.

## Impact

- **Code:** `src/api/client.js`, `App.jsx`, customer and email components, `docs/api.md`, README, tests.
- **Dependencies:** adds `keycloak-js`.
- **Service repos:** needs `customer-management-demo` in `kafka-demo-customer` (customer shape, roles, `Idempotency-Key`), `kafka-demo-email` (paged `GET /api/emails`) and `kafka-demo-analytics` (roles). No new `/api` prefix is needed, so the Vite and nginx proxies don't change.
- **`local-docker`:** Keycloak must be running with the corrected realm.
