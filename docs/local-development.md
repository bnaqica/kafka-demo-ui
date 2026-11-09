# Local development

1. Start local-docker: `kafka`, `postgres`, `mongoDB` (`docker compose up -d` in each folder).
2. Start the services, each in its own terminal: `./gradlew bootRun` in kafka-demo-customer,
   kafka-demo-email and kafka-demo-analytics.
3. Start the UI:

   ```bash
   nvm use        # Node 22 from .nvmrc
   npm install
   npm run dev
   ```

4. Open http://localhost:5173 and create a customer. Within a few seconds the email appears and the
   analytics counts go up.

## Troubleshooting

| Symptom | Fix |
|---|---|
| A card shows `500`/`502`/`ECONNREFUSED` | That service isn't running on its port. |
| `npm install` fails with `EBADENGINE` | Node is older than 22.12 — `nvm use`. |
| `npm` `EACCES` on `~/.npm` | Root-owned files in the npm cache: `sudo chown -R $(id -u):$(id -g) ~/.npm`. |
| Customer appears but no email | Check kafka-demo-email's log and the `customer-events-dlq` topic in Kafka UI (http://localhost:8085). |
| `jib: command not found` | Install the Jib CLI (see README). |
