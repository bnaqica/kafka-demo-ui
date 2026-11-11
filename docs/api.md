# Service endpoints used by the UI

Wrappers live in `src/api/client.js`. Errors are RFC 9457 `ProblemDetail` JSON (`title`, `status`, `detail`).

| Wrapper | Request | Service | Response |
|---|---|---|---|
| `listCustomers()` | `GET /api/customers` | customer | `[{id, firstName, middleName, lastName, dateOfBirth, gender, email, address, phones, createdAt, updatedAt}]`, newest first |
| `createCustomer(c, key)` | `POST /api/customers` with `Idempotency-Key: key` | customer | `201` customer; `400` invalid; `409` email exists; `422` key reused for a different request |
| `updateCustomer(id, c)` | `PUT /api/customers/{id}` | customer | customer; `400`; `404`; `409` |
| `deleteCustomer(id)` | `DELETE /api/customers/{id}` | customer | `204`; `404` |
| `listEmails({lastName, state, page, size})` | `GET /api/emails?...` | email | `{content: [{id, sourceEventId, customerId, from, to, subject, body, status, sentAt, lastName, state, eventType}], page, size, totalElements, totalPages}`, newest first |
| `analyticsSummary()` | `GET /api/analytics/summary` | analytics | `{totalEvents, eventsByType: {type: count}}` |

A customer has `address: {street, apartment, city, state, zip}` and `phones: [{type, number}]`. Every call sends the
Keycloak access token as a bearer token; writes and the email API need `customer-admin`.

The source of truth for each endpoint is the owning service's README.
