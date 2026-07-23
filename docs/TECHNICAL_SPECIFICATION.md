# Kflix Technical Specification

## 1. Scope

Kflix is a React/Vite media-discovery application backed by TMDB data and an Express/MongoDB service for personal features. The repository currently contains both a frontend client and a backend with authentication, preferences, recently viewed, recommendations, watchlist, and upload-related structure.

## 2. System architecture

```text
Browser
  |
  v
React + Vite client
  |--------------------> TMDB API for public media data where client calls remain
  |
  v
Express API
  |--------------------> MongoDB
  |--------------------> TMDB API where server-side proxying/recommendations apply
  +--------------------> local or configured upload storage
```

The product should converge on a single documented boundary for TMDB access. Sensitive credentials and personalized aggregation should be server-side.

## 3. Runtime and dependencies

### Root/server

- Node.js
- Express 5
- Mongoose 9
- JWT authentication
- bcrypt password hashing
- cookie-parser
- CORS
- Multer for uploads
- dotenv

### Client

- React
- Vite
- React Router
- Tailwind CSS
- TMDB API integration

## 4. Repository layout

```text
client/                         frontend application
server/
  app.js                        Express composition
  server.js                     runtime entrypoint
  config/                       database and environment configuration
  controllers/                  route business logic
  middleware/                   authentication, errors, and uploads
  models/                       Mongoose models
  routes/
    authRoutes.js
    preferencesRoutes.js
    recentlyViewedRoutes.js
    recommendationRoutes.js
    watchlistRoutes.js
  uploads/                      upload destination where enabled
  utils/                        shared helpers
docs/
  PRD.md
  TECHNICAL_SPECIFICATION.md
```

## 5. Configuration

The exact implementation is authoritative, but the system should validate and document these categories:

| Variable | Purpose |
| --- | --- |
| `PORT` | Express listening port. |
| `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` | Token-signing secret. |
| `TMDB_TOKEN` or server equivalent | Server-side TMDB credential. |
| `VITE_TMDB_TOKEN` | Client-visible TMDB credential when direct browser calls remain. |
| `CLIENT_ORIGIN` | Approved CORS origin. |
| `NODE_ENV` | Runtime mode. |

Any value prefixed with `VITE_` must be treated as public because it is bundled into client code.

## 6. Client routes

```text
/                 home discovery
/movies           movie browse and search
/movies/:id       movie details
/series           television browse and search
/series/:id       television details
/login            login
/register         registration
```

Authenticated personal routes may be added for watchlist, settings, or profile when the client implements them.

## 7. Backend API domains

### Authentication

Responsibilities:

- register user;
- hash password;
- authenticate credentials;
- issue session or token;
- return current user;
- clear session or token on logout.

### Preferences

Responsibilities:

- retrieve authenticated user preferences;
- validate and update supported fields;
- prevent arbitrary field writes.

### Watchlist

Responsibilities:

- list user watchlist entries;
- add normalized media reference;
- prevent duplicates;
- remove only the requesting user's entry.

Recommended identity key:

```text
userId + mediaType + tmdbId
```

### Recently viewed

Responsibilities:

- record a title view;
- update recency for repeat views;
- return most-recent-first history;
- enforce a retention cap.

### Recommendations

Responsibilities:

- derive recommendations from preferences, watchlist, and recent activity;
- request TMDB content where necessary;
- deduplicate titles;
- exclude already viewed or saved titles when appropriate;
- return a useful cold-start fallback.

## 8. Data models

### User

Recommended fields:

```text
_id
email
passwordHash
displayName
preferences
createdAt
updatedAt
```

### Watchlist entry

```text
_id
userId
mediaType: movie | tv
tmdbId
titleSnapshot
posterPath
releaseDate or firstAirDate
createdAt
```

A unique index should prevent duplicate `userId + mediaType + tmdbId` combinations.

### Recently viewed entry

```text
_id
userId
mediaType
tmdbId
titleSnapshot
posterPath
viewedAt
```

Repeated views should update `viewedAt` rather than append indefinitely.

### Preferences

May be embedded in the user document or stored separately. Supported fields should be explicit, for example:

```text
preferredGenres[]
preferredMediaTypes[]
providerRegion
language
adultContentAllowed
```

## 9. TMDB integration

- Centralize base URL, headers, image URL construction, and query encoding.
- Distinguish movie and television identifiers with `mediaType`.
- Normalize TMDB payloads before storing snapshots.
- Handle rate limits, unavailable fields, and network failures.
- Cache popular, trending, and detail data where appropriate.
- Attribute TMDB and comply with its terms.
- Do not log credentials or full authorization headers.

## 10. Authentication and security

- Store only password hashes.
- Use strong JWT secrets and explicit expiration.
- Prefer HttpOnly, Secure cookies for browser sessions when deployment topology permits.
- Apply strict production CORS.
- Validate all route inputs.
- Add rate limits to registration and login.
- Authorize every personal-data query by authenticated user ID.
- Prevent mass assignment in preferences and profile updates.
- Restrict Multer uploads by MIME type, extension, size, and destination.
- Never serve arbitrary uploaded files with executable content types.
- Scan dependencies and secrets in CI.

## 11. Error model

Recommended response:

```json
{
  "error": {
    "code": "WATCHLIST_ENTRY_EXISTS",
    "message": "This title is already in the watchlist.",
    "details": {}
  }
}
```

Recommended statuses:

| Status | Use |
| --- | --- |
| `400` | Invalid request. |
| `401` | Missing or invalid authentication. |
| `403` | Authenticated but unauthorized. |
| `404` | Resource not found. |
| `409` | Duplicate or state conflict. |
| `413` | Upload too large. |
| `429` | Rate limit exceeded. |
| `502` | TMDB upstream failure. |
| `500` | Unexpected server failure. |

## 12. Frontend data flow

- Page routes own loading, empty, error, and success states.
- Search query changes reset pagination.
- Stale requests should be aborted when route parameters or queries change.
- Shared TMDB logic should move into a typed API layer or hooks.
- Personal-data mutations should update or invalidate relevant cached state.
- Detail pages should render partial content when optional TMDB sections fail.

## 13. Accessibility

- Use semantic headings and landmarks.
- Ensure carousel controls have accessible names.
- Pause or reduce autoplay when reduced motion is requested.
- Preserve keyboard access to cards, pagination, search, and watchlist actions.
- Provide meaningful image alternatives.
- Ensure text over backdrops meets contrast requirements.
- Announce loading and mutation outcomes where appropriate.

## 14. Performance

- Lazy-load route bundles.
- Use responsive image sizes and browser lazy loading.
- Cache common TMDB queries.
- Avoid fetching full appended detail payloads when a page does not render them.
- Deduplicate identical concurrent requests.
- Keep hero carousel items bounded.
- Paginate or cap personal history collections.

## 15. Testing strategy

### Server unit tests

- password hashing and token helpers;
- preference validation;
- watchlist uniqueness;
- recent-history retention;
- recommendation deduplication and cold-start behavior;
- upload validation.

### Server integration tests

- register, login, current user, and logout;
- protected-route rejection;
- watchlist add/list/remove;
- recently viewed upsert and ordering;
- preference read/update;
- recommendation isolation per user;
- TMDB upstream failure handling.

### Client tests

- home sections render normalized data;
- movie and series search;
- pagination reset and navigation;
- detail-page fallbacks;
- login and registration states;
- watchlist mutation states;
- keyboard and reduced-motion behavior.

### End-to-end tests

- browse a title;
- open details;
- register or log in;
- add to watchlist;
- revisit and confirm recently viewed behavior;
- update preferences;
- receive recommendations.

## 16. CI and deployment

Required pipeline:

1. Install root and client dependencies.
2. Lint client and server.
3. Run automated tests.
4. Build the client.
5. Scan for secrets and dependency vulnerabilities.
6. Deploy only after required checks pass.

Deployment must define:

- separate or combined client/server hosting;
- MongoDB ownership and backup policy;
- TMDB credential location;
- CORS and cookie settings;
- SPA route fallback;
- upload storage persistence and limits;
- health and readiness checks.

## 17. Known documentation and implementation gaps

- The root README largely describes a frontend-only architecture while the repository contains a backend and MongoDB dependencies.
- The canonical TMDB request boundary is unclear.
- Test and CI coverage is not documented in the root package scripts.
- Authentication transport and cookie policy require explicit confirmation.
- Upload purpose, retention, and serving policy require documentation.
- Personal feature readiness should be verified before being advertised as production-complete.

## 18. Acceptance criteria

The baseline is considered technically documented when:

- frontend and backend responsibilities are clearly separated;
- all environment variables and API domains are documented;
- personal-data routes are authenticated and user-scoped;
- watchlist duplicates and recent-history growth are constrained;
- TMDB credentials are handled according to their exposure level;
- tests cover authentication, authorization, and core personal features;
- README, PRD, and this specification are kept aligned with verified implementation.
