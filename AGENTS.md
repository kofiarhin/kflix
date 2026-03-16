# Kofi Coding Guidelines

## 1. Core Stack Defaults
**Rule**  
Use React with the latest Vite setup as the default frontend unless explicitly told otherwise. Default backend stack is Node.js, Express, and MongoDB/Mongoose.

**Why**  
This keeps project setup consistent, fast, and aligned with your normal workflow.

**Apply when**  
Starting new projects, generating boilerplate, suggesting architecture, or fixing code.

**Exceptions**  
Use another stack only when the project clearly requires it or you explicitly request it.

---

## 2. Root Project Structure
**Rule**  
Keep `package.json` at the project root by default.

**Preferred structure**
```txt
package.json
client/
server/
```

**Why**  
This keeps scripts, installs, and project orchestration simple.

**Exceptions**  
Only nest `package.json` deeper if explicitly requested or the project truly needs split package management.

---

## 3. Frontend Styling Default
**Rule**  
Use Tailwind CSS by default. Use SCSS only when explicitly requested or when the existing codebase already standardizes on it.

---

## 4. Styling as a UI-Layer Concern
**Rule**  
Treat styling as a UI-layer concern only. Keep styles near the component or page they serve, and never mix styling with fetching, app state, or business rules.

---

## 5. Component Responsibility
**Rule**  
Components should handle rendering and interaction, not become dumping grounds for API logic, server state orchestration, or business rules.

---

## 6. Reusable UI Patterns
**Rule**  
Repeated Tailwind patterns should be abstracted into reusable components, variants, or helpers.

---

## 7. State Management Split
**Rule**  
Use Redux Toolkit for global client-side state only. Use TanStack Query for all server state.

**Standard**  
Redux manages the app. TanStack Query manages the backend.

---

## 8. State Categories
**Redux Toolkit is for**
- auth state
- UI state
- app preferences
- multistep flow state
- other true client-global state

**TanStack Query is for**
- fetching
- caching
- mutations
- invalidation
- pagination
- background refetching
- server-derived data

---

## 9. Client Folder Structure
**Rule**  
Use this structure on the client:

```txt
app/
features/
services/
hooks/queries/
hooks/mutations/
components/
pages/
routes/
lib/
utils/
```

**Definitions**
- `app/` → Redux store and shared providers
- `features/` → Redux Toolkit slices
- `services/` → raw API calls
- `hooks/queries/` → TanStack Query read hooks
- `hooks/mutations/` → TanStack Query write hooks
- `components/` → reusable UI components
- `pages/` → route-level pages
- `routes/` → app routing and protected routes
- `lib/` → axios instance and low-level shared setup
- `utils/` → helpers

---

## 10. Server Folder Structure
**Rule**  
Use this structure on the server:

```txt
config/
controllers/
middleware/
models/
routes/
utils/
```

---

## 11. API Logic Placement
**Rule**  
Keep API logic out of components.

**Example**  
Put axios or fetch logic in `services/`, then wrap it in a query or mutation hook.

---

## 12. Route Page Design
**Rule**  
Keep route pages thin and compose them from hooks plus components.

---

## 13. TDD Default
**Rule**  
Use Test-Driven Development by default. New features and bug fixes should be built with tests first or alongside implementation.

**Standard**  
All delivered code must pass.

---

## 14. Testing Framework Rules
**Rule**  
Use Vitest only for frontend testing and Jest only for backend testing.

---

## 15. Frontend Testing Folder Structure Rule
**Rule**  
Keep all frontend tests centralized under a single root-level `client/test/` directory. Do not colocate frontend tests inside `src/` or use scattered `__tests__` folders.

**Apply when**  
Use this for component, page, route, hook, integration, and UI behavior tests.

**Recommended structure**
```txt
client/test/
  setup/
  mocks/
  fixtures/
  utils/
  components/
  pages/
  routes/
  hooks/
  integration/
```

**Naming rule**  
Test file naming should mirror the source file intent by category.

**Examples**
- `src/routes/ProtectedRoute.jsx` → `test/routes/ProtectedRoute.test.jsx`
- `src/pages/Home.jsx` → `test/pages/Home.test.jsx`

**Exception**  
Only allow colocated tests if a framework or toolchain requirement makes centralized placement impractical.

**Standard**  
Keep app code in `src/` and all client tests in `test/`.

---

## 16. Test Coverage Expectations
**Rule**  
Include required test files, mocks, fixtures, and setup/config whenever behavior changes.

**Test for**
- happy paths
- invalid input
- permission failures
- empty states
- retry/failure behavior
- race conditions where relevant

**Avoid**  
Brittle tests tied to implementation details.

---

## 17. Complete Fix Delivery Rule
**Rule**  
When code is pasted and you ask to fix or regenerate it, deliver the complete fix immediately.

**Output format**
- full updated file(s)
- any required companion files
- minimal diff explanation
- short changed-files list only

---

## 18. Copy/Paste Safety Rule
**Rule**  
Never trust pasted JSX blindly. Hidden Unicode characters can break Tailwind, JSX, and imports.

**Enforcement**
Use this scan for suspicious files:
```regex
[^\x00-\x7F]
```

**Apply especially to**
- `className`
- imports
- object keys
- template literals
- config files

---

## 19. Error Handling Rule
**Rule**  
Handle all async failures explicitly. Never leave unhandled promise rejections.

**Standards**
- use centralized backend error middleware
- standardize API error responses
- frontend async flows must support loading, empty, error, and retry states
- never swallow errors silently

---

## 20. Validation + Data Contract Rule
**Rule**  
Validate request body, params, and query on the backend. Never trust client input.

**Standards**
- validate environment variables at startup
- keep frontend and backend validation aligned where practical
- define request/response shapes clearly

---

## 21. Authentication + Authorization Rule
**Rule**  
Separate authentication from authorization.

**Standards**
- enforce role and ownership checks on the server
- never rely on frontend-only permission checks
- test missing-token, invalid-token, expired-token, unauthorized, and forbidden cases
- define token expiry/refresh strategy clearly when auth exists

---

## 22. API Consistency Rule
**Rule**  
Use consistent route naming, consistent response shapes, and correct HTTP status codes.

**Standards**
- paginated endpoints must return consistent metadata
- success and error response formats should remain predictable

---

## 23. Database + Schema Integrity Rule
**Rule**  
Enforce integrity at the schema and database layer, not only in the UI.

**Standards**
- define indexes intentionally
- enforce required fields and constraints
- handle duplicate key cases cleanly
- normalize or sanitize data before save when needed

---

## 24. Performance Rule
**Rule**  
Avoid unnecessary re-renders. Memoize only when justified. Paginate large datasets. Avoid N+1 style query patterns. Lazy load heavy frontend sections when appropriate. Optimize expensive lists and media-heavy components.

---

## 25. Accessibility Rule
**Rule**  
Use semantic HTML first. Ensure keyboard accessibility and preserve visible focus states.

**Standards**
- provide labels for inputs
- use ARIA only when needed, not as a replacement for semantics
- test key interactive flows for keyboard and basic screen-reader accessibility

---

## 26. Responsive Design Rule
**Rule**  
Build mobile-first by default.

**Standards**
- test small, medium, and large breakpoints
- avoid layout decisions that only work on desktop

---

## 27. Forms Rule
**Rule**  
Forms must handle validation, pending submit state, success, and failure.

**Standards**
- disable double-submit while pending
- preserve user input where appropriate after failure
- show field-level and form-level errors clearly

---

## 28. File Upload / Media Rule
**Rule**  
Validate file size, type, and upload limits. Never trust client-provided MIME data alone.

**Standards**
- handle upload failures and partial failures cleanly
- sanitize filenames when stored
- define cleanup behavior for failed uploads

---

## 29. Real-Time / Sockets Rule
**Rule**  
Handle disconnect and reconnect states, clean up listeners on unmount, avoid duplicate subscriptions, test stale state and race conditions, and separate socket connection logic from UI rendering.

---

## 30. Background Jobs / Cron Rule
**Rule**  
Jobs should be idempotent where possible.

**Standards**
- avoid duplicate execution side effects
- log job start, success, and failure
- handle retry policy intentionally
- make timezone behavior explicit

---

## 31. Logging + Observability Rule
**Rule**  
Log meaningful server errors and critical events, but never secrets or sensitive user data.

**Standards**
- use structured logging where practical
- distinguish debug logs from production-critical logs

---

## 32. Testing Edge Case Rule
**Rule**  
Test edge cases, not just happy paths.

**Must test**
- permission failures
- invalid input
- empty states
- race conditions where relevant
- retry and failure behavior for async flows

---

## 33. Third-Party Integration Rule
**Rule**  
Wrap external services behind service layers.

**Standards**
- mock external APIs in tests
- handle rate limits, timeouts, and provider failures
- never scatter provider-specific code across components or routes

---

## 34. Configuration Rule
**Rule**  
Centralize environment and config access. Do not read raw `process.env` throughout the codebase.

**Standards**
- fail fast on missing required env vars
- use config modules for normalization

---

## 35. Environment Variables Rule
**Rule**  
Always handle environment variables through a `.env` file. Never hard-code them into the codebase.

**Also include a `.gitignore` that ignores**
- `node_modules`
- `.env`
- `notes.txt`

---

## 36. Naming + Consistency Rule
**Rule**  
Use consistent naming across files, hooks, components, routes, and env vars.

**Standards**
- components use PascalCase
- hooks use `useX` naming
- test files follow one project-wide naming standard
- avoid inconsistent singular and plural naming

---

## 37. Cleanup / Lifecycle Rule
**Rule**  
Clean up timers, intervals, subscriptions, and listeners.

**Standards**
- avoid memory leaks from effects
- cancel stale async work where needed
- guard against state updates after unmount

---

## 38. Concurrency / Async Safety Rule
**Rule**  
Guard against duplicate submissions, stale overwrites, and out-of-order async responses.

---

## 39. Documentation Rule
**Rule**  
Document non-obvious architecture decisions, required env vars, and setup steps when they are not obvious.

**Standard**  
Comments should explain why, not what.

---

## 40. Design Guidelines
**Rule**  
Prefer clean, minimalist UI.

**Standards**
- avoid unnecessary borders
- avoid gradients by default
- use solid colors unless branding requires otherwise
- use CSS Grid for primary page and section layouts
- use Flexbox mainly for small component alignment
- follow a consistent spacing scale
- avoid arbitrary spacing values
- use a tight color palette
- source colors from centralized tokens when possible
- fall back to the Tailwind palette instead of inventing arbitrary colors
- emphasize whitespace and hierarchy
- each view should emphasize one primary action

---

## 41. Component UI State Completeness
**Rule**  
Components must support loading, empty, error, success, and disabled states when relevant.

---

## 42. Presentational Component Rule
**Rule**  
Keep UI components presentational and free of business logic.

---

## 43. Icon Usage Rule
**Rule**  
Use icons when they add functional clarity or are conventionally expected. Do not overuse decorative icons.

**Standard**  
Default icon library is Font Awesome. If an icon is not available there, use another established icon library as a fallback.

---

## 44. Backend Package Defaults
**Rule**  
Do not include Helmet or Morgan by default unless explicitly requested.

---

## 45. Production-Leaning Output Rule
**Rule**  
Generated code should be copy-paste ready, practical, concise, production-leaning, and no-fluff.

---

## 46. Default Delivery Style for Code Help
**Rule**  
When solving coding tasks, give direct implementation, keep explanations brief, prefer complete files over fragments when fixing existing code, and include any required companion config or tests.

