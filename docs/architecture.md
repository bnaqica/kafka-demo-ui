# Architecture

## The Kafka Demo system

```mermaid
flowchart LR
    UI[kafka-demo-ui<br/>React :5173] -->|POST/GET /api/customers| C[kafka-demo-customer<br/>:8081]
    UI -->|GET /api/emails| E[kafka-demo-email<br/>:8082]
    UI -->|GET /api/analytics| A[kafka-demo-analytics<br/>:8083]
    C --- PG[(Postgres<br/>kafka_demo_customer_db)]
    C -->|CUSTOMER_CREATED| T1{{customer-events}}
    T1 --> E
    T1 --> A
    E -->|EMAIL_SENT| T2{{email-events}}
    T2 --> A
    E --- M1[(MongoDB<br/>kafka_demo_email_db)]
    A --- M2[(MongoDB<br/>kafka_demo_analytics_db)]
```


| Repo | Role | Port | Data store |
|---|---|---|---|
| kafka-demo-customer | Owns customers, publishes `customer-events` | 8081 | Postgres |
| kafka-demo-email | Sends a welcome email per new customer, publishes `email-events` | 8082 | MongoDB |
| kafka-demo-analytics | Counts every event on `customer-events` and `email-events` | 8083 | MongoDB |
| kafka-demo-ui | React UI over all three | 5173 | — |
| local-docker | Kafka, Postgres, MongoDB for local dev | — | — |

## The UI

One page with four cards: a customer form, the analytics summary, the customer list and the emails sent.

- `App.jsx` loads data with `usePolling` (every 3 s). Polling is deliberate: email and analytics are
  updated asynchronously from Kafka, so a refresh right after creating a customer would miss them.
- `api/client.js` is the only module that talks HTTP. Errors are turned into `Error(message)` using the
  services' `ProblemDetail.detail` when present.
- Each card handles its own loading, empty and error states, so one service being down doesn't blank the page.

## Routing to services

| Path prefix | Dev (Vite proxy) | Container (nginx) |
|---|---|---|
| `/api/customers` | `localhost:8081` | `host.docker.internal:8081` |
| `/api/emails` | `localhost:8082` | `host.docker.internal:8082` |
| `/api/analytics` | `localhost:8083` | `host.docker.internal:8083` |

The browser only ever talks to one origin, so the services need no CORS config.

## Known gaps

- No client-side routing; one page.
- Polling instead of server push (SSE/WebSocket).
- nginx upstreams are hard-coded for local use.
