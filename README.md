# FITTRACK — Premium Fitness & Nutrition App

A premium-looking, **frontend-only** fitness and nutrition tracking prototype.
light premium theme with lime accent, built with React + TypeScript + Tailwind CSS.

> All data is mock/in-memory — nothing persists after refresh, and there is no
> backend, database, or API by design.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (dev server & build tool)
- **Tailwind CSS v4** (design tokens via `@theme` in `src/index.css`)
- **React Router 7** (page navigation)
- **Recharts** (charts & progress visualizations)
- **Lucide React** (icons)

## Run Locally

```sh
npm install
npm run dev
```

Then open the printed URL (default: **http://localhost:5173**).

Production build & preview:

```sh
npm run build     # type-checks + bundles to dist/
npm run preview   # serve the production build
```

## Pages

| Route       | Page                                                                |
| ----------- | ------------------------------------------------------------------- |
| `/`         | Dashboard — calorie ring, macros, water widget, meals, weekly chart |
| `/diary`    | Food Diary — breakfast/lunch/dinner/snacks, edit & delete, date nav |
| `/search`   | Food Search — 40+ Indian foods, filters, serving & quantity picker  |
| `/progress` | Progress — calorie/protein/weight charts, macro pie, comparison     |
| `/water`    | Water Tracker — bottle visual, quick add, custom amount, history    |
| `/activity` | Exercise Tracker — 5 workout types, MET-based burn, history         |
| `/weight`   | Weight Tracker — trend chart (weekly/monthly), history, add entry   |
| `/profile`  | Profile & Settings — personal info, targets, units, theme, alerts   |

## Structure

```
src/
├── components/       # Layout (sidebar + bottom nav), UI kit, chart theme
├── data/             # Indian food database & seed mock data
├── pages/            # The eight pages above
├── store/            # AppContext — global React state & actions
├── utils/            # Date & nutrition helpers
├── types.ts          # Shared domain types
└── index.css         # Design tokens (colors, font) & animations
```

All interactions (add/edit/delete food, water, workouts, weigh-ins, settings)
work on local React state via `AppContext` — no buttons are decorative.
