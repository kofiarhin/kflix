# Repository Guidelines

## Project Structure & Module Organization

This repo is split into a Vite React frontend and an Express/MongoDB backend.

- `client/src/` contains frontend code: `components/`, `pages/`, `context/`, `constants/`, and `assets/`.
- `client/public/` stores static browser assets.
- `server/` contains backend code with flat folders: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `utils/`, and `uploads/`.
- Root files such as `package.json`, `.env.example`, and `README.md` coordinate development.

Keep new backend code under `server/`; do not add `server/src/`. Prefer gradual migration for legacy frontend context code rather than broad refactors.

## Build, Test, and Development Commands

- `npm install` installs root backend/dev dependencies.
- `npm install --prefix client` installs frontend dependencies.
- `npm run dev` starts backend and frontend together with `concurrently`.
- `npm run server` starts `server/server.js` with Nodemon.
- `npm run client` starts the Vite dev server from `client/`.
- `npm start` runs the backend with Node for production-like local execution.
- `npm run build --prefix client` creates the frontend production build.
- `npm run lint --prefix client` runs ESLint for frontend JavaScript/JSX.

## Coding Style & Naming Conventions

Use JavaScript and JSX with two-space indentation. React components and page files use PascalCase, for example `Header.jsx` or `MovieDetails.jsx`. Hooks use `useX` naming. Keep API calls out of UI components; place shared API setup in `client/src/lib/` and service calls in `client/src/services/` for new code.

Tailwind CSS is the default styling system. Keep components focused on rendering and interaction, and avoid mixing styling with fetching or business logic.

## Testing Guidelines

Frontend tests should use Vitest and React Testing Library under `client/test/`, mirroring the source area, for example `client/test/pages/Home.test.jsx`. Backend tests should use Jest and Supertest under `server/tests/`.

Add tests for changed behavior, including loading, empty, error, validation, and permission cases. Until test scripts are added, run `npm run lint --prefix client` and `npm run build --prefix client` before handing off frontend changes.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries such as `update settings ui` and `Implement backend-persisted recently viewed history`. Keep commit messages concise and action-oriented.

Pull requests should include a brief description, affected areas, test or build results, linked issues when applicable, and screenshots for UI changes.

## Security & Configuration

Use root `.env` for backend configuration and `client/.env` for frontend variables. Frontend API URLs must come from `VITE_` variables. Never commit secrets or expose sensitive fields such as password hashes.
