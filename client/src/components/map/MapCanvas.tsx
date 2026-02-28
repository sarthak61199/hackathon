import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useRestaurants } from "../../api/queries";
import { useAppStore } from "../../stores/appStore";
import { useMapStore } from "../../stores/mapStore";
import { getBoundsFromGeoJSON } from "../../utils/geo";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

const SOURCE_ID = "restaurants";

// Layer IDs in render order (bottom → top)
const L = {
  shadow: "marker-shadow",
  glow: "marker-glow",
  border: "marker-border",
  fill: "marker-fill",
  pulse: "marker-pulse",
} as const;

// ─── Expression helpers ───────────────────────────────────────────────────────
// All cast via `as unknown as mapboxgl.Expression` because TypeScript can't
// verify the first element is a valid ExpressionName in inferred array literals.

/** visitCount → radius, scaled by mult */
const fillRadius = (mult = 1): mapboxgl.ExpressionSpecification =>
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
  ] as unknown as mapboxgl.ExpressionSpecification;

/** Conditionally apply hover expression via feature-state */
const withHover = (
  normal: mapboxgl.ExpressionSpecification,
  hovered: mapboxgl.ExpressionSpecification,
): mapboxgl.ExpressionSpecification =>
  [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    hovered,
    normal,
  ] as unknown as mapboxgl.ExpressionSpecification;

/** Scale the per-feature opacity by a constant */
const scaledOpacity = (scale: number): mapboxgl.ExpressionSpecification =>
  [
    "*",
    ["get", "opacity"],
    scale,
  ] as unknown as mapboxgl.ExpressionSpecification;

// ─── Layer definitions ────────────────────────────────────────────────────────

function addMarkerLayers(map: mapboxgl.Map) {
  // 1. Drop shadow — offset dark disc behind each marker
  map.addLayer({
    id: L.shadow,
    type: "circle",
    source: SOURCE_ID,
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
    filter: [">=", ["get", "visitCount"], 5],
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "visitCount"],
        5,
        30,
        30,
        56,
      ] as unknown as mapboxgl.Expression,
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
    paint: {
      "circle-radius": withHover(fillRadius(1), fillRadius(1.12)),
      "circle-color": ["get", "cuisineColor"],
      "circle-opacity": ["get", "opacity"],
    },
  });

  // 4. Pulse ring — animated expanding stroke (5+ visits)
  map.addLayer({
    id: L.pulse,
    type: "circle",
    source: SOURCE_ID,
    filter: [">=", ["get", "visitCount"], 5],
    paint: {
      "circle-radius": 13, // driven by RAF each frame
      "circle-opacity": 0, // fill invisible — stroke only
      "circle-stroke-width": 2.5,
      "circle-stroke-color": ["get", "cuisineColor"],
      "circle-stroke-opacity": 0.6, // driven by RAF each frame
    },
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const fittedRef = useRef(false);
  const prevCenterRef = useRef<[number, number] | null>(null);
  const rafRef = useRef<number>(0);
  const hoveredId = useRef<string | number | null>(null);

  const customerId = useAppStore((s) => s.customerId);
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const selectRestaurant = useMapStore((s) => s.selectRestaurant);
  const flyTo = useMapStore((s) => s.flyTo);
  const dateRange = useMapStore((s) => s.dateRange);

  const { data: restaurantData } = useRestaurants(customerId);

  // ── Init map (runs once) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const { center: initCenter, zoom: initZoom } = useMapStore.getState();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initCenter,
      zoom: initZoom,
      antialias: true,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    mapRef.current = map;
    prevCenterRef.current = initCenter;

    return () => {
      cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  // ── Load restaurant data ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !restaurantData) return;

    const setup = () => {
      // Source already exists — just refresh data
      if (map.getSource(SOURCE_ID)) {
        (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(
          restaurantData,
        );
        return;
      }

      // promoteId exposes properties.id as the feature id for feature-state
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: restaurantData,
        promoteId: "id",
      });

      addMarkerLayers(map);

      // ── Click: select + fly ───────────────────────────────────────────────
      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, {
          layers: [L.fill],
        });
        if (!hits.length) return;
        const props = hits[0].properties as { id: number };
        const [lng, lat] = (hits[0].geometry as GeoJSON.Point).coordinates;
        selectRestaurant(props.id);
        flyTo(lng, lat);
      });

      // ── Hover: cursor + feature-state scale ──────────────────────────────
      map.on("mousemove", (e) => {
        const hits = map.queryRenderedFeatures(e.point, {
          layers: [L.fill],
        });
        if (hits.length) {
          map.getCanvas().style.cursor = "pointer";
          const id = hits[0].id;
          if (id !== hoveredId.current) {
            if (hoveredId.current !== null)
              map.setFeatureState(
                { source: SOURCE_ID, id: hoveredId.current },
                { hover: false },
              );
            hoveredId.current = id ?? null;
            if (id !== undefined)
              map.setFeatureState({ source: SOURCE_ID, id }, { hover: true });
          }
        } else {
          map.getCanvas().style.cursor = "";
          if (hoveredId.current !== null) {
            map.setFeatureState(
              { source: SOURCE_ID, id: hoveredId.current },
              { hover: false },
            );
            hoveredId.current = null;
          }
        }
      });

      // ── Auto-fit bounds on first load ─────────────────────────────────────
      if (!fittedRef.current) {
        map.fitBounds(getBoundsFromGeoJSON(restaurantData), {
          padding: 60,
          duration: 1200,
        });
        fittedRef.current = true;
      }

      // ── Pulse animation ───────────────────────────────────────────────────
      cancelAnimationFrame(rafRef.current);
      const animate = () => {
        if (!map.getLayer(L.pulse)) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        const t = (Date.now() % 2000) / 2000; // 0 → 1 every 2 s
        const ease = 1 - (1 - t) * (1 - t); // ease-out quad

        map.setPaintProperty(L.pulse, "circle-radius", [
          "interpolate",
          ["linear"],
          ["get", "visitCount"],
          5,
          13 + ease * 22,
          30,
          25 + ease * 22,
        ]);
        map.setPaintProperty(L.pulse, "circle-stroke-opacity", [
          "case",
          [">=", ["get", "opacity"], 1],
          0.65 * (1 - t),
          0,
        ]);

        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    };

    if (map.isStyleLoaded()) setup();
    else map.once("style.load", setup);
  }, [restaurantData, selectRestaurant, flyTo]);

  // ── Date range: fade out-of-range markers to opacity 0.1 ─────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !restaurantData) return;

    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const { start, end } = dateRange;

    const filtered = {
      ...restaurantData,
      features: restaurantData.features.map((f) => {
        const { firstVisit, lastVisit } = f.properties;
        const inRange = lastVisit >= start && firstVisit <= end;
        return {
          ...f,
          properties: { ...f.properties, opacity: inRange ? 1 : 0.1 },
        };
      }),
    };

    source.setData(filtered);
  }, [dateRange, restaurantData]);

  // ── Fly to store center ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const prev = prevCenterRef.current;
    if (prev && (prev[0] !== center[0] || prev[1] !== center[1]))
      map.flyTo({ center, zoom, duration: 1500, essential: true });
    prevCenterRef.current = center;
  }, [center, zoom]);

  return <div ref={containerRef} className="absolute inset-0 size-full" />;
}
