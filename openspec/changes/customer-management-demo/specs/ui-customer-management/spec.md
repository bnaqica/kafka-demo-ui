# Spec Delta

## Purpose

Shows all customers to signed-in users and lets customer-admin users add, edit and delete them.

## ADDED Requirements

### Requirement: Customer list
Signed-in users SHALL see all customers, newest first, with name, date of birth, gender, email, address and phones.

#### Scenario: Viewer sees customers
- **WHEN** a `customer-viewer` opens the app
- **THEN** all customers are listed with their details

### Requirement: Viewer is read-only
Users without `customer-admin` SHALL NOT see add, edit or delete controls.

#### Scenario: Viewer controls
- **WHEN** a `customer-viewer` views the customer list
- **THEN** no add, edit or delete controls are shown

### Requirement: Admin can add and edit
`customer-admin` users SHALL be able to add and edit a customer with every field, including any number of phones, and see validation or conflict errors from the service.

#### Scenario: Add a customer
- **WHEN** an admin submits a valid new customer
- **THEN** the customer appears in the list

#### Scenario: Edit a customer
- **WHEN** an admin changes a customer's address and saves
- **THEN** the list shows the new address

#### Scenario: Duplicate email
- **WHEN** the service rejects a save because the email exists
- **THEN** the form stays open and shows the error

### Requirement: Admin can delete
`customer-admin` users SHALL be able to delete a customer after confirming.

#### Scenario: Confirmed delete
- **WHEN** an admin confirms deleting a customer
- **THEN** the customer disappears from the list

#### Scenario: Cancelled delete
- **WHEN** an admin cancels the confirmation
- **THEN** nothing is deleted

### Requirement: Safe to retry adding
Adding a customer SHALL send an `Idempotency-Key`. Retrying the same unchanged submission SHALL reuse it, and changing the form or a successful save SHALL produce a new one.

#### Scenario: Retry after a network failure
- **WHEN** a save fails with a network error and the admin submits again unchanged
- **THEN** the same key is sent

#### Scenario: Form changed
- **WHEN** the admin edits the form after a failure and submits
- **THEN** a new key is sent
