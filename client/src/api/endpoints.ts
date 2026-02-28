import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
})

export const fetchRestaurants = (customerId: number) =>
  api.get(`/customers/${customerId}/restaurants`).then((r) => r.data)

export const fetchHistory = (
  customerId: number,
  params?: { from?: string; to?: string; restaurant_id?: number }
) => api.get(`/customers/${customerId}/history`, { params }).then((r) => r.data)

export const fetchAnalytics = (customerId: number) =>
  api.get(`/customers/${customerId}/analytics`).then((r) => r.data)

export const fetchSummary = (customerId: number) =>
  api.get(`/customers/${customerId}/summary`).then((r) => r.data)

export const fetchRestaurantDetail = (restaurantId: number, customerId: number) =>
  api
    .get(`/restaurants/${restaurantId}/detail`, { params: { customer_id: customerId } })
    .then((r) => r.data)
