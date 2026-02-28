# Frontend Implementation Plan — Dining History & Discovery App

## Context
Building the React frontend for a dining history visualization app. The project is a fresh Vite + React 19 + TypeScript scaffold with all dependencies installed but zero application code. We need to build the full UI in phases, each producing a demoable increment. Backend APIs may not be ready, so we use mock data initially.

**Key files already present:** `vite.config.ts`, `src/main.tsx`, `src/app.tsx`, `src/index.css` (all minimal/empty), `package.json` (all deps installed).

**Reference:** `/home/eazydiner/hackathon/Plan.md` — full spec with API contracts, types, component tree, design tokens.

---

## ~~Phase 0: Project Foundation (~29 files)~~ ✅ COMPLETE

**Goal:** Tailwind v4 working, fonts loaded, dark theme renders, routing shell, stores, API layer with mock data. `npm run dev` shows dark page with TopBar and two routes.

### Config & Styling
1. **`vite.config.ts`** — add `@tailwindcss/vite` plugin
2. **`src/index.css`** — `@import "tailwindcss"`, `@import "@fontsource-variable/inter"`, `@theme` block with design tokens (surface, primary, accent colors), dark html styling, custom scrollbar, mapbox popup override
3. **`index.html`** — add Mapbox GL CSS CDN link, update title to "EazyDiner - Dining Map"

### Utilities (`src/utils/`)
4. **`cn.ts`** — `clsx` + `tailwind-merge` combo
5. **`colors.ts`** — `CUISINE_COLORS` map + `getCuisineColor()` fallback
6. **`format.ts`** — `formatCurrency()` (INR via Intl), `formatCompact()`, `formatRelativeDate()` (dayjs)
7. **`geo.ts`** — `getBoundsFromGeoJSON()` for map fitBounds

### Types (`src/types/`)
8. **`restaurant.ts`** — `RestaurantFeatureProperties`, `RestaurantDetail`, `HistoryEntry`
9. **`analytics.ts`** — `AnalyticsResponse`, `SummaryResponse`
10. **`geojson.ts`** — `RestaurantsGeoJSON`, `RestaurantFeature`

### State (`src/stores/`)
11. **`mapStore.ts`** — viewport, selectedRestaurantId, isPanelOpen, showHeatmap, dateRange, flyTo
12. **`filterStore.ts`** — searchQuery, sortBy, sortOrder, cuisineFilter
13. **`appStore.ts`** — customerId (from URL param), activeView (map/list)

### API Layer (`src/api/`)
14. **`endpoints.ts`** — axios instance with `VITE_API_URL` base, 5 fetch functions
15. **`queryClient.ts`** — QueryClient with 5min staleTime, no refetch on focus
16. **`queries.ts`** — TanStack hooks: `useRestaurants`, `useDiningHistory`, `useAnalytics`, `useSummaryCard`, `useRestaurantDetail`. Mock fallback when no API URL
17. **`mockData.ts`** — 8-10 restaurant GeoJSON features (Mumbai coords), mock detail/analytics/summary

### Hooks (`src/hooks/`)
18. **`useMediaQuery.ts`** — breakpoint boolean via `matchMedia`
19. **`useGsapAnimation.ts`** — reusable GSAP patterns (slideIn, fadeIn, stagger)

### UI Primitives (`src/components/ui/`)
20. **`Card.tsx`** — glassmorphism container
21. **`Skeleton.tsx`** — react-loading-skeleton wrapper with dark theme colors
22. **`IconButton.tsx`** — circular Lucide icon button with hover/active states

### Layout (`src/components/layout/`)
23. **`AppLayout.tsx`** — flex column, h-screen, reads `?customer=` param → sets customerId, renders TopBar + `<Outlet />`
24. **`TopBar.tsx`** — initial: logo + basic nav links. Glassmorphism bar, h-14

### Pages (`src/pages/`)
25. **`MapView.tsx`** — placeholder div
26. **`AnalyticsView.tsx`** — placeholder div

### App Shell
27. **`src/router.tsx`** — createBrowserRouter with AppLayout wrapper, lazy-loaded pages
28. **`src/App.tsx`** — QueryClientProvider + RouterProvider + Toaster
29. **`src/main.tsx`** — ensure CSS + font imports

### Env
30. **`.env.example`** — `VITE_MAPBOX_TOKEN`, `VITE_API_URL`

**Verify:** `npm run dev` renders dark page, TopBar visible, routes work, `npx tsc --noEmit` passes.

---

## ~~Phase 1: Mapbox Map with Markers (~3 files)~~ ✅ COMPLETE

**Goal:** Interactive map fills viewport below TopBar. Colored, sized markers from API/mock data. Auto-fit bounds.

31. **`src/components/map/MapCanvas.tsx`** — Core Mapbox component:
    - Init map with `dark-v11` style, navigation control
    - Add `restaurants` GeoJSON source (no clustering yet — added in Phase 4)
    - `restaurant-markers` circle layer: `circle-radius` interpolated by `visitCount` (6→28px), `circle-color` from `cuisineColor`, `circle-opacity` from `opacity` property
    - Click handler → `selectRestaurant(id)` + `flyTo`
    - Cursor pointer on hover
    - `fitBounds` on data load
    - Handle style.load race condition

32. **`src/components/map/CuisineLegend.tsx`** — floating Card in bottom-left, colored dots + cuisine names, collapsible on mobile

33. **`src/pages/MapView.tsx`** — wire MapCanvas + CuisineLegend

**Verify:** Map renders, 8-10 markers visible with varying sizes/colors, legend shows, clicking marker triggers selectRestaurant, map auto-zooms to fit.

---

## ~~Phase 2: Restaurant Detail Panel (~13 files)~~ ✅ COMPLETE

**Goal:** Click marker → sidebar (desktop) / bottom sheet (mobile) with restaurant details.

### UI Primitives
34. **`Button.tsx`** — primary/secondary/ghost variants, sm/md sizes, active:scale-[0.97] using class-variance-authority
35. **`Badge.tsx`** — cuisine pill with colored background
36. **`Stat.tsx`** — label (text-xs text-zinc-400) + value (text-lg font-semibold tabular-nums)
37. **`Divider.tsx`** — hr with optional centered label
38. **`DragHandle.tsx`** — bottom sheet pill indicator
39. **`Overlay.tsx`** — semi-transparent backdrop with fade

### Panel Content
40. **`PanelHeader.tsx`** — restaurant name, cuisine badge, address, price tier dots, close button
41. **`PersonalStats.tsx`** — 2x3 grid of Stat components (visits, spend, avg, last visit, loyalty, savings)
42. **`SpendSparkline.tsx`** — recharts AreaChart (amber line, gradient fill, no axes, 60px height)

### Panel Containers
43. **`Sidebar.tsx`** — fixed right, 400px, GSAP slide-in (x: 100% → 0), scroll overflow
44. **`BottomSheet.tsx`** — fixed bottom, touch drag with GSAP snap (peek 30vh/half 70vh/full 95vh), velocity-aware, DragHandle, swipe-dismiss
45. **`RestaurantDetailContainer.tsx`** — useMediaQuery(768) → renders Sidebar or BottomSheet, fetches detail data, skeleton loading

46. **`src/pages/MapView.tsx`** — add RestaurantDetailContainer

**Verify:** Click marker → sidebar slides in (desktop), bottom sheet appears (mobile). Shows name, stats, sparkline. X/swipe dismisses. Skeletons during load.

---

## ~~Phase 3: Date Range Scrubber (~2 files + 1 modify)~~ ✅ COMPLETE

**Goal:** Dual-handle slider at map bottom. Markers outside range fade to 10% opacity. Client-side only.

47. **`src/components/map/DateRangeScrubber.tsx`** — rc-slider Range with dark theme styles, date labels, mobile touch targets (24px handles). Converts day offsets to ISO dates via dayjs.

48. **`src/components/map/MapCanvas.tsx`** — add effect subscribing to `dateRange`: clone GeoJSON, set `opacity: 0.1` for features outside range, call `source.setData()`

49. **`src/pages/MapView.tsx`** — add DateRangeScrubber

**Verify:** Slider at map bottom, dragging fades out-of-range markers, no API calls on scrub.

---

## Phase 4: Clustering, Heatmap, Toolbar (~3 files + 1 modify)

**Goal:** Markers cluster at zoom < 13. Heatmap toggle overlay. Floating toolbar.

50. **`src/components/map/MapCanvas.tsx`** — modify:
    - Enable clustering on source (`cluster: true, clusterMaxZoom: 12, clusterRadius: 50`)
    - Add `clusters` circle layer (indigo, sized by count) + `cluster-count` symbol layer
    - Add `restaurant-markers` filter: `['!', ['has', 'point_count']]`
    - Click cluster → `getClusterExpansionZoom` → flyTo
    - Add `heatmap-source` (unclustered copy) + `dining-heatmap` layer (starts hidden)
    - Subscribe to `showHeatmap` → `setPaintProperty` opacity toggle

51. **`src/components/map/HeatmapToggle.tsx`** — IconButton (Flame/Layers icon), active glow ring
52. **`src/components/map/MapToolbar.tsx`** — floating button group (top-right desktop, bottom-right mobile)
53. **`src/pages/MapView.tsx`** — add MapToolbar

**Verify:** Zoom out → clusters appear, click cluster → zooms in. Heatmap toggle works with smooth fade. Toolbar positioned correctly per breakpoint.

---

## Phase 5: Analytics Dashboard (~8 files)

**Goal:** `/analytics` shows summary hero card + 5 chart types in responsive grid with GSAP stagger animation.

54. **`SummaryCard.tsx`** — gradient border trick, Stat grid (visits, spend, restaurants, avg, top restaurant/cuisine), ref for PNG export
55. **`ShareButton.tsx`** — html-to-image `toPng` → download + toast
56. **`CuisineSpendChart.tsx`** — recharts PieChart, custom active sector, cuisine colors
57. **`NeighborhoodSpendChart.tsx`** — horizontal BarChart, indigo bars
58. **`DayOfWeekChart.tsx`** — 7-bar BarChart (Mon-Sun)
59. **`TimeOfDayChart.tsx`** — BarChart with time slot buckets
60. **`MonthlySpendChart.tsx`** — AreaChart with gradient fill, indigo line

All charts: dark custom tooltip, ResponsiveContainer, Card wrapper, GSAP fade-in.

61. **`src/pages/AnalyticsView.tsx`** — hero SummaryCard + ShareButton, responsive grid (1/2/3 cols), GSAP staggered entry

**Verify:** Navigate to /analytics, summary card with gradient border, 5 charts animate in, share button exports PNG, responsive grid.

---

## Phase 6: Search, List View, Polish (~11 files)

**Goal:** Search with autocomplete + fly-to, restaurant list view, finalized TopBar, page transitions.

### Nav Components
62. **`SearchBar.tsx`** — desktop: inline input in TopBar. Mobile: icon → full-width overlay. Autocomplete from cached restaurant list, select → flyTo + open detail
63. **`ViewToggle.tsx`** — segmented control (Map/List), updates appStore.activeView
64. **`NavLinks.tsx`** — Map + Analytics links, active state

### List Components
65. **`RestaurantListItem.tsx`** — row with cuisine dot, name, visits, spend, last visit. Click → flyTo
66. **`RestaurantList.tsx`** — sort controls (Chip components), filters from filterStore, sorted list

### UI Components
67. **`Chip.tsx`** — selectable filter pill (active: indigo, inactive: zinc)
68. **`EmptyState.tsx`** — centered icon + message for no results
69. **`Tooltip.tsx`** — CSS-positioned, 200ms delay, dark

### Integration
70. **`TopBar.tsx`** — integrate SearchBar, ViewToggle, NavLinks
71. **`MapView.tsx`** — conditional map/list rendering based on activeView
72. **`AppLayout.tsx`** — GSAP page transition on route change

### Polish
- Focus rings: `focus-visible:ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900`
- Active states: `active:scale-[0.97]` on all buttons
- Error boundaries around major sections
- rc-slider CSS dark theme overrides

**Verify:** Search autocomplete works, list view sortable, view toggle works, page transitions smooth, mobile responsive, no console errors.

---

## Mock Data Removal (when backend ready)
1. Set `VITE_API_URL` in `.env`
2. Remove mock conditional in `queries.ts`
3. Delete `mockData.ts`
4. Test each endpoint

## Total Files: ~72 (create ~65, modify ~7)
