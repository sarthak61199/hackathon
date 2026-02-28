import type { FeatureCollection } from 'geojson'

export function getBoundsFromGeoJSON(
  geojson: FeatureCollection
): [[number, number], [number, number]] {
  let minLng = Infinity, minLat = Infinity
  let maxLng = -Infinity, maxLat = -Infinity

  for (const feature of geojson.features) {
    if (feature.geometry.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates as [number, number]
      if (lng < minLng) minLng = lng
      if (lat < minLat) minLat = lat
      if (lng > maxLng) maxLng = lng
      if (lat > maxLat) maxLat = lat
    }
  }

  if (!isFinite(minLng)) {
    // Fallback to Mumbai
    return [[72.7, 18.9], [73.0, 19.2]]
  }

  // Add padding
  const lngPad = Math.max((maxLng - minLng) * 0.1, 0.01)
  const latPad = Math.max((maxLat - minLat) * 0.1, 0.01)

  return [
    [minLng - lngPad, minLat - latPad],
    [maxLng + lngPad, maxLat + latPad],
  ]
}
