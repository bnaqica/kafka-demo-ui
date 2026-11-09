---
paths:
  - "src/api/**"
  - "vite.config.js"
  - "docker/nginx.conf"
---

# Service API contracts

- The services own their APIs; their READMEs are the source of truth. `docs/api.md` mirrors what the UI uses.
- Don't invent endpoints. If the UI needs one that doesn't exist, say which service repo needs the change
  and stop there unless asked to edit that repo.
- A new path prefix must be added to **both** `vite.config.js` (dev proxy) and `docker/nginx.conf` (container).
- Update `docs/api.md` whenever `src/api/client.js` changes.
- Every call to a service API sends the Keycloak bearer token in the `Authorization` header.
