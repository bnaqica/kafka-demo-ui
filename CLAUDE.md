# CLAUDE.md — kafka-demo-ui

React UI for the Kafka Demo system. It calls three Spring Boot services (customer :8081, email :8082,
analytics :8083) through `/api/*` paths that Vite proxies in dev and nginx proxies in the container.
Full picture: `docs/architecture.md`. Endpoints used: `docs/api.md`.

## Never commit

Claude does not commit, push, merge, rebase or open PRs in this repo — the developer reviews and commits
every change. A hook enforces this. See `.claude/rules/git-workflow.md`.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173 with API proxy
npm test           # vitest run
npm run lint       # eslint
npm run build      # dist/
npm run container  # build + Jib CLI image kafka-demo-ui:latest
```

Node 22.12+ is required (`.nvmrc`).

## Layout

```
index.html              Vite entry HTML
vite.config.js          dev server, /api proxy, Vitest config
jib.yaml                Jib CLI build file (nginx + dist/)
docker/nginx.conf       nginx config for the container
public/                 static assets copied as-is
src/
  main.jsx              React root
  App.jsx               page layout; wires data to components
  index.css             global styles and color tokens (light + dark)
  usePolling.js         load + poll hook
  api/client.js         fetch wrappers for every service endpoint
  components/           UI components, each with a colocated *.test.jsx
  test/setup.js         Vitest/Testing Library setup
```

## Conventions

- Function components and hooks only. JavaScript + JSX (no TypeScript).
- All HTTP goes through `src/api/client.js`; components never call `fetch` directly.
- Use relative `/api/...` paths. A new service path needs entries in both `vite.config.js` and `docker/nginx.conf`.
- Colors come from CSS custom properties in `index.css`; add tokens for both light and dark.
- Tests: Testing Library, query by role/label (what users see), mock `api/client.js` rather than `fetch`.
- Accessible by default: labels on inputs, `role="alert"` for errors, `role="status"` for confirmations.

## Workflow

Features start with `/opsx:propose`, not `superpowers:brainstorming`. `/opsx:apply` builds them with
`superpowers:test-driven-development`, and code review uses `superpowers:requesting-code-review`.
Finish with `/opsx:archive` after the developer has reviewed. See `.claude/rules/development-workflow.md`.

## More rules

`.claude/rules/` holds the detailed rules, including the design principles (SOLID, DRY, KISS, YAGNI). `.claude/agents/` holds review subagents. OpenSpec commands
are under `/opsx:*`. Superpowers is enabled in `.claude/settings.json`; skip any of its steps that commit.
