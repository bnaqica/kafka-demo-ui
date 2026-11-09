# Tasks

## 1. Authentication

- [ ] 1.1 Add `keycloak-js` pinned to an exact version and `public/silent-check-sso.html`; verify `npm run build` succeeds
- [ ] 1.2 Add the `src/auth` module and login page; verify with component tests for the signed-out, signed-in and Keycloak-unavailable states
- [ ] 1.3 Make `src/api/client.js` send the bearer token and sign out when refresh fails; verify with tests that the header is sent and that no token reaches browser storage
- [ ] 1.4 Add the user's name and sign out to the header; verify with a component test that polling stops on sign out
- [ ] 1.5 Document `VITE_KEYCLOAK_URL` and the sign-in users in the README; verify the documented steps sign in against `local-docker`

## 2. Customers

- [ ] 2.1 Update `docs/api.md` and the client wrappers for the new customer shape, update and delete; verify with tests of each wrapper's request
- [ ] 2.2 Update `CustomerList` to show all details, with role-based edit and delete controls; verify with component tests for both roles
- [ ] 2.3 Expand `CustomerForm` for add and edit with repeatable phones and server error display; verify with component tests for add, edit and a 409
- [ ] 2.4 Add the idempotency key lifecycle; verify with tests for an unchanged retry, a changed form and a successful save
- [ ] 2.5 Add delete confirmation; verify with component tests for confirm and cancel

## 3. Emails tab

- [ ] 3.1 Add the paged `listEmails` wrapper and update `docs/api.md`; verify with a test of the query string
- [ ] 3.2 Add tabs and show Emails only to `customer-admin`; verify with component tests that a viewer sees no tab and makes no email call
- [ ] 3.3 Build the paged list with filters and a debounced last-name input; verify with component tests for next, last page, empty results and returning to page one on filter change

## 4. Analytics panel

- [ ] 4.1 Keep `AnalyticsPanel` for both roles, showing the new types; update its component tests and verify an error doesn't affect the rest of the app

## 5. Integration

- [ ] 5.1 Run `npm run lint`, `npm test` and `npm run build`, and verify all pass
- [ ] 5.2 With all services and `local-docker` running, sign in as both realm users and verify in a browser: viewer read-only with no Emails tab, admin add, edit and delete, and new emails appear on top with filters working
- [ ] 5.3 Leave all changes uncommitted for developer review and verify with `git status` that nothing was committed
