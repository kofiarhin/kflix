# Kflix

A cinematic movie and series discovery app built with **React**, **Vite**, **React Router**, **Tailwind CSS**, and the **TMDB API**.

Kflix lets users browse trending and popular content, search across movies and TV series, and open detailed pages for each title with trailers, recommendations, reviews, watch providers, and more.

---

# Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Screenshots / UI Highlights](#screenshots--ui-highlights)
- [Tech Stack](#tech-stack)
- [Project Goals](#project-goals)
- [Core Pages](#core-pages)
- [Routing Structure](#routing-structure)
- [Data Sources](#data-sources)
- [TMDB Endpoints Used](#tmdb-endpoints-used)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project Locally](#running-the-project-locally)
- [Build for Production](#build-for-production)
- [Deployment](#deployment)
- [How the App Works](#how-the-app-works)
- [Home Page Breakdown](#home-page-breakdown)
- [Movies Page Breakdown](#movies-page-breakdown)
- [Movie Details Page Breakdown](#movie-details-page-breakdown)
- [Series Page Breakdown](#series-page-breakdown)
- [Series Details Page Breakdown](#series-details-page-breakdown)
- [Search Functionality](#search-functionality)
- [Pagination](#pagination)
- [Hero Carousel](#hero-carousel)
- [Reviews System](#reviews-system)
- [Watch Providers](#watch-providers)
- [Recommendations and Similar Content](#recommendations-and-similar-content)
- [Reusable UI Patterns](#reusable-ui-patterns)
- [State Management Approach](#state-management-approach)
- [Error Handling](#error-handling)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Accessibility Notes](#accessibility-notes)
- [Performance Notes](#performance-notes)
- [Troubleshooting](#troubleshooting)
- [Developer Notes](#developer-notes)
- [Possible Next Features](#possible-next-features)
- [Author](#author)
- [License](#license)

---

# Overview

Kflix is a frontend movie and series app that consumes the **TMDB API** directly from the client.

The app is designed to feel modern, cinematic, and content-first. Instead of only showing plain lists, Kflix presents a richer homepage with:

- a featured hero carousel
- popular and trending movie sections
- popular and trending series sections
- full browsing pages for movies and series
- dedicated detail pages for each title

This project is a solid foundation for a portfolio-quality streaming-style UI and can be expanded later with authentication, watchlists, favorites, ratings, or a backend layer.

---

# Live Demo

Production URL:

`https://kflix-six.vercel.app`

---

# Features

## Home Page
- featured hero carousel
- autoplaying banner
- trending mixed content spotlight
- popular movies section
- trending movies section
- popular series section
- trending series section
- quick navigation to movies and series pages

## Movies
- browse popular movies
- search movies
- pagination
- poster thumbnails
- clickable movie cards
- route to individual movie details pages

## Movie Details
- full movie overview
- hero backdrop
- poster
- title, tagline, rating, release date, runtime, status
- genres
- trailer section
- recommended movies
- similar movies
- reviews
- expandable review cards
- sentiment badge based on review ratings
- watch providers by region
- production metadata

## Series
- browse popular series
- search TV series
- pagination
- poster thumbnails
- route to individual series detail pages

## Series Details
- full TV show overview
- poster and backdrop
- top cast
- content rating
- seasons and episodes count
- trailer section
- recommendations
- similar series
- reviews
- watch providers by region
- network and production metadata

## Navigation
- sticky header
- routes for home, movies, series, login, and register
- responsive navigation support

---

# Screenshots / UI Highlights

The app currently includes:
- dark cinematic visual styling
- bold hero content presentation
- card-based browsing sections
- streamlined details pages
- autoplay carousel experience inspired by streaming and media platforms

You can add screenshots later under `/public/screenshots` and reference them here.

Example structure:

```md
![Home Page](./public/screenshots/home.png)
![Movies Page](./public/screenshots/movies.png)
![Movie Details](./public/screenshots/movie-details.png)
![Series Page](./public/screenshots/series.png)
![Series Details](./public/screenshots/series-details.png)
```

---

# Tech Stack

## Frontend
- **React**
- **Vite**
- **React Router DOM**
- **Tailwind CSS**

## API
- **TMDB API**

## Deployment
- **Vercel**

---

# Project Goals

The main goal of Kflix is to create a polished entertainment discovery interface that demonstrates:

- API integration
- client-side routing
- reusable UI sections
- search and filtering logic
- pagination
- details page composition
- cinematic layout design
- modern React development patterns

This project is also useful as a foundation for:
- portfolio work
- frontend architecture practice
- media discovery apps
- future full-stack expansion

---

# Core Pages

## 1. Home
The home page is not a full list page. It is a landing page made of multiple curated content sections.

It includes:
- hero carousel
- popular movies preview
- trending movies preview
- popular series preview
- trending series preview

## 2. Movies
A dedicated listing page for movies.

It includes:
- search
- pagination
- clickable cards
- poster display
- API-driven results

## 3. Movie Details
A detailed content page for a single movie.

It includes:
- metadata
- trailer
- reviews
- similar and recommended content
- watch providers

## 4. Series
A dedicated listing page for TV series.

It includes:
- search
- pagination
- clickable cards
- poster display
- API-driven results

## 5. Series Details
A detailed content page for a single TV series.

It includes:
- metadata
- cast
- trailer
- reviews
- similar and recommended content
- watch providers

---

# Routing Structure

```txt
/                 -> Home
/movies           -> Movies listing page
/movies/:id       -> Movie details page
/series           -> Series listing page
/series/:id       -> Series details page
/login            -> Login page
/register         -> Register page
```

---

# Data Sources

Kflix uses **TMDB** as the primary data source for both movies and TV series.

The app pulls:
- trending content
- popular content
- details for a single movie or series
- videos / trailers
- recommendations
- similar titles
- reviews
- watch providers
- cast / credits
- content ratings

---

# TMDB Endpoints Used

Below are the main endpoints used or intended for use in the app.

## Home Page
- `/trending/all/week`
- `/movie/popular`
- `/trending/movie/week`
- `/tv/popular`
- `/trending/tv/week`

## Movies
- `/movie/popular`
- `/search/movie`

## Movie Details
- `/movie/{id}`
- `/movie/{id}?append_to_response=videos,similar,recommendations,reviews,watch/providers,credits,external_ids,release_dates`

## Series
- `/tv/popular`
- `/search/tv`

## Series Details
- `/tv/{id}`
- `/tv/{id}?append_to_response=videos,similar,recommendations,reviews,watch/providers,credits,content_ratings`

---

# Project Structure

```txt
client/
├── public/
├── src/
│   ├── components/
│   │   └── Header/
│   │       └── Header.jsx
│   ├── pages/
│   │   ├── Home/
│   │   │   └── Home.jsx
│   │   ├── Movies/
│   │   │   └── Movies.jsx
│   │   ├── MovieDetails/
│   │   │   └── MovieDetails.jsx
│   │   ├── Series/
│   │   │   └── Series.jsx
│   │   ├── SeriesDetails/
│   │   │   └── SeriesDetails.jsx
│   │   ├── Login/
│   │   │   └── Login.jsx
│   │   └── Register/
│   │       └── Register.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── App.css
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── index.html
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
VITE_TMDB_TOKEN=your_tmdb_read_access_token
```

Important notes:
- the variable must start with `VITE_`
- restart the dev server after editing `.env`
- because this is a client-only app, the token is exposed in the browser
- for stronger security, move API requests behind a backend later

---

# Installation

Clone the repo:

```bash
git clone https://github.com/your-username/kflix.git
cd kflix/client
```

Install dependencies:

```bash
npm install
```

Create your `.env` file:

```env
VITE_TMDB_TOKEN=your_tmdb_read_access_token
```

Start the dev server:

```bash
npm run dev
```

---

# Running the Project Locally

```bash
npm install
npm run dev
```

Default Vite local server:

```txt
http://localhost:5173
```

---

# Build for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# Deployment

Kflix is intended to be deployed easily on **Vercel**.

## Deploy steps
1. Push the repo to GitHub
2. Import the project into Vercel
3. Set the environment variable:
   - `VITE_TMDB_TOKEN`
4. Deploy

## Important for Vercel
If you use client-side routing with React Router, make sure Vercel is configured to serve the SPA correctly if needed.

A typical `vercel.json` fallback can be:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Use this only if your routes are breaking on refresh in production.

---

# How the App Works

The app is fully frontend-driven.

## Data flow
1. page loads
2. component triggers `useEffect`
3. fetch request hits TMDB endpoint
4. response JSON is stored in component state
5. UI renders cards, metadata, or detail layouts

## Navigation flow
- users browse content from the homepage
- users can click movies or series
- route changes using React Router
- detail pages fetch title-specific content

---

# Home Page Breakdown

The Home page is designed as a streaming-style dashboard.

## Sections
- hero carousel
- popular movies
- trending movies
- popular series
- trending series

## Why this structure
This makes the homepage feel curated instead of repetitive. It gives users multiple ways to discover content without overwhelming them with a single endless list.

## Hero carousel purpose
The hero carousel acts as the visual spotlight for featured titles and gives the page an instant cinematic feel.

---

# Movies Page Breakdown

The Movies page is the full browsing page for movies.

## Responsibilities
- fetch popular movies by default
- support movie search
- support pagination
- display poster thumbnails and metadata
- route to `/movies/:id`

## Search behavior
- when no search term exists, the page shows popular movies
- when search is submitted, the page switches to TMDB search results
- clearing the search returns the page to popular content

---

# Movie Details Page Breakdown

The Movie Details page combines the core TMDB movie payload with related resources.

## Content includes
- title
- overview
- poster
- backdrop
- release date
- runtime
- rating
- genres
- status
- trailer
- watch providers
- production info
- reviews
- recommendations
- similar movies

## Why this matters
This page transforms the app from a list browser into a real media discovery experience.

---

# Series Page Breakdown

The Series page mirrors the movie listing page, but for TV shows.

## Responsibilities
- fetch popular TV series
- support TV search
- support pagination
- display poster thumbnails and metadata
- route to `/series/:id`

---

# Series Details Page Breakdown

The Series Details page mirrors the movie details page but includes TV-specific data.

## Content includes
- series name
- original name
- overview
- content rating
- seasons count
- episodes count
- top cast
- creator names
- networks
- trailer
- reviews
- watch providers
- recommendations
- similar series

---

# Search Functionality

Kflix includes direct search support for both movies and TV series.

## Movies search
Uses:
- `/search/movie`

## Series search
Uses:
- `/search/tv`

## Search flow
- user types a query
- user submits form
- page resets to 1
- app fetches search results
- cards update accordingly

## Clear search
The clear button resets:
- search input
- current query
- page number

---

# Pagination

Pagination exists on:
- Movies page
- Series page

## How it works
- page starts at `1`
- next and previous buttons update `page`
- each update triggers a new API request
- total pages are limited using TMDB data
- app scrolls to top when page changes

## Reason for capping pages
TMDB can return a very high `total_pages`. Limiting it improves UX and prevents unreasonable pagination depth.

---

# Hero Carousel

The home page includes a hero carousel inspired by premium media layouts.

## Hero carousel goals
- spotlight featured content
- autoplay between items
- allow manual next/prev controls
- provide quick access to details pages
- visually separate featured content from list sections

## Current behavior
- autoplay every few seconds
- uses trending mixed content
- filters for valid backdrop images
- allows direct slide selection
- links to movies or series detail pages

## UI inspiration
The carousel is designed to feel closer to modern streaming platforms and media discovery products rather than a plain slider.

---

# Reviews System

Reviews appear on detail pages.

## Included features
- review snippet cards
- expandable review text
- author details
- created date
- optional author rating
- sentiment badge

## Sentiment badge logic
If review ratings are available:
- higher average rating = more positive sentiment
- lower average rating = more negative sentiment

This gives extra context beyond raw review text.

---

# Watch Providers

Detail pages include watch provider availability when TMDB has it for the selected region.

## Provider categories
- stream
- rent
- buy

## Region-aware behavior
The app reads the browser locale and attempts to use the current country code. If unavailable, it falls back to `US`.

## Why this feature matters
It makes the detail page more practical, not just informative.

---

# Recommendations and Similar Content

Each detail page includes:
- recommended titles
- similar titles

## Purpose
This increases session depth and makes the app feel more connected.

Users can move naturally from one title to the next without going back to the list page.

---

# Reusable UI Patterns

The app uses several reusable ideas across pages:

## Cards
Used for:
- movie previews
- series previews
- recommendation grids
- similar content grids

## Meta pills
Used for:
- rating
- release date
- runtime
- media type
- status
- content rating

## Section layout
Used for:
- home page content rows
- recommendation groups
- review blocks
- provider areas

---

# State Management Approach

Kflix currently uses local component state via:
- `useState`
- `useEffect`
- `useMemo` where useful

This is appropriate for the current project size.

## Why no global state yet
The data needs are still page-scoped:
- movie list data belongs to Movies page
- movie details data belongs to MovieDetails page
- series list data belongs to Series page
- series details data belongs to SeriesDetails page

If the app grows, good future options include:
- React Context
- Redux Toolkit
- React Query / TanStack Query

---

# Error Handling

Basic error handling is built into the page-level fetch flow.

## Current behavior
- shows loading state during API calls
- shows error message on failure
- shows empty-state text if no items exist

## Future upgrade ideas
- reusable error component
- retry button
- toast notifications
- skeleton loaders instead of plain loading text

---

# Known Limitations

## 1. Client-side token exposure
Because requests go directly from the frontend to TMDB, the API token is visible in the browser.

## 2. No authentication system yet
Login and register pages exist only as placeholders unless expanded later.

## 3. No backend persistence
There is no saved watchlist, favorites, history, or ratings yet.

## 4. No caching layer
Repeated navigation can trigger repeated requests.

## 5. No trailer modal yet
Trailers may open inline or via links depending on implementation.

## 6. No advanced filtering yet
Movies and series currently focus on popular, trending, and search instead of advanced genre/year/provider filters.

---

# Future Improvements

## Content features
- genre filter
- year filter
- sort controls
- language filter
- region selector for providers
- trailer modal
- image gallery
- season and episode details
- cast details pages
- actor search
- keyword-based discovery

## User features
- authentication
- favorites
- watchlist
- watched status
- personal ratings
- recently viewed
- continue browsing
- theme toggle

## UI/UX improvements
- skeleton loaders
- better hover animations
- drag/swipe carousel support
- mobile-optimized hero layout
- horizontal scrollers for sections
- tabs for reviews/videos/cast
- polished empty states

## Architecture improvements
- React Query for API state
- reusable hooks for TMDB fetches
- centralized API utility file
- component splitting for home sections and hero carousel
- backend proxy for API security

---

# Accessibility Notes

A few accessibility-focused ideas already fit this project well:

- use semantic headings
- add `aria-label` to carousel buttons
- preserve keyboard navigation for links and controls
- ensure contrast remains strong on backdrop overlays
- provide alt text for posters and cast images
- support reduced motion for autoplay areas later

---

# Performance Notes

## Current good practices
- limited section counts on home page
- sliced results for previews
- fetch only what each page needs
- simple state structure

## Future improvements
- lazy load images
- memoize reusable components
- preload next hero image
- debounce search input if live search is added
- use React Query cache
- add route-based code splitting

---

# Troubleshooting

## TMDB 401 error
Cause:
- missing or invalid TMDB token

Fix:
- check `.env`
- ensure the variable name is `VITE_TMDB_TOKEN`
- ensure the token is a valid TMDB Read Access Token
- restart Vite after updating `.env`

## Search not returning results
Cause:
- empty query
- typo in endpoint
- token issue

Fix:
- verify query input
- verify `/search/movie` or `/search/tv`
- inspect browser console

## React Router route shows blank page
Cause:
- typo in `element`
- missing route definition
- missing imported page component

Fix:
- confirm route uses `element={<Component />}`
- confirm route path matches links
- confirm import paths are correct

## Production refresh causes 404
Cause:
- SPA route handling not configured on host

Fix:
- add Vercel SPA rewrite config if necessary

---

# Developer Notes

## Recommended refactor path
As the project grows, split the home page into smaller components:

```txt
src/
├── components/
│   ├── HeroCarousel/
│   ├── ContentSection/
│   ├── MediaCard/
│   ├── ProviderSection/
│   └── ReviewCard/
```

This will improve:
- readability
- maintainability
- reusability

## Suggested utility layer
A future utility structure could be:

```txt
src/
├── utils/
│   ├── tmdb.js
│   ├── imageUrls.js
│   └── helpers.js
```

Example responsibilities:
- centralized fetch headers
- reusable endpoint builders
- image URL helpers
- rating/date formatting helpers

---

# Possible Next Features

Here are strong next steps for Kflix:

## High-value frontend features
- trailer modal
- favorites button
- watchlist
- cast section on movie details
- season breakdown on series details
- horizontal scrolling rows
- genre pages
- top-rated pages
- upcoming movies page
- on-the-air TV page

## Product-style features
- account system
- saved preferences
- personalized recommendations
- continue watching simulation
- content bookmarking

## Portfolio upgrades
- motion animations
- polished loading skeletons
- Lighthouse optimization pass
- SEO meta tags
- social share previews

---

# Author

Built by **Kofi**.

If you want, this README can also be expanded later with:
- setup screenshots
- architecture diagrams
- component responsibility map
- feature roadmap table
- contribution guide

---

# License

This project is for educational and portfolio purposes unless otherwise specified.

TMDB data usage must comply with TMDB’s terms and attribution requirements.

You should add attribution in your app if required by the TMDB API usage terms.

---

# Final Notes

Kflix is already a strong frontend media project because it demonstrates more than just a basic API fetch. It includes:

- structured homepage sections
- dynamic hero experience
- route-based detail pages
- search
- pagination
- recommendation systems
- review UI
- provider-aware detail content

That gives it a strong base for both portfolio presentation and future expansion into a larger full-stack entertainment platform.
