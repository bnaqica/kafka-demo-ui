# Local development

1. Start local-docker: `kafka`, `postgres`, `mongoDB`, `keycloak` (`docker compose up -d` in each folder).
2. Start the services, each in its own terminal: `./gradlew bootRun` in kafka-demo-customer,
   kafka-demo-email and kafka-demo-analytics.
3. Start the UI:

   ```bash
   nvm use        # Node 22 from .nvmrc
   npm install
   npm run dev
   ```

4. Open http://localhost:5173, which goes straight to the Keycloak sign-in page, and sign in as `kafkaDemoAdmin` or `kafkaDemoViewer` (password `local`). As the admin, add a
   customer; within a few seconds the email appears on the Emails tab and the analytics counts go up.

## Troubleshooting

| Symptom | Fix |
|---|---|
| A card shows `500`/`502`/`ECONNREFUSED` | That service isn't running on its port. |
| `npm install` fails with `EBADENGINE` | Node is older than 22.12 — `nvm use`. |
| `npm` `EACCES` on `~/.npm` | Root-owned files in the npm cache: `sudo chown -R $(id -u):$(id -g) ~/.npm`. |
| Customer appears but no email | Check kafka-demo-email's log and the `customer-change-event-dlq` topic in Kafka UI (http://localhost:8085). |
| The app says sign-in is unavailable | Keycloak isn't running on port 8180. |
| `jib: command not found` | Install the Jib CLI (see README). |
