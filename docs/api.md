# Service endpoints used by the UI

Wrappers live in `src/api/client.js`. Errors are RFC 9457 `ProblemDetail` JSON (`title`, `status`, `detail`).

| Wrapper | Request | Service | Response |
|---|---|---|---|
| `listCustomers()` | `GET /api/customers` | customer | `[{id, firstName, lastName, email, createdAt}]`, newest first |
| `createCustomer(c)` | `POST /api/customers` `{firstName, lastName, email}` | customer | `201` customer; `400` invalid; `409` email exists |
| `listEmails()` | `GET /api/emails` | email | `[{id, sourceEventId, customerId, from, to, subject, body, status, sentAt}]` |
| `analyticsSummary()` | `GET /api/analytics/summary` | analytics | `{totalEvents, eventsByType: {TYPE: count}}` |
| `recentEvents(limit)` | `GET /api/analytics/events?limit=n` | analytics | `[{eventId, eventType, sourceTopic, customerId, occurredAt, receivedAt}]` |

The source of truth for each endpoint is the owning service's README.
