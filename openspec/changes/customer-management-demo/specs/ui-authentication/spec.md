# Spec Delta

## Purpose

Lets people sign in through the kafka-demo Keycloak realm and makes every service call carry their token.

## ADDED Requirements

### Requirement: Sign-in is the landing page
A visitor who is not signed in SHALL be sent straight to the `kafka-demo` realm's sign-in page, using the authorization code flow with PKCE, and SHALL return to the app after signing in. The sign-in page SHALL use the app's colour scheme.

#### Scenario: Not signed in
- **WHEN** a visitor opens the app without a session
- **THEN** the Keycloak sign-in page is shown and no customer data is requested

#### Scenario: Successful sign in
- **WHEN** a user signs in at Keycloak
- **THEN** the app opens showing the user's name

#### Scenario: Reload while signed in
- **WHEN** a signed-in user reloads the app
- **THEN** the app opens again without asking them to sign in

### Requirement: Tokens on every call
Every service call SHALL send the access token as a bearer token. The token SHALL be refreshed before it expires and SHALL be kept in memory only, never in browser storage.

#### Scenario: Call made
- **WHEN** the app calls a service
- **THEN** the request has an `Authorization: Bearer` header

#### Scenario: Nothing stored
- **WHEN** a user is signed in
- **THEN** no token exists in `localStorage` or `sessionStorage`

#### Scenario: Session ended
- **WHEN** the token can't be refreshed
- **THEN** the app stops calling services and shows a sign-in page

### Requirement: Sign out
Signed-in users SHALL be able to sign out, which ends the Keycloak session and returns to the sign-in page.

#### Scenario: Sign out
- **WHEN** a user chooses sign out
- **THEN** the Keycloak sign-in page is shown and service calls stop

### Requirement: Keycloak unavailable
The app SHALL show its own page with an error if Keycloak can't be reached.

#### Scenario: Keycloak down
- **WHEN** the app can't reach Keycloak at startup
- **THEN** the app says sign-in is unavailable
