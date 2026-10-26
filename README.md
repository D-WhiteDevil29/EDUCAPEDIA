# EducaPedia

**Live Application:** https://educapedia-digvijay.netlify.app/

---

## Overview

EducaPedia is a full-featured book discovery and reading platform built entirely in the browser. It provides free, unrestricted access to over 70,000 public domain classics from Project Gutenberg — with a reading experience designed to rival dedicated e-reader applications. No account required. No paywalls. No friction.

---

## Problem Statement

Access to classic literature has never been technically difficult. Project Gutenberg has catalogued over 70,000 free books for decades. The problem has always been the *experience*. Most free ebook platforms are outdated, cluttered with ads, or redirect users to raw text files with no formatting. Modern readers are accustomed to the polished experience of Kindle or Apple Books. EducaPedia was built to close that gap — delivering the same quality of reading experience, for free, entirely in the browser.

Secondary to that, discovery is broken on most free platforms. Users can search by title, but browsing by genre, finding author context, or understanding a book's place in the catalog requires jumping across multiple sites. EducaPedia consolidates discovery and reading into a single, fast, well-designed interface.

---

## What Was Built

EducaPedia is a single-page React application that integrates three systems: a book discovery layer powered by the Gutendex API (a REST interface over Project Gutenberg), a server-side EPUB delivery layer that solves browser CORS restrictions, and a full in-browser EPUB reader built on epub.js with extensive customization and scroll-based reading mechanics.

The application was designed and developed end-to-end — including architecture decisions, API integration strategy, CORS proxy design, epub.js internals patching, IndexedDB caching strategy, animation systems, and a responsive UI component library — by a single developer.

---

## Features

### Book Discovery

- **Search** across 70,000+ public domain titles by title, author, or subject in real time
- **Genre browsing** via a sticky horizontal filter strip covering 14 genres including Adventure, Science Fiction, Mystery, Romance, Horror, Philosophy, History, Poetry, Children's, Fantasy, Biography, Travel, and Drama
- **Book detail pages** display the full Gutendex metadata record: title, authors with birth and death years, download count, available format badges (EPUB, HTML, TXT), subjects, and bookshelves
- **Popular books** load by default on first visit, ranked by download count across the Gutenberg catalog
- Selecting a genre clears the active search and vice versa — the two filters are mutually exclusive and cleanly managed through context state

### In-Browser EPUB Reader

- Full EPUB rendering using epub.js, delivered over a server-side proxy that bypasses browser CORS restrictions without exposing users to third-party proxy services
- epub.js internals patched directly to resolve a long-standing issue where EPUB OPF spread metadata overrides user-specified single-column layout, causing two-page spread rendering
- Scroll-based reading model: content flows naturally as a continuous document with no column-based pagination, eliminating the page-skipping problem common in paginated epub.js implementations
- Page counter increments in real time as the user scrolls, derived from iframe scroll position plus epub.js location index for accuracy across chapter boundaries
- Chapter navigation via Prev and Next buttons, with keyboard support for Page Down, Page Up, and arrow keys

### Reading Customization

- Three complete reading themes — Dark, Sepia, and Light — each applying a full CSS ruleset inside the EPUB iframe including background, text color, link color, and blockquote styling
- Five font size levels from 80% to 160%, adjustable live without reloading the current position
- Three font family options — Serif, Sans-serif, and Monospace — applied dynamically to the rendered content
- All theme and font settings persist for the duration of the reading session

### Table of Contents

- A slide-in Contents panel parses the EPUB's navigation document and displays the full chapter list
- Tapping any chapter navigates directly to that position via epub.js CFI
- The active chapter is highlighted based on the current reading position, updated on each section change

### Translation

- A language selector in the Display settings enables translation into 10 languages: Spanish, French, German, Chinese, Arabic, Hindi, Portuguese, Japanese, Korean, and Russian
- Translation is selection-based, not page-based: a floating action bar appears when the user highlights text in the reader, showing a preview of the selection and a Translate button
- Translations are fetched from the MyMemory API, a free translation service requiring no API key
- Results slide up in a panel from the bottom of the reader, with a retranslate button to refresh after turning pages
- The translation panel is theme-aware, adapting its colors to Dark, Sepia, or Light

### Performance and Caching

- EPUB files are stored in IndexedDB after the first load using a custom cache service with a 12-book limit and 7-day expiry per entry
- A least-recently-used eviction policy removes the oldest books when the cache limit is reached
- Cached books open instantly on repeat visits with a "Loading from local cache" status indicator
- EPUB source URLs are tried in priority order: Gutenberg direct (via server proxy) first, then Internet Archive as fallback, ensuring maximum availability across book IDs

### Animations and UI

- Page transitions, component entrances, and interactive elements use Framer Motion throughout, with custom spring curves for natural-feeling motion
- Book cards stagger into view on initial load and on new search results, with hover lift effects
- The mobile menu uses a full-screen overlay with staggered link entrance animations and an animated hamburger-to-close icon transition
- Genre chips animate in on mount and respond to hover and tap with scale feedback
- The book detail page hero section uses the book's cover image as a blurred ambient background, with a gradient overlay for legibility
- Skeleton loading states match the layout of the content they replace, preventing layout shift

### Responsive Design

- Fully responsive from 360px to 4K displays
- Base font size scales down at 480px and 360px breakpoints, proportionally adjusting all rem-based spacing and typography
- The genre strip, book grid, book details, reader topbar, settings panel, and translation panel all have dedicated mobile layouts
- The EPUB reader's settings and contents panels expand to full width on mobile devices

---

## Architecture

**Frontend:** React 18 with React Router v6, Framer Motion for animation, Zustand-free global state via React Context, plain CSS with CSS custom properties for theming.

**Book data:** Gutendex REST API, which provides a clean JSON interface over the Project Gutenberg catalog including metadata, download counts, subject classifications, and direct download URLs.

**EPUB delivery:** A server-side proxy (CRA setupProxy.js in development, Netlify redirect rules in production) routes EPUB fetch requests through Node.js, which resolves CORS and follows HTTP redirects server-side before streaming the binary to the browser.

**EPUB rendering:** epub.js v0.3 with three targeted patches applied via patch-package: iframe sandbox updated to allow script execution, unload event replaced with pagehide for Permissions Policy compliance, and a runtime intercept on the rendition layout method to enforce single-column display regardless of EPUB OPF spread metadata.

**Caching:** IndexedDB via a custom service layer with structured eviction logic, separate from localStorage to support binary ArrayBuffer storage.

**Translation:** MyMemory Translation API, free tier, no authentication required.

**Deployment:** Netlify, with redirect rules handling both client-side React routing and server-side EPUB proxying in production.

---

## Technical Highlights

- Resolved a structural epub.js bug where EPUB file metadata overrides the host application's layout preferences, causing forced two-page spread rendering on wide viewports. The fix intercepts the rendition's layout method at runtime, ensuring single-column rendering regardless of the book's internal configuration.

- Designed and implemented a server-side CORS proxy strategy that works identically in development (Node.js middleware) and production (Netlify redirect rules), requiring no external proxy services or API keys.

- Built a scroll-based page tracking system that combines epub.js location indices (for accuracy at chapter boundaries) with real-time iframe scroll position (for per-page granularity within chapters), producing a page counter that increments smoothly as the user reads.

- Implemented IndexedDB caching with binary ArrayBuffer support, LRU eviction, and automatic cleanup — significantly reducing repeat load times for returning readers.

- Engineered a text-selection translation workflow that reads highlighted content directly from the sandboxed EPUB iframe (enabled by the allow-same-origin sandbox policy) and dispatches it to a translation API, making translation contextual and precise rather than page-wide.

---

## Developer

**Digvijay Shingare**

Built with three years of professional frontend development experience. All architecture decisions, API integrations, performance engineering, and UI design implemented independently.

---

*Powered by Project Gutenberg — the world's oldest digital library.*
