---
paths:
  - "src/**"
  - "vite.config.js"
  - "eslint.config.js"
---

# React

- Function components and hooks; no class components. JavaScript + JSX.
- Keep components presentational where possible; data loading lives in `App.jsx`/hooks.
- All HTTP goes through `src/api/client.js`. Use relative `/api/...` paths.
- Every component handles loading, empty and error states.
- Accessibility: every input has a `<label>`; errors use `role="alert"`; confirmations `role="status"`;
  buttons say what they do.
- Styling: plain CSS in `index.css` with the existing custom-property tokens; define new tokens for both
  light and dark schemes.
- Tests are colocated as `Component.test.jsx`. Query by role/label/text; mock `../api/client.js`.
- Run `npm test` and `npm run lint` before saying you're done.
- Pin exact dependency versions in `package.json`.
