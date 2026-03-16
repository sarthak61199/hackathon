import type { Map, ExpressionSpecification, FilterSpecification } from "mapbox-gl";

// ─── Source IDs ───────────────────────────────────────────────────────────────

export const SOURCE_ID = "restaurants"; // clustered — in-range features only
export const HEATMAP_SOURCE_ID = "heatmap-source"; // unclustered — in-range features only
export const FADED_SOURCE_ID = "faded-restaurants"; // non-clustered — out-of-range features

// ─── Layer IDs (render order: bottom → top) ───────────────────────────────────

export const L = {
  heatmap: "dining-heatmap",
  fadedFill: "faded-marker-fill",
  shadow: "marker-shadow",
  glow: "marker-glow",
  fill: "marker-fill",
  pulse: "marker-pulse",
  cluster: "clusters",
  clusterCount: "cluster-count",
} as const;

// ─── Filter constants ─────────────────────────────────────────────────────────

// Only render non-cluster features for marker layers
export const NOT_CLUSTER = ["!", ["has", "point_count"]];

// ─── Expression helpers ───────────────────────────────────────────────────────

/** visitCount → radius, scaled by mult */
export const fillRadius = (mult = 1): ExpressionSpecification =>
  [
    "interpolate",
    ["linear"],
    ["get", "visitCount"],
    1,
    7 * mult,
    5,
    11 * mult,
    15,
    17 * mult,
    30,
    23 * mult,
  ] as unknown as ExpressionSpecification;

/** Conditionally apply hover expression via feature-state */
export const withHover = (
  normal: ExpressionSpecification,
  hovered: ExpressionSpecification,
): ExpressionSpecification =>
  [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    hovered,
    normal,
  ] as unknown as ExpressionSpecification;

/** Scale the per-feature opacity by a constant */
export const scaledOpacity = (
  scale: number,
): ExpressionSpecification =>
  [
    "*",
    ["get", "opacity"],
    scale,
  ] as unknown as ExpressionSpecification;

// ─── Layer definitions ────────────────────────────────────────────────────────

export function addHeatmapLayer(map: Map) {
  map.addLayer({
    id: L.heatmap,
    type: "heatmap",
    source: HEATMAP_SOURCE_ID,
    paint: {
      // Weight each point by visit frequency
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", "visitCount"],
        1,
        0.3,
        30,
        1,
      ] as unknown as ExpressionSpecification,
      // Scale intensity so even sparse points show clearly
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        2,
        15,
        4,
      ] as unknown as ExpressionSpecification,
      // Indigo → purple → amber → white color ramp
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0,0,0,0)",
        0.15,
        "rgba(99,102,241,0.6)",
        0.4,
        "rgba(139,92,246,0.8)",
        0.65,
        "rgba(251,113,133,0.9)",
        0.85,
        "rgba(251,191,36,1)",
        1,
        "rgba(255,255,255,1)",
      ] as unknown as ExpressionSpecification,
      // Larger radius so sparse points overlap and create visible density
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8,
        60,
        13,
        80,
        15,
        40,
      ] as unknown as ExpressionSpecification,
      "heatmap-opacity": 0, // hidden by default; toggled via store
    },
  });
}

// Ghost markers for out-of-range restaurants (below active markers)
export function addFadedMarkerLayer(map: Map) {
  map.addLayer({
    id: L.fadedFill,
    type: "circle",
    source: FADED_SOURCE_ID,
    paint: {
      "circle-radius": fillRadius(1),
      "circle-color": ["get", "cuisineColor"],
      "circle-opacity": 0.12,
    },
  });
}

export function addMarkerLayers(map: Map) {
  // 1. Drop shadow — offset dark disc behind each marker
  map.addLayer({
    id: L.shadow,
    type: "circle",
    source: SOURCE_ID,
    filter: NOT_CLUSTER as unknown as FilterSpecification,
    paint: {
      "circle-radius": fillRadius(1.2),
      "circle-color": "#000000",
      "circle-opacity": scaledOpacity(0.22),
      "circle-blur": 0.4,
      "circle-translate": [1, 3],
      "circle-translate-anchor": "viewport",
    },
  });

  // 2. Ambient glow — blurred cuisine-colour halo (5+ visits only)
  map.addLayer({
    id: L.glow,
    type: "circle",
    source: SOURCE_ID,
    filter: [
      "all",
      NOT_CLUSTER,
      [">=", ["get", "visitCount"], 5],
    ] as unknown as FilterSpecification,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "visitCount"],
        5,
        30,
        30,
        56,
      ] as unknown as ExpressionSpecification,
      "circle-color": ["get", "cuisineColor"],
      "circle-opacity": scaledOpacity(0.22),
      "circle-blur": 1,
    },
  });

  // 3. Cuisine-coloured fill — the main disc
  map.addLayer({
    id: L.fill,
    type: "circle",
    source: SOURCE_ID,
    filter: NOT_CLUSTER as unknown as FilterSpecification,
    paint: {
      "circle-radius": withHover(fillRadius(1), fillRadius(1.12)),
      "circle-color": ["get", "cuisineColor"],
      "circle-opacity": ["get", "opacity"],
    },
  });

  // 4. Pulse ring — animated expanding stroke (3+ visits)
  map.addLayer({
    id: L.pulse,
    type: "circle",
    source: SOURCE_ID,
    filter: [
      "all",
      NOT_CLUSTER,
      [">=", ["get", "visitCount"], 3],
    ] as unknown as FilterSpecification,
    paint: {
      "circle-radius": 13,
      "circle-opacity": 0,
      "circle-stroke-width": 2.5,
      "circle-stroke-color": ["get", "cuisineColor"],
      "circle-stroke-opacity": 0.6,
    },
  });
}

export function addClusterLayers(map: Map) {
  // Cluster bubble — indigo, sized by point_count
  map.addLayer({
    id: L.cluster,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#6366f1", // indigo-500: small (<10)
        10,
        "#4f46e5", // indigo-600: medium (10–29)
        30,
        "#4338ca", // indigo-700: large (30+)
      ] as unknown as ExpressionSpecification,
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        10,
        26,
        30,
        32,
      ] as unknown as ExpressionSpecification,
      "circle-opacity": 0.9,
      "circle-stroke-width": 2,
      "circle-stroke-color": "rgba(255,255,255,0.2)",
    },
  });

  // Cluster count label
  map.addLayer({
    id: L.clusterCount,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 13,
    },
    paint: {
      "text-color": "#ffffff",
    },
  });
}
