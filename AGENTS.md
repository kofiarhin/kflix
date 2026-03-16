# AGENTS.md

## DevKofi Coding Guidelines for AI Agents

This document defines how AI agents should generate, modify, and
structure code in DevKofi projects.

------------------------------------------------------------------------

# 1. Stack Defaults

## Frontend

-   React with the **latest Vite setup**
-   **Tailwind CSS by default**
-   SCSS only when explicitly requested

## Backend

-   **Node.js + Express + MongoDB**
-   Environment variables stored in `.env`
-   Never hard‑code secrets

## Testing

-   **TDD by default**
-   **Vitest → frontend**
-   **Jest → backend**
-   Generated code must include tests when applicable

------------------------------------------------------------------------

# 2. Root Project Structure

The project uses a root-level package configuration.

    package.json
    server/
    client/

Rules: - `package.json` must live in the **root** - `server/` and
`client/` are **top-level sibling folders** - Do not place
`package.json` inside `server/` unless explicitly instructed

------------------------------------------------------------------------

# 3. Project Structure

## Client

    client/src/
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

## Server

    server/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/

Rules: - No API logic inside React components - Pages remain thin -
Business logic belongs in hooks/services

------------------------------------------------------------------------

# 4. State Management

## Redux Toolkit

Used only for: - auth - UI state - app preferences - multi-step flows

## TanStack Query

Used for: - server data - caching - mutations - pagination

Rule: **Redux manages the app. TanStack Query manages the backend.**

------------------------------------------------------------------------

# 5. Styling

-   Tailwind CSS is the **default styling system**
-   Avoid excessive utility duplication
-   Extract repeated patterns into reusable components

------------------------------------------------------------------------

# 6. Design Guidelines

## Visual Style

-   Prefer **clean minimalist UI**
-   Avoid unnecessary borders
-   Avoid gradients by default
-   Prefer **solid colors**

## Layout

-   Use **CSS Grid** for page and section layout
-   Use **Flexbox** for small alignments

## Spacing

Use Tailwind spacing scale (\~8px rhythm).

Avoid arbitrary values:

    mt-[13px]
    p-[17px]
    w-[347px]

## Colors

1.  Use centralized tokens (ex: `main.css`)
2.  If unavailable → use Tailwind palette
3.  Do not introduce arbitrary colors

## Hierarchy

Prioritize whitespace and spacing over decoration.

## Primary Action

Each screen must have **one dominant action**.

## Component States

Components must support:

-   loading
-   empty
-   error
-   success
-   disabled

## Reusable Components

If a UI pattern appears **3+ times**, extract a component.

## Presentational Rule

UI components must remain presentational.

Business logic belongs in:

    hooks/
    services/
    queries/
    mutations/

## Accessibility

Ensure:

-   semantic HTML
-   keyboard support
-   focus states
-   accessible labels

## Responsive Design

Always build **mobile‑first**.

------------------------------------------------------------------------

# 7. Icons

Use icons when they:

-   improve clarity
-   are conventionally expected

### Default Library

**Font Awesome**

### Fallback Libraries

-   Heroicons
-   Lucide
-   Material Icons

Do not create custom icons if a standard one exists.

------------------------------------------------------------------------

# 8. Error Handling

-   Handle async failures explicitly
-   Use centralized backend error middleware
-   Standardize API error responses

Frontend flows must support:

-   loading
-   empty
-   error
-   retry

------------------------------------------------------------------------

# 9. Validation

-   Validate request body, params, and query
-   Never trust client input
-   Validate environment variables at startup

------------------------------------------------------------------------

# 10. API Standards

-   Consistent route naming
-   Correct HTTP status codes
-   Predictable response structure
-   Pagination must return metadata

------------------------------------------------------------------------

# 11. Database

-   Define indexes intentionally
-   Enforce schema constraints
-   Handle duplicate key errors

------------------------------------------------------------------------

# 12. Performance

-   Avoid unnecessary re-renders
-   Memoize only when justified
-   Paginate large datasets
-   Lazy load heavy components

------------------------------------------------------------------------

# 13. Forms

Forms must support:

-   validation
-   pending state
-   success
-   failure
-   disabled submit while pending

------------------------------------------------------------------------

# 14. Background Jobs

-   Jobs must be idempotent
-   Log job start / success / failure
-   Define retry strategy

------------------------------------------------------------------------

# 15. Logging

-   Log meaningful server errors
-   Never log secrets
-   Separate debug logs from production logs

------------------------------------------------------------------------

# 16. Third‑Party Integrations

-   Wrap providers behind service layers
-   Mock APIs in tests
-   Handle rate limits and timeouts

------------------------------------------------------------------------

# 17. Configuration

-   Centralize environment config
-   Fail fast on missing env vars

------------------------------------------------------------------------

# 18. Naming

-   Components → PascalCase
-   Hooks → useSomething
-   Keep naming consistent

------------------------------------------------------------------------

# 19. Cleanup

Always clean up:

-   timers
-   listeners
-   subscriptions

Prevent state updates after unmount.

------------------------------------------------------------------------

# 20. Copy/Paste Safety

Hidden Unicode characters can break JSX.

Scan suspicious files:

    [^\x00-\x7F]

If errors persist → retype the line manually.

------------------------------------------------------------------------

# 21. Scraping

Use **Crawlee** for scraping tasks.

------------------------------------------------------------------------

# 22. Environment & Git Ignore

Always ignore:

    node_modules
    .env
    notes.txt

Never commit secrets.

------------------------------------------------------------------------

# 23. Delivery Standard

Generated code must be:

-   copy‑paste ready
-   minimal explanation
-   production‑leaning
-   consistent with these guidelines

------------------------------------------------------------------------

# DevKofi Engineering Philosophy

Clean. Minimal. Functional.

Inspired by: - Linear - Stripe - Vercel - Notion
