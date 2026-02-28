import { useQuery } from '@tanstack/react-query'
import {
  fetchRestaurants,
  fetchHistory,
  fetchAnalytics,
  fetchSummary,
  fetchRestaurantDetail,
} from './endpoints'
import {
  mockRestaurantsGeoJSON,
  mockRestaurantDetail,
  mockAnalytics,
  mockSummary,
} from './mockData'
import type { RestaurantsGeoJSON } from '../types/geojson'
import type { HistoryResponse } from '../types/restaurant'
import type { AnalyticsResponse, SummaryResponse } from '../types/analytics'

const USE_MOCKS = !import.meta.env.VITE_API_URL

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export function useRestaurants(customerId: number | null) {
  return useQuery<RestaurantsGeoJSON>({
    queryKey: ['restaurants', customerId],
    queryFn: () =>
      USE_MOCKS
        ? delay(mockRestaurantsGeoJSON)
        : fetchRestaurants(customerId!),
    enabled: customerId !== null,
  })
}

export function useDiningHistory(
  customerId: number | null,
  params?: { from?: string; to?: string; restaurant_id?: number }
) {
  return useQuery<HistoryResponse>({
    queryKey: ['history', customerId, params],
    queryFn: () =>
      USE_MOCKS
        ? delay({ data: [], meta: { total: 0, totalSpent: 0 } })
        : fetchHistory(customerId!, params),
    enabled: customerId !== null,
  })
}

export function useAnalytics(customerId: number | null) {
  return useQuery<AnalyticsResponse>({
    queryKey: ['analytics', customerId],
    queryFn: () =>
      USE_MOCKS ? delay(mockAnalytics) : fetchAnalytics(customerId!),
    enabled: customerId !== null,
  })
}

export function useSummaryCard(customerId: number | null) {
  return useQuery<SummaryResponse>({
    queryKey: ['summary', customerId],
    queryFn: () =>
      USE_MOCKS ? delay(mockSummary) : fetchSummary(customerId!),
    enabled: customerId !== null,
  })
}

export function useRestaurantDetail(
  restaurantId: number | null,
  customerId: number | null
) {
  return useQuery({
    queryKey: ['restaurantDetail', restaurantId, customerId],
    queryFn: () =>
      USE_MOCKS
        ? delay(mockRestaurantDetail)
        : fetchRestaurantDetail(restaurantId!, customerId!),
    enabled: restaurantId !== null && customerId !== null,
  })
}
