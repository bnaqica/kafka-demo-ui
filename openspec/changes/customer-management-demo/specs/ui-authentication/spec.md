# Spec Delta

## Purpose

Lets people sign in through the kafka-demo Keycloak realm and makes every service call carry their token.

## ADDED Requirements

### Requirement: Login page
A visitor who is not signed in SHALL see only a login page. Choosing to sign in SHALL go to the `kafka-demo` realm's login using the authorization code flow with PKCE, and return to the app.

#### Scenario: Not signed in
- **WHEN** a visitor opens the app without a session
- **THEN** the login page is shown and no customer data is requested

#### Scenario: Successful sign in
- **WHEN** a user signs in at Keycloak
- **THEN** the app opens showing the user's name

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
- **THEN** the login page is shown

### Requirement: Sign out
Signed-in users SHALL be able to sign out, which ends the Keycloak session and returns to the login page.

#### Scenario: Sign out
- **WHEN** a user chooses sign out
- **THEN** the login page is shown and service calls stop

### Requirement: Keycloak unavailable
The login page SHALL show an error if Keycloak can't be reached.

#### Scenario: Keycloak down
- **WHEN** the app can't reach Keycloak at startup
- **THEN** the login page says sign-in is unavailable
