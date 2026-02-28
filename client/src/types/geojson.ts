import type { RestaurantFeatureProperties } from './restaurant'

export interface RestaurantFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]  // [longitude, latitude]
  }
  properties: RestaurantFeatureProperties
}

export interface RestaurantsGeoJSON {
  type: 'FeatureCollection'
  features: RestaurantFeature[]
  meta: {
    totalRestaurants: number
    dateRange: {
      earliest: string  // ISO date
      latest: string
    }
    cuisineColorMap: Record<string, string>
  }
}
