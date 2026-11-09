# ui-sent-emails Specification

## Purpose

Gives customer-admin users a tab listing sent emails in pages, newest first, filtered by last name and state.

## Requirements

### Requirement: Admin-only tab
The Emails tab SHALL be shown only to `customer-admin` users.

#### Scenario: Admin
- **WHEN** a `customer-admin` signs in
- **THEN** the Emails tab is available

#### Scenario: Viewer
- **WHEN** a `customer-viewer` signs in
- **THEN** no Emails tab is shown and the email API is not called

### Requirement: Paged list
The tab SHALL show one page of emails at a time, newest first, with previous and next controls and the current page and total.

#### Scenario: Next page
- **WHEN** an admin chooses next
- **THEN** the following page of older emails is shown

#### Scenario: Last page
- **WHEN** the last page is shown
- **THEN** the next control is disabled

#### Scenario: No emails
- **WHEN** no emails match
- **THEN** a message says there are no emails

### Requirement: Filters
The tab SHALL filter by last name and state. Changing a filter SHALL return to the first page.

#### Scenario: Filter applied on a later page
- **WHEN** an admin on page 3 enters a last name
- **THEN** the first page of matching emails is shown
