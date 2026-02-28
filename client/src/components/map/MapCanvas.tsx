import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useRestaurants } from "../../api/queries";
import { useAppStore } from "../../stores/appStore";
import { useMapStore } from "../../stores/mapStore";
import { getBoundsFromGeoJSON } from "../../utils/geo";
import {
  SOURCE_ID,
  HEATMAP_SOURCE_ID,
  FADED_SOURCE_ID,
  L,
  addHeatmapLayer,
  addFadedMarkerLayer,
  addMarkerLayers,
  addClusterLayers,
} from "../../utils/map";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

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
  const showHeatmap = useMapStore((s) => s.showHeatmap);

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
      // Sources already exist — date range effect will re-sync filtered data
      if (map.getSource(SOURCE_ID)) return;

      // Main source — clustered, in-range features only (date range effect manages data)
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: restaurantData,
        promoteId: "id",
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      // Heatmap source — unclustered, in-range features only
      map.addSource(HEATMAP_SOURCE_ID, {
        type: "geojson",
        data: restaurantData,
      });

      // Faded source — out-of-range ghost markers (no clustering)
      map.addSource(FADED_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Render order: heatmap → faded ghosts → active markers → clusters (top)
      addHeatmapLayer(map);
      addFadedMarkerLayer(map);
      addMarkerLayers(map);
      addClusterLayers(map);

      // Sync heatmap visibility in case user toggled before data loaded
      if (useMapStore.getState().showHeatmap) {
        map.setPaintProperty(L.heatmap, "heatmap-opacity", 0.75);
      }

      // ── Click: individual marker — select + fly ───────────────────────────
      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: [L.fill] });
        if (!hits.length) return;
        const props = hits[0].properties as { id: number };
        const [lng, lat] = (hits[0].geometry as GeoJSON.Point).coordinates;
        selectRestaurant(props.id);
        flyTo(lng, lat);
      });

      // ── Click: cluster — expand zoom ─────────────────────────────────────
      map.on("click", L.cluster, (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const clusterId = feature.properties?.cluster_id as number;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
        const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
          if (err || expansionZoom === null) return;
          map.flyTo({ center: coords, zoom: expansionZoom, duration: 800 });
        });
      });

      // ── Hover: cursor + feature-state scale ──────────────────────────────
      map.on("mousemove", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: [L.fill] });
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

      // Pointer cursor on cluster hover
      map.on("mouseenter", L.cluster, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", L.cluster, () => {
        map.getCanvas().style.cursor = "";
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
        const ease = 1 - (1 - t) * (1 - t);   // ease-out quad

        map.setPaintProperty(L.pulse, "circle-radius", [
          "interpolate",
          ["linear"],
          ["get", "visitCount"],
          5,  13 + ease * 22,
          30, 25 + ease * 22,
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

  // ── Date range filter — splits features across sources ───────────────────
  // SOURCE_ID (clustered) and HEATMAP_SOURCE_ID get only in-range features.
  // FADED_SOURCE_ID gets out-of-range features so clusters/heatmap stay clean.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !restaurantData) return;

    const mainSource = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!mainSource) return;

    const { start, end } = dateRange;
    const inRange: typeof restaurantData.features = [];
    const outOfRange: typeof restaurantData.features = [];

    for (const f of restaurantData.features) {
      const { firstVisit, lastVisit } = f.properties;
      if (lastVisit >= start && firstVisit <= end) {
        inRange.push(f);
      } else {
        outOfRange.push({ ...f, properties: { ...f.properties, opacity: 0.1 } });
      }
    }

    const inRangeCollection = { ...restaurantData, features: inRange };
    const outOfRangeCollection = { ...restaurantData, features: outOfRange };

    mainSource.setData(inRangeCollection);
    (map.getSource(HEATMAP_SOURCE_ID) as mapboxgl.GeoJSONSource)?.setData(inRangeCollection);
    (map.getSource(FADED_SOURCE_ID) as mapboxgl.GeoJSONSource)?.setData(outOfRangeCollection);
  }, [dateRange, restaurantData]);

  // ── Heatmap visibility ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    // Layer only exists after data loads — setup() syncs state for early toggles
    if (!map || !map.getLayer(L.heatmap)) return;
    map.setPaintProperty(L.heatmap, "heatmap-opacity", showHeatmap ? 0.75 : 0);
  }, [showHeatmap]);

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
