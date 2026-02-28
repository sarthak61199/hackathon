# Dining History & Discovery App — Implementation Plan

## Context
Building a fullstack hackathon app that visualizes a user's dining history on an interactive map. Users see their restaurant visits as custom markers, click to view details, explore analytics, and discover new restaurants. No auth — customer ID is fed directly.

**Stack:** React + TypeScript (frontend), Laravel (backend), Mapbox GL JS, Zustand, TanStack Query, react-router

---

## Functional Requirements

### Map & Visual Experience
- **F-MAP-01** Interactive Mapbox GL map, centered on user's dining footprint on load
- **F-MAP-02** Markers sized by visit frequency (1 visit = 6px, 30+ = 28px), pulsing glow on 5+ visits
- **F-MAP-03** Markers colored by cuisine type (fixed palette with legend overlay)
- **F-MAP-04** Cluster markers at zoom < 13, click cluster to expand
- **F-MAP-05** Heatmap overlay toggle (weighted by visit frequency)
- **F-MAP-06** Click marker → desktop: right sidebar (400px) slides in; mobile: bottom sheet with snap points (30/70/95vh) — restaurant details + personal stats + spend sparkline
- **F-MAP-07** Date range scrubber — dual-handle slider, markers outside range fade to 10% opacity
- **F-MAP-08** Fly-to animation on search/select

### Analytics & Insights
- **F-ANA-01** Spend by cuisine donut chart
- **F-ANA-02** Spend by neighborhood bar chart
- **F-ANA-03** Visit day-of-week distribution
- **F-ANA-04** Visit time-of-day histogram (Lunch/Dinner/Late Night)
- **F-ANA-05** Monthly average spend trend line chart
- **F-ANA-06** Loyalty score per restaurant (frequency + recency + spend)
- **F-ANA-07** "Your Dining Year" summary card (top restaurant, top cuisine, total spend, new vs revisit ratio)

### Social & Search
- **F-SOC-01** Shareable dining card — export summary as PNG (html-to-image)
- **F-NAV-01** Search bar with autocomplete, flies to marker on select
- **F-NAV-02** Restaurant list view (sortable by visits, spend, last visit, loyalty)

## Non-Functional Requirements
- Initial map load < 2s on 4G, API responses < 500ms
- Fully responsive — mobile-first interactions, desktop enhanced
- Support 500 restaurants / 5000 payment records without jank
- TanStack Query caching: 5min staleTime, no refetch on window focus
- Skeleton loaders + error boundaries per section
- Dynamic imports for analytics page and chart library

---

## UI Guidelines & Design System

### Design Tokens (Tailwind Config)

```
Colors:
  primary:    indigo-600 (#4f46e5) — buttons, active states, links
  surface:    zinc-900 (#18181b) — panels, cards, sidebars
  surface-alt: zinc-800 (#27272a) — elevated cards, hover states
  border:     zinc-700 (#3f3f46) — subtle dividers
  text:       zinc-50 (#fafafa) — primary text
  text-muted: zinc-400 (#a1a1aa) — secondary text, labels
  accent:     amber-400 (#fbbf24) — highlights, badges, sparkline

Spacing scale: 4px base (Tailwind default)
Border radius: rounded-lg (8px) for cards, rounded-full for badges/pills
```

### Typography
- Font: `Inter` (variable weight) via Google Fonts — clean, legible at all sizes
- Headings: `font-semibold`, tracking-tight
- Body: `font-normal`, text-sm (14px) as base, text-xs (12px) for captions/labels
- Numbers/stats: `font-mono` or `tabular-nums` for alignment in tables and stat cards

### Dark Theme
- The entire app uses a dark theme to complement the Mapbox dark-v11 style
- No light mode toggle — single cohesive dark aesthetic
- Glassmorphism on floating elements: `bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50`

### Responsive Breakpoints
```
sm:  640px   — phone landscape
md:  768px   — tablet portrait (key breakpoint: layout shifts here)
lg:  1024px  — tablet landscape / small desktop
xl:  1280px  — desktop (primary design target)
```

### Responsive Behavior
| Element | Desktop (≥768px) | Mobile (<768px) |
|---------|-----------------|-----------------|
| Restaurant detail | Right sidebar (400px), slides in from right | Bottom sheet, draggable, snap points (30%, 70%, 95%) |
| TopBar | Full width, search + nav inline | Compact, search collapses to icon, hamburger for nav |
| Map toolbar | Floating top-right vertical stack | Floating bottom-right horizontal row, above bottom sheet |
| Date scrubber | Horizontal bar at map bottom | Full-width, larger touch targets (44px handles) |
| Analytics grid | 2-3 column grid | Single column stack |
| Restaurant list | Side-by-side with map (split view) | Full screen overlay |
| Charts | Standard size with hover tooltips | Larger touch targets, tap instead of hover |

### Animation Guidelines (GSAP)
Every animation must serve a purpose — guide attention, provide spatial context, or confirm an action. No decorative animations.

| Animation | Trigger | Implementation | Duration |
|-----------|---------|----------------|----------|
| Sidebar slide-in | Marker click (desktop) | `gsap.fromTo(panel, {x: '100%'}, {x: 0, ease: 'power3.out'})` | 400ms |
| Bottom sheet snap | Marker click (mobile) | GSAP Draggable with snap points, spring physics via `inertia` plugin | 300ms |
| Bottom sheet drag | User swipe | GSAP Draggable with `type: 'y'`, bounded, snap to closest point | follows finger |
| Marker pulse | Page load, high-frequency markers | CSS `@keyframes pulse` with `box-shadow` — no JS needed | 2s loop |
| Map fly-to | Search select, list item click | Mapbox native `flyTo({duration: 1500, essential: true})` | 1500ms |
| Chart entry | Analytics page mount | `gsap.from(bars, {scaleY: 0, stagger: 0.05, ease: 'back.out'})` | 600ms |
| Page transition | Route change | `gsap.fromTo(page, {opacity: 0, y: 20}, {opacity: 1, y: 0})` | 300ms |
| Panel content | Data loads after skeleton | `gsap.from(elements, {opacity: 0, y: 10, stagger: 0.08})` | 400ms |
| Heatmap toggle | Toolbar button | Mapbox `setPaintProperty` opacity transition (CSS transition built-in) | 300ms |
| Date scrubber filter | Handle drag end | Markers: `gsap.to(marker, {opacity: targetOpacity, duration: 0.3})` | 300ms |

### Skeleton Loading
- Every async content area shows a skeleton before data arrives
- Skeletons match the exact layout of loaded content (same widths, heights, spacing)
- Use `animate-pulse` on `bg-zinc-700/50` rounded blocks
- Skeleton → content transition: subtle `gsap.from({opacity: 0})` fade, 200ms

### Interaction Polish
- **Touch targets**: minimum 44x44px on mobile for all interactive elements
- **Hover states**: `transition-colors duration-150` on all clickable elements, subtle `bg-zinc-700/50` hover
- **Focus rings**: `ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900` for keyboard navigation
- **Active states**: scale(0.97) press feedback on buttons via `active:scale-[0.97] transition-transform`
- **Scrollbars**: custom thin scrollbar via Tailwind plugin or CSS (`scrollbar-thin scrollbar-thumb-zinc-600`)
- **Tooltips**: on icon buttons, 200ms delay, `bg-zinc-800 text-xs` with arrow

### Bottom Sheet (Mobile Restaurant Detail)
The restaurant detail panel is a **sidebar on desktop** and a **bottom sheet on mobile**. Implementation approach:

- Use a `useMediaQuery(768)` hook to determine which component to render
- **Desktop**: `<Sidebar>` — fixed right, 400px wide, GSAP slide-in from right
- **Mobile**: `<BottomSheet>` — fixed bottom, full width, GSAP Draggable
  - Three snap points: **peek** (30vh — name + cuisine + quick stats), **half** (70vh — full stats + sparkline), **full** (95vh — everything scrollable)
  - Drag handle pill at top: `w-10 h-1 rounded-full bg-zinc-500 mx-auto`
  - Swipe down past peek → dismiss
  - Background map dims to 50% opacity when sheet is at half/full
  - Velocity-aware snapping: fast swipe skips intermediate snap point
- Wrapper: `<RestaurantDetailContainer>` renders either `<Sidebar>` or `<BottomSheet>` based on screen size

---

## Frontend Routes

```
/           → MapView (default, map + side panel + scrubber)
/analytics  → AnalyticsView (charts dashboard)
```

Customer ID read from URL query param: `?customer=123`

---

## Zustand Stores

### `useMapStore` — map viewport & interaction (`stores/mapStore.ts`)

```typescript
interface DateRange {
  start: string; // ISO date "2025-01-01"
  end: string;   // ISO date "2025-12-31"
}

interface MapState {
  // Viewport
  center: [number, number];           // [lng, lat]
  zoom: number;

  // Interaction
  selectedRestaurantId: number | null;
  isPanelOpen: boolean;

  // Layer toggles
  showHeatmap: boolean;

  // Date filter
  dateRange: DateRange;
}

interface MapActions {
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  selectRestaurant: (id: number | null) => void;  // sets isPanelOpen accordingly
  closePanel: () => void;                          // sets selectedRestaurantId=null, isPanelOpen=false
  toggleHeatmap: () => void;
  setDateRange: (range: DateRange) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void; // sets center + zoom (default 15)
}

type MapStore = MapState & MapActions;
```

### `useFilterStore` — list/search filtering (`stores/filterStore.ts`)

```typescript
type SortField = 'visits' | 'totalSpent' | 'lastVisit' | 'loyaltyScore' | 'name';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  searchQuery: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  cuisineFilter: string | null;       // categories.name or null for all
}

interface FilterActions {
  setSearchQuery: (query: string) => void;
  setSortBy: (field: SortField) => void;
  toggleSortOrder: () => void;
  setCuisineFilter: (cuisine: string | null) => void;
  resetFilters: () => void;
}

type FilterStore = FilterState & FilterActions;
```

### `useAppStore` — global app state (`stores/appStore.ts`)

```typescript
type ActiveView = 'map' | 'list';

interface AppState {
  customerId: number | null;
  activeView: ActiveView;
}

interface AppActions {
  setCustomerId: (id: number) => void;
  setActiveView: (view: ActiveView) => void;
}

type AppStore = AppState & AppActions;
```

---

## TanStack Query Hooks

```typescript
useRestaurants(customerId)             // GET /api/customers/{id}/restaurants → GeoJSON
useDiningHistory(customerId)           // GET /api/customers/{id}/history
useAnalytics(customerId)               // GET /api/customers/{id}/analytics
useSummaryCard(customerId)             // GET /api/customers/{id}/summary
useRestaurantDetail(restaurantId, customerId)  // GET /api/restaurants/{id}/detail?customer_id=
```

Query keys: `['restaurants', customerId]`, `['history', customerId]`, etc.
Data flows: API → TanStack cache → Components. UI state in Zustand. No duplication.

---

## Frontend Component Tree

```
<App>
  <QueryClientProvider>
    <RouterProvider>
      <AppLayout>
        <TopBar>
          <Logo />
          <SearchBar />
          <ViewToggle />
          <NavLinks />
        </TopBar>
        <main>
          {/* Route: / */}
          <MapView>
            <MapCanvas />
            <MapToolbar>
              <HeatmapToggle />
              <CuisineLegend />
            </MapToolbar>
            <DateRangeScrubber />
            <RestaurantDetailContainer>   // renders Sidebar or BottomSheet
              <Sidebar />                 // desktop ≥768px
              <BottomSheet />             // mobile <768px
                <PanelHeader />
                <PersonalStats />
                <SpendSparkline />
            </RestaurantDetailContainer>
            <RestaurantList />
              <RestaurantListItem />
          </MapView>

          {/* Route: /analytics */}
          <AnalyticsView>
            <SummaryCard />
            <ShareButton />
            <CuisineSpendChart />
            <NeighborhoodSpendChart />
            <DayOfWeekChart />
            <TimeOfDayChart />
            <MonthlySpendChart />
          </AnalyticsView>
        </main>
      </AppLayout>
    </RouterProvider>
  </QueryClientProvider>
</App>
```

---

## UI Component Inventory

### Base / Shared UI Components (`components/ui/`)

These are reusable, stateless building blocks used across the app.

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `ui/Button.tsx` | Variants: `primary`, `secondary`, `ghost`, `icon`. Sizes: `sm`, `md`. Includes active scale press effect. |
| `IconButton` | `ui/IconButton.tsx` | Circular button wrapping a Lucide icon. Tooltip on hover (200ms delay). Used in toolbar, panel close, etc. |
| `Badge` | `ui/Badge.tsx` | Pill-shaped label for cuisine type, price tier, loyalty tier. Colored background from cuisine palette. |
| `Card` | `ui/Card.tsx` | `bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-lg`. Base for all floating panels and analytics cards. |
| `Skeleton` | `ui/Skeleton.tsx` | Wrapper around `react-loading-skeleton` with dark theme config (`baseColor: zinc-800`, `highlightColor: zinc-700`). |
| `Tooltip` | `ui/Tooltip.tsx` | Lightweight tooltip. Positioned above/below via CSS. `bg-zinc-800 text-xs rounded px-2 py-1`. |
| `Divider` | `ui/Divider.tsx` | Horizontal rule: `border-zinc-700/50`. Optional label text centered. |
| `Stat` | `ui/Stat.tsx` | Label + value pair. Label in `text-xs text-zinc-400`, value in `text-lg font-semibold font-mono`. Used in PersonalStats and SummaryCard. |
| `Chip` | `ui/Chip.tsx` | Selectable filter chip for cuisine/sort filters. Active state: `bg-indigo-600`, inactive: `bg-zinc-800 border border-zinc-700`. |
| `EmptyState` | `ui/EmptyState.tsx` | Centered icon + message for no-results. Used in search and list views. |
| `Overlay` | `ui/Overlay.tsx` | Semi-transparent backdrop (`bg-black/50`) with fade animation. Used behind bottom sheet and modals. |
| `DragHandle` | `ui/DragHandle.tsx` | Bottom sheet drag indicator pill: `w-10 h-1 rounded-full bg-zinc-500 mx-auto mt-2`. |

### Layout Components (`components/layout/`)

| Component | File | Description |
|-----------|------|-------------|
| `AppLayout` | `layout/AppLayout.tsx` | Root layout: `flex flex-col h-screen bg-zinc-950`. Renders TopBar + `<Outlet />`. |
| `TopBar` | `layout/TopBar.tsx` | Fixed top. Desktop: logo + search + view toggle + analytics link inline. Mobile: logo + search icon + hamburger menu. `bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800`. Height: 56px desktop, 48px mobile. |

### Map Components (`components/map/`)

| Component | File | Description |
|-----------|------|-------------|
| `MapCanvas` | `map/MapCanvas.tsx` | Initializes Mapbox GL, manages sources/layers, handles marker/cluster clicks, responds to store changes. Full viewport minus TopBar. |
| `MapToolbar` | `map/MapToolbar.tsx` | Floating button group. Desktop: top-right vertical. Mobile: bottom-right horizontal (above bottom sheet). Uses `IconButton` components. |
| `HeatmapToggle` | `map/HeatmapToggle.tsx` | `IconButton` toggling heatmap layer visibility. Active state glow when on. |
| `CuisineLegend` | `map/CuisineLegend.tsx` | Floating `Card` in bottom-left. Lists cuisine → color mappings. Collapsible on mobile (just a colored dot strip). |
| `DateRangeScrubber` | `map/DateRangeScrubber.tsx` | `rc-slider` Range with custom styled handles. Desktop: fixed bottom bar. Mobile: full-width, 44px touch handles. Displays formatted date labels. |

### Restaurant Detail Components (`components/panel/`)

| Component | File | Description |
|-----------|------|-------------|
| `RestaurantDetailContainer` | `panel/RestaurantDetailContainer.tsx` | Uses `useMediaQuery(768)` to render `<Sidebar>` or `<BottomSheet>`. Passes restaurant data down. |
| `Sidebar` | `panel/Sidebar.tsx` | Desktop only. Fixed right, 400px wide. GSAP slide-in from right (`x: 100% → 0`). Close button top-right. Scrollable content area. |
| `BottomSheet` | `panel/BottomSheet.tsx` | Mobile only. GSAP Draggable with `type: 'y'`. Three snap points: peek (30vh), half (70vh), full (95vh). `DragHandle` at top. Swipe-down to dismiss. Velocity-aware snapping. |
| `PanelHeader` | `panel/PanelHeader.tsx` | Restaurant name (text-xl font-semibold), cuisine `Badge`, rating stars, price tier dots. Optional photo as blurred background header. |
| `PersonalStats` | `panel/PersonalStats.tsx` | Grid of `Stat` components: visit count, total spent (Intl formatted), avg spend, last visit (dayjs relative), loyalty score with colored tier badge. |
| `SpendSparkline` | `panel/SpendSparkline.tsx` | Tiny `recharts` `AreaChart` (120x40px) showing spend over time. Single amber line, subtle fill gradient. No axes, just the curve. |

### List Components (`components/list/`)

| Component | File | Description |
|-----------|------|-------------|
| `RestaurantList` | `list/RestaurantList.tsx` | Virtualized scrollable list (or simple list if <100 items). Sort/filter controls at top using `Chip` components. Desktop: beside map in split view. Mobile: full-screen overlay. |
| `RestaurantListItem` | `list/RestaurantListItem.tsx` | Row: cuisine color dot + name + visit count + total spent + last visit. Hover: `bg-zinc-800/50`. Click: flies to marker + opens detail. |

### Analytics Components (`components/analytics/`)

| Component | File | Description |
|-----------|------|-------------|
| `AnalyticsView` | `analytics/AnalyticsView.tsx` | Page layout: SummaryCard hero at top, chart grid below. Desktop: 2-3 col grid. Mobile: single column. GSAP staggered entry animation. |
| `SummaryCard` | `analytics/SummaryCard.tsx` | Hero card with key metrics. Gradient border (`bg-gradient-to-r from-indigo-500 to-amber-500` as border trick). Contains `Stat` grid + share button. Has a ref div for `html-to-image` capture. |
| `ShareButton` | `analytics/ShareButton.tsx` | `IconButton` that captures SummaryCard as PNG via `html-to-image`. Shows toast on success. |
| `CuisineSpendChart` | `analytics/CuisineSpendChart.tsx` | `recharts` `PieChart` with custom active sector. Colors from cuisine palette. Legend below. |
| `NeighborhoodSpendChart` | `analytics/NeighborhoodSpendChart.tsx` | `recharts` horizontal `BarChart`. Bars colored with indigo gradient. |
| `DayOfWeekChart` | `analytics/DayOfWeekChart.tsx` | 7-cell grid heatmap or vertical `BarChart`. Shows which days user dines most. |
| `TimeOfDayChart` | `analytics/TimeOfDayChart.tsx` | `BarChart` with 3-4 buckets (Lunch/Dinner/Late Night). |
| `MonthlySpendChart` | `analytics/MonthlySpendChart.tsx` | `recharts` `AreaChart` with gradient fill. Shows monthly spend trend line. |

### Nav Components (`components/nav/`)

| Component | File | Description |
|-----------|------|-------------|
| `SearchBar` | `nav/SearchBar.tsx` | Desktop: always visible input in TopBar. Mobile: icon that expands to full-width overlay input. Autocomplete dropdown filters from cached restaurant list. Select → flyTo + open detail. |
| `ViewToggle` | `nav/ViewToggle.tsx` | Segmented control: Map | List. `bg-zinc-800 rounded-lg` container, active segment: `bg-indigo-600`. |
| `NavLinks` | `nav/NavLinks.tsx` | Desktop: inline text links. Mobile: inside hamburger menu drawer. |

### Hooks (`hooks/`)

| Hook | File | Description |
|------|------|-------------|
| `useMediaQuery` | `hooks/useMediaQuery.ts` | Returns boolean for breakpoint match. Used by `RestaurantDetailContainer` to switch sidebar/bottom-sheet. |
| `useGsapAnimation` | `hooks/useGsapAnimation.ts` | Reusable hook wrapping common GSAP patterns (fade-in, slide-in, stagger). Handles cleanup on unmount. |

---

## Mapbox Integration

- **Dark theme**: `mapbox://styles/mapbox/dark-v11`
- **2 Sources**: `visited-restaurants` (clustered GeoJSON), `heatmap-source` (unclustered copy)
- **4 Layers**: clusters, cluster-count, restaurant-markers (circle, sized by visitCount, colored by cuisineColor), dining-heatmap (toggle)
- **Date range filtering**: recompute opacity per feature client-side from cached history data, call `source.setData()` — no API refetch needed
- **Interactions**: click marker → `selectRestaurant(id)`, click cluster → zoom expand, hover → pointer cursor

---

## Backend API Endpoints

All prefixed `/api`. No auth middleware.

### Schema → API Field Mapping

Key tables and how they feed into the API:

| DB Table | Joins Via | Provides |
|----------|-----------|----------|
| `restaurants` | `restaurants.id` | name, address, latitude, longitude, cost_for_two, logo, category_id, chain_id, group_id |
| `bookings` | `bookings.restaurant_id`, `bookings.customer_id` | date, time, pax, bill_amount, state, state_status, deal |
| `eazypay_transactions` | `eazypay_transactions.booking_id`, `eazypay_transactions.customer_id` | total_amount, paid_amount, wallet_amount, deal_discount_amount, tip_amount, status |
| `categories` | `restaurants.category_id = categories.id` | cuisine name (categories.name), icon |
| `chains` | `restaurants.chain_id = chains.id` | chain name |
| `locations_data` | `restaurants.group_id = locations_data.group_id` | area_name, subarea_name, region_name, city_name (neighborhood hierarchy) |
| `customers` | `customers.id` | name, email, mobile, city_id |

**Filtering logic:**
- A "completed visit" = booking WHERE `state = 'complete'` OR `state_status IN ('materialized', 'complete', 'checked in')`
- A "completed payment" = eazypay_transaction WHERE `status = 'complete'`
- "Spend" = `eazypay_transactions.paid_amount` (what customer actually paid) or `bookings.bill_amount` as fallback
- "Neighborhood" = `locations_data.area_name` (joined via `restaurants.group_id = locations_data.group_id`)
- "Cuisine" = `categories.name` (joined via `restaurants.category_id = categories.id`)
- "Price tier" = derived from `restaurants.cost_for_two`: tier 1 (≤500), tier 2 (501-1000), tier 3 (1001-2000), tier 4 (2001+)

---

### Endpoint 1: GET `/api/customers/{customerId}/restaurants`

Returns all restaurants the customer has visited as GeoJSON (directly consumable by Mapbox).

**Request:**
```
GET /api/customers/123/restaurants
```
No query params.

**Query logic:**
```sql
SELECT r.id, r.name, r.address, r.latitude, r.longitude, r.cost_for_two, r.logo,
       c.name as cuisine, c.icon as cuisine_icon,
       ch.name as chain_name,
       ld.area_name as neighborhood, ld.city_name,
       COUNT(b.id) as visit_count,
       SUM(COALESCE(et.paid_amount, b.bill_amount, 0)) as total_spent,
       AVG(COALESCE(et.paid_amount, b.bill_amount, 0)) as avg_spent,
       MAX(b.date) as last_visit,
       MIN(b.date) as first_visit
FROM restaurants r
JOIN bookings b ON b.restaurant_id = r.id AND b.customer_id = {customerId}
  AND (b.state = 'complete' OR b.state_status IN ('materialized', 'complete', 'checked in'))
LEFT JOIN eazypay_transactions et ON et.booking_id = b.id AND et.status = 'complete'
JOIN categories c ON r.category_id = c.id
LEFT JOIN chains ch ON r.chain_id = ch.id
LEFT JOIN locations_data ld ON r.group_id = ld.group_id
GROUP BY r.id
```

**Response:**
```typescript
// TypeScript type for frontend
interface RestaurantsGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude] from restaurants.longitude/latitude
    };
    properties: {
      id: number;                  // restaurants.id
      name: string;                // restaurants.name
      address: string;             // restaurants.address
      cuisine: string;             // categories.name
      cuisineIcon: string | null;  // categories.icon
      cuisineColor: string;        // mapped from cuisine name via fixed palette
      chainName: string | null;    // chains.name
      neighborhood: string | null; // locations_data.area_name
      cityName: string;            // locations_data.city_name
      costForTwo: number;          // restaurants.cost_for_two
      priceTier: number;           // 1-4, derived from cost_for_two
      logo: string | null;         // restaurants.logo
      visitCount: number;          // COUNT(bookings)
      totalSpent: number;          // SUM(paid_amount or bill_amount)
      avgSpent: number;            // AVG(paid_amount or bill_amount)
      lastVisit: string;           // MAX(bookings.date), ISO date
      firstVisit: string;          // MIN(bookings.date), ISO date
      loyaltyScore: number;        // computed: f(visitCount, recency, totalSpent)
      opacity: number;             // always 1.0 from API, modified client-side by date filter
    };
  }>;
  meta: {
    totalRestaurants: number;
    dateRange: {
      earliest: string;            // earliest booking date for this customer
      latest: string;              // latest booking date
    };
    cuisineColorMap: Record<string, string>; // cuisine name → hex color
  };
}
```

---

### Endpoint 2: GET `/api/customers/{customerId}/history`

Returns individual visit/payment records for timeline and date filtering.

**Request:**
```
GET /api/customers/123/history?from=2025-01-01&to=2025-12-31&restaurant_id=45
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | ISO date | No | Filter visits from this date |
| `to` | ISO date | No | Filter visits up to this date |
| `restaurant_id` | int | No | Filter to specific restaurant |

**Query logic:**
```sql
SELECT b.id, b.restaurant_id, r.name as restaurant_name, c.name as cuisine,
       b.date, b.time, b.pax, b.children, b.deal,
       b.bill_amount,
       et.total_amount as transaction_total,
       et.paid_amount, et.wallet_amount, et.deal_discount_amount,
       et.tip_amount, et.coupon_amount
FROM bookings b
JOIN restaurants r ON b.restaurant_id = r.id
JOIN categories c ON r.category_id = c.id
LEFT JOIN eazypay_transactions et ON et.booking_id = b.id AND et.status = 'complete'
WHERE b.customer_id = {customerId}
  AND (b.state = 'complete' OR b.state_status IN ('materialized', 'complete', 'checked in'))
  [AND b.date >= {from}]
  [AND b.date <= {to}]
  [AND b.restaurant_id = {restaurant_id}]
ORDER BY b.date DESC, b.time DESC
```

**Response:**
```typescript
interface HistoryResponse {
  data: Array<{
    id: number;                      // bookings.id
    restaurantId: number;            // bookings.restaurant_id
    restaurantName: string;          // restaurants.name
    cuisine: string;                 // categories.name
    date: string;                    // bookings.date (ISO)
    time: string;                    // bookings.time (HH:mm)
    pax: number;                     // bookings.pax
    children: number;                // bookings.children
    deal: string;                    // bookings.deal
    billAmount: number | null;       // bookings.bill_amount
    paidAmount: number | null;       // eazypay_transactions.paid_amount
    walletAmount: number | null;     // eazypay_transactions.wallet_amount
    dealDiscount: number | null;     // eazypay_transactions.deal_discount_amount
    tipAmount: number | null;        // eazypay_transactions.tip_amount
    couponAmount: number | null;     // eazypay_transactions.coupon_amount
  }>;
  meta: {
    total: number;
    totalSpent: number;              // SUM of paid_amount across all results
  };
}
```

---

### Endpoint 3: GET `/api/customers/{customerId}/analytics`

Pre-aggregated analytics for the charts dashboard.

**Request:**
```
GET /api/customers/123/analytics
```
No query params.

**Response:**
```typescript
interface AnalyticsResponse {
  spendByCuisine: Array<{
    cuisine: string;          // categories.name
    cuisineColor: string;     // mapped from palette
    total: number;            // SUM(paid_amount) grouped by category
    visits: number;           // COUNT(bookings) grouped by category
    percentage: number;       // percentage of total spend
  }>;

  spendByNeighborhood: Array<{
    neighborhood: string;     // locations_data.area_name
    total: number;            // SUM(paid_amount) grouped by area_name
    visits: number;           // COUNT(bookings) grouped by area_name
  }>;

  visitsByDayOfWeek: Array<{
    day: string;              // "Monday" through "Sunday", derived from DAYOFWEEK(bookings.date)
    dayIndex: number;         // 0-6 (Mon-Sun)
    count: number;            // COUNT(bookings) grouped by day of week
  }>;

  visitsByTimeSlot: Array<{
    slot: string;             // "Breakfast", "Lunch", "Evening", "Dinner", "Late Night"
    count: number;            // COUNT(bookings) bucketed by bookings.time
    // Buckets: Breakfast (6-11), Lunch (11-15), Evening (15-19), Dinner (19-22), Late Night (22-6)
  }>;

  monthlySpendTrend: Array<{
    month: string;            // "2025-01" format, from DATE_FORMAT(bookings.date, '%Y-%m')
    totalSpend: number;       // SUM(paid_amount) for that month
    avgSpend: number;         // AVG(paid_amount) for that month
    visits: number;           // COUNT(bookings) for that month
  }>;
}
```

---

### Endpoint 4: GET `/api/customers/{customerId}/summary`

"Your Dining Year" summary card data.

**Request:**
```
GET /api/customers/123/summary
```
No query params.

**Response:**
```typescript
interface SummaryResponse {
  customerName: string;                // customers.name
  totalVisits: number;                 // COUNT(bookings) where state=complete
  totalSpent: number;                  // SUM(paid_amount)
  uniqueRestaurants: number;           // COUNT(DISTINCT restaurant_id)
  avgSpendPerVisit: number;            // totalSpent / totalVisits

  topRestaurant: {
    id: number;                        // restaurants.id
    name: string;                      // restaurants.name
    visits: number;                    // COUNT for this restaurant
    totalSpent: number;                // SUM for this restaurant
  };

  topCuisine: {
    name: string;                      // categories.name
    visits: number;
    totalSpent: number;
  };

  topNeighborhood: {
    name: string;                      // locations_data.area_name
    visits: number;
    totalSpent: number;
  };

  newVsRevisit: {
    newRestaurants: number;            // restaurants visited only once
    revisitCount: number;              // total visits to restaurants visited more than once
  };

  avgPax: number;                      // AVG(bookings.pax)
  totalSavings: number;                // SUM(deal_discount_amount + coupon_amount + wallet_amount)
}
```

---

### Endpoint 5: GET `/api/restaurants/{restaurantId}/detail`

Full restaurant info + customer-specific visit history for the detail panel.

**Request:**
```
GET /api/restaurants/45/detail?customer_id=123
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_id` | int | Yes | Customer whose history to include |

**Response:**
```typescript
interface RestaurantDetailResponse {
  id: number;                          // restaurants.id
  name: string;                        // restaurants.name
  cuisine: string;                     // categories.name
  cuisineIcon: string | null;          // categories.icon
  chainName: string | null;            // chains.name
  address: string;                     // restaurants.address
  neighborhood: string | null;         // locations_data.area_name
  area: string | null;                 // locations_data.subarea_name
  cityName: string;                    // locations_data.city_name
  costForTwo: number;                  // restaurants.cost_for_two
  priceTier: number;                   // 1-4 derived
  logo: string | null;                 // restaurants.logo
  coordinates: [number, number];       // [longitude, latitude]

  customerStats: {
    visitCount: number;                // COUNT(bookings)
    totalSpent: number;                // SUM(paid_amount)
    avgSpent: number;                  // AVG(paid_amount)
    lastVisit: string;                 // MAX(bookings.date)
    firstVisit: string;                // MIN(bookings.date)
    loyaltyScore: number;              // computed
    avgPax: number;                    // AVG(bookings.pax)
    totalSavings: number;              // SUM(deal_discount + coupon + wallet)
    favouriteDeal: string | null;      // most frequently used bookings.deal

    spendTimeline: Array<{
      date: string;                    // bookings.date
      amount: number;                  // paid_amount or bill_amount
      pax: number;                     // bookings.pax
    }>;
  };
}
```

---

### Laravel Structure

**Controllers:**
- `CustomerRestaurantController` — Endpoints 1, 2
- `CustomerAnalyticsController` — Endpoints 3, 4
- `RestaurantController` — Endpoint 5

**Services:**
- `GeoJsonService` — transforms Eloquent results into GeoJSON FeatureCollections with computed properties (cuisineColor, loyaltyScore, priceTier)
- `AnalyticsService` — aggregation queries for spend breakdowns, time distributions, monthly trends
- `LoyaltyScoreService` — computes loyalty score: `score = (visitCount * 3) + (recencyBonus) + (spendNormalized)` where recency = days since last visit mapped to 0-30 points

**Models:**
- `Customer` — hasMany bookings, hasMany eazypayTransactions
- `Restaurant` — belongsTo category, belongsTo chain, hasOne locationData (via group_id)
- `Booking` — belongsTo customer, belongsTo restaurant, hasOne eazypayTransaction
- `EazypayTransaction` — belongsTo customer, belongsTo booking, belongsTo restaurant
- `Category` — hasMany restaurants (this is the cuisine)
- `Chain` — hasMany restaurants
- `LocationData` — accessed via restaurants.group_id

**Routes (`routes/api.php`):**
```php
Route::prefix('customers/{customerId}')->group(function () {
    Route::get('restaurants', [CustomerRestaurantController::class, 'index']);
    Route::get('history', [CustomerRestaurantController::class, 'history']);
    Route::get('analytics', [CustomerAnalyticsController::class, 'analytics']);
    Route::get('summary', [CustomerAnalyticsController::class, 'summary']);
});

Route::get('restaurants/{restaurantId}/detail', [RestaurantController::class, 'detail']);
```

---

## Key Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| Charts | `recharts` | React-native composable charts, covers donut/bar/line/histogram |
| Range slider | `rc-slider` | Lightweight, supports dual-handle for date range scrubber |
| Image export | `html-to-image` | Export summary card as PNG for sharing |
| Date utils | `dayjs` | Lightweight (2KB), chainable API, plugin-based extensions |
| Map | `mapbox-gl` + `@types/mapbox-gl` | Direct GL JS for full control over sources/layers |
| State management | `zustand` | Minimal boilerplate store for UI state |
| Data fetching | `@tanstack/react-query` | Server state caching, auto-refetch, query keys |
| Routing | `react-router` | Client-side routing between map and analytics views |
| HTTP client | `axios` | Cleaner API calls with interceptors and base URL config |
| Styling | `tailwindcss` + `@tailwindcss/vite` | Utility-first CSS — fast styling for hackathon pace |
| Class merging | `clsx` + `tailwind-merge` | `clsx` for conditional class logic, `tailwind-merge` to resolve conflicting Tailwind classes. Combined into a `cn()` utility used across all components |
| Icons | `lucide-react` | Clean, consistent icon set (search, toggle, close, share, etc.) |
| Animations | `gsap` + `@gsap/react` | Performant timeline-based animations, Draggable plugin for bottom sheet. `@gsap/react` provides `useGSAP` hook for proper React lifecycle integration and auto-cleanup |
| Toast notifications | `react-hot-toast` | Lightweight toasts for error/success feedback |
| Skeleton loaders | `react-loading-skeleton` | Placeholder loaders while API data loads |
| Number/currency | `Intl.NumberFormat` (built-in) | No package needed — native browser API for ₹45,000 / 1.2K formatting |
| Font | `@fontsource-variable/inter` | Self-hosted Inter variable font, no Google Fonts request |

---

## Build Order (Hackathon-optimized, demoable increments)

| Phase | Backend | Frontend | Result |
|-------|---------|----------|--------|
| 1 | Scaffold Laravel, models, Endpoint 1 (restaurants GeoJSON) | Scaffold React, install deps, Mapbox + markers from API | Map with colored, sized markers |
| 2 | Endpoint 6 (restaurant detail) | RestaurantPanel with click interaction | Click marker → see details |
| 3 | Endpoint 2 (history with date filter) | DateRangeScrubber + opacity filtering | Time scrubbing works |
| 4 | — | Clustering, heatmap layer, toolbar toggles | Full map experience |
| 5 | Endpoints 3 & 4 (analytics, summary) | AnalyticsView with charts | Analytics dashboard |
| 6 | — | SearchBar, ShareButton, polish | Complete app |

---

## File Structure

### Frontend (`/client/src/`)
```
api/          → queryClient.ts, queries.ts, endpoints.ts
stores/       → mapStore.ts, filterStore.ts, appStore.ts
hooks/        → useMediaQuery.ts, useGsapAnimation.ts
components/
  ui/         → Button.tsx, IconButton.tsx, Badge.tsx, Card.tsx, Skeleton.tsx,
                Tooltip.tsx, Divider.tsx, Stat.tsx, Chip.tsx, EmptyState.tsx,
                Overlay.tsx, DragHandle.tsx
  layout/     → AppLayout.tsx, TopBar.tsx
  map/        → MapCanvas.tsx, MapToolbar.tsx, HeatmapToggle.tsx, CuisineLegend.tsx, DateRangeScrubber.tsx
  panel/      → RestaurantDetailContainer.tsx, Sidebar.tsx, BottomSheet.tsx,
                PanelHeader.tsx, PersonalStats.tsx, SpendSparkline.tsx
  list/       → RestaurantList.tsx, RestaurantListItem.tsx
  analytics/  → AnalyticsView.tsx, SummaryCard.tsx, ShareButton.tsx,
                CuisineSpendChart.tsx, NeighborhoodSpendChart.tsx,
                DayOfWeekChart.tsx, TimeOfDayChart.tsx, MonthlySpendChart.tsx
  nav/        → SearchBar.tsx, ViewToggle.tsx, NavLinks.tsx
pages/        → MapView.tsx, AnalyticsView.tsx
types/        → restaurant.ts, analytics.ts, geojson.ts
utils/        → colors.ts, format.ts, geo.ts, cn.ts
App.tsx, router.tsx, main.tsx
```

### Backend (`/server/app/`)
```
Http/Controllers/Api/ → CustomerRestaurantController, CustomerAnalyticsController, RestaurantController
Models/               → Customer, Restaurant, Booking, EazypayTransaction, Category, Chain, LocationData
Services/             → AnalyticsService, GeoJsonService, LoyaltyScoreService
routes/api.php
```

---

## Verification
1. Scaffold both apps, run `npm run dev` (client) and `php artisan serve` (server)
2. Hit `/api/customers/1/restaurants` — verify GeoJSON response
3. Load map — verify markers render with correct size/color
4. Click marker — verify panel opens with correct data
5. Drag date scrubber — verify markers fade in/out
6. Toggle heatmap — verify overlay renders
7. Navigate to `/analytics` — verify charts render
8. Click share — verify PNG downloads
