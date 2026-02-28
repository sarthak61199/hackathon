import { getCuisineColor } from '../utils/colors'
import type { RestaurantsGeoJSON } from '../types/geojson'
import type { RestaurantDetail } from '../types/restaurant'
import type { AnalyticsResponse, SummaryResponse } from '../types/analytics'

const cuisines = ['Italian', 'Indian', 'Japanese', 'Chinese', 'Cafe', 'Continental', 'Thai', 'Seafood']

const restaurantsRaw = [
  { id: 1, name: 'Trattoria Milano', cuisine: 'Italian', lat: 19.0596, lng: 72.8295, visits: 12, spend: 4800, neighborhood: 'Bandra', area: 'Bandra West' },
  { id: 2, name: 'Spice Route', cuisine: 'Indian', lat: 19.0178, lng: 72.8478, visits: 34, spend: 1200, neighborhood: 'Andheri', area: 'Andheri West' },
  { id: 3, name: 'Sakura Garden', cuisine: 'Japanese', lat: 19.0760, lng: 72.8777, visits: 5, spend: 3500, neighborhood: 'Churchgate', area: 'South Mumbai' },
  { id: 4, name: 'Dragon Palace', cuisine: 'Chinese', lat: 19.1136, lng: 72.8697, visits: 8, spend: 900, neighborhood: 'Borivali', area: 'Borivali West' },
  { id: 5, name: 'The Daily Grind', cuisine: 'Cafe', lat: 19.0544, lng: 72.8322, visits: 28, spend: 450, neighborhood: 'Bandra', area: 'Bandra West' },
  { id: 6, name: 'Côte d\'Azur', cuisine: 'Continental', lat: 18.9220, lng: 72.8347, visits: 3, spend: 6000, neighborhood: 'Colaba', area: 'Colaba' },
  { id: 7, name: 'Bangkok Street', cuisine: 'Thai', lat: 19.1197, lng: 72.9054, visits: 7, spend: 1800, neighborhood: 'Thane', area: 'Thane West' },
  { id: 8, name: 'Bombay Canteen', cuisine: 'Indian', lat: 19.0048, lng: 72.8335, visits: 15, spend: 2200, neighborhood: 'Lower Parel', area: 'Lower Parel' },
  { id: 9, name: 'Nobu Mumbai', cuisine: 'Japanese', lat: 19.0596, lng: 72.8354, visits: 2, spend: 8500, neighborhood: 'Bandra', area: 'Bandra Kurla Complex' },
  { id: 10, name: 'Coast & Sea', cuisine: 'Seafood', lat: 18.9400, lng: 72.8340, visits: 6, spend: 3200, neighborhood: 'Marine Drive', area: 'South Mumbai' },
]

function priceTier(costForTwo: number): number {
  if (costForTwo <= 500) return 1
  if (costForTwo <= 1000) return 2
  if (costForTwo <= 2000) return 3
  return 4
}

function loyaltyScore(visits: number, totalSpent: number, lastVisit: string): number {
  const daysSinceLast = Math.floor((Date.now() - new Date(lastVisit).getTime()) / 86400000)
  const recency = Math.max(0, 30 - Math.min(daysSinceLast / 10, 30))
  const spendNorm = Math.min(totalSpent / 10000, 20)
  return Math.round(visits * 3 + recency + spendNorm)
}

const visitDates = [
  '2024-11-15', '2024-10-22', '2024-09-08', '2024-08-14', '2024-07-30',
  '2024-06-20', '2024-05-10', '2024-04-05', '2024-03-12', '2024-02-28',
  '2024-01-15', '2023-12-20',
]

const cuisineColorMap: Record<string, string> = {}
for (const c of cuisines) {
  cuisineColorMap[c] = getCuisineColor(c)
}

export const mockRestaurantsGeoJSON: RestaurantsGeoJSON = {
  type: 'FeatureCollection',
  features: restaurantsRaw.map((r) => {
    const totalSpent = r.spend * r.visits
    const lastVisit = visitDates[Math.floor(Math.abs(r.id * 3) % visitDates.length)]
    const firstVisit = visitDates[Math.min(visitDates.length - 1, Math.floor(r.visits / 3))]
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      properties: {
        id: r.id,
        name: r.name,
        address: `${r.area}, Mumbai`,
        cuisine: r.cuisine,
        cuisineIcon: null,
        cuisineColor: getCuisineColor(r.cuisine),
        chainName: null,
        neighborhood: r.neighborhood,
        cityName: 'Mumbai',
        costForTwo: r.spend,
        priceTier: priceTier(r.spend),
        logo: null,
        visitCount: r.visits,
        totalSpent,
        avgSpent: r.spend,
        lastVisit,
        firstVisit,
        loyaltyScore: loyaltyScore(r.visits, totalSpent, lastVisit),
        opacity: 1,
      },
    }
  }),
  meta: {
    totalRestaurants: restaurantsRaw.length,
    dateRange: { earliest: '2023-12-20', latest: '2024-11-15' },
    cuisineColorMap,
  },
}

export const mockRestaurantDetail: RestaurantDetail = {
  id: 1,
  name: 'Trattoria Milano',
  cuisine: 'Italian',
  cuisineIcon: null,
  chainName: null,
  address: 'Bandra West, Mumbai',
  neighborhood: 'Bandra',
  area: 'Bandra West',
  cityName: 'Mumbai',
  costForTwo: 4800,
  priceTier: 4,
  logo: null,
  coordinates: [72.8295, 19.0596],
  customerStats: {
    visitCount: 12,
    totalSpent: 57600,
    avgSpent: 4800,
    lastVisit: '2024-11-15',
    firstVisit: '2023-04-10',
    loyaltyScore: 68,
    avgPax: 2.3,
    totalSavings: 8400,
    favouriteDeal: 'Date Night Special',
    spendTimeline: [
      { date: '2023-04-10', amount: 4200, pax: 2 },
      { date: '2023-06-15', amount: 5100, pax: 3 },
      { date: '2023-08-22', amount: 4600, pax: 2 },
      { date: '2023-10-14', amount: 5800, pax: 4 },
      { date: '2023-12-08', amount: 4900, pax: 2 },
      { date: '2024-02-14', amount: 6200, pax: 2 },
      { date: '2024-04-20', amount: 4400, pax: 2 },
      { date: '2024-06-05', amount: 5300, pax: 3 },
      { date: '2024-08-18', amount: 4700, pax: 2 },
      { date: '2024-10-01', amount: 5100, pax: 2 },
      { date: '2024-10-22', amount: 4800, pax: 2 },
      { date: '2024-11-15', amount: 5100, pax: 3 },
    ],
  },
}

export const mockAnalytics: AnalyticsResponse = {
  spendByCuisine: [
    { cuisine: 'Italian', cuisineColor: getCuisineColor('Italian'), total: 57600, visits: 12, percentage: 28 },
    { cuisine: 'Indian', cuisineColor: getCuisineColor('Indian'), total: 59100, visits: 49, percentage: 29 },
    { cuisine: 'Japanese', cuisineColor: getCuisineColor('Japanese'), total: 34500, visits: 7, percentage: 17 },
    { cuisine: 'Continental', cuisineColor: getCuisineColor('Continental'), total: 18000, visits: 3, percentage: 9 },
    { cuisine: 'Cafe', cuisineColor: getCuisineColor('Cafe'), total: 12600, visits: 28, percentage: 6 },
    { cuisine: 'Others', cuisineColor: '#6366f1', total: 22800, visits: 21, percentage: 11 },
  ],
  spendByNeighborhood: [
    { neighborhood: 'Bandra', total: 82800, visits: 55 },
    { neighborhood: 'Andheri', total: 40800, visits: 34 },
    { neighborhood: 'South Mumbai', total: 37600, visits: 9 },
    { neighborhood: 'Lower Parel', total: 33000, visits: 15 },
    { neighborhood: 'Borivali', total: 7200, visits: 8 },
  ],
  visitsByDayOfWeek: [
    { day: 'Monday', dayIndex: 0, count: 8 },
    { day: 'Tuesday', dayIndex: 1, count: 12 },
    { day: 'Wednesday', dayIndex: 2, count: 15 },
    { day: 'Thursday', dayIndex: 3, count: 14 },
    { day: 'Friday', dayIndex: 4, count: 28 },
    { day: 'Saturday', dayIndex: 5, count: 42 },
    { day: 'Sunday', dayIndex: 6, count: 35 },
  ],
  visitsByTimeSlot: [
    { slot: 'Breakfast', count: 18 },
    { slot: 'Lunch', count: 45 },
    { slot: 'Evening', count: 22 },
    { slot: 'Dinner', count: 68 },
    { slot: 'Late Night', count: 5 },
  ],
  monthlySpendTrend: [
    { month: '2024-01', totalSpend: 12400, avgSpend: 2067, visits: 6 },
    { month: '2024-02', totalSpend: 18600, avgSpend: 2657, visits: 7 },
    { month: '2024-03', totalSpend: 14200, avgSpend: 1775, visits: 8 },
    { month: '2024-04', totalSpend: 21000, avgSpend: 2625, visits: 8 },
    { month: '2024-05', totalSpend: 16800, avgSpend: 2400, visits: 7 },
    { month: '2024-06', totalSpend: 19400, avgSpend: 2425, visits: 8 },
    { month: '2024-07', totalSpend: 11200, avgSpend: 1867, visits: 6 },
    { month: '2024-08', totalSpend: 22600, avgSpend: 2511, visits: 9 },
    { month: '2024-09', totalSpend: 17800, avgSpend: 2229, visits: 8 },
    { month: '2024-10', totalSpend: 24200, avgSpend: 2690, visits: 9 },
    { month: '2024-11', totalSpend: 15400, avgSpend: 2567, visits: 6 },
    { month: '2024-12', totalSpend: 9800, avgSpend: 1960, visits: 5 },
  ],
}

export const mockSummary: SummaryResponse = {
  customerName: 'Rahul Sharma',
  totalVisits: 120,
  totalSpent: 204600,
  uniqueRestaurants: 10,
  avgSpendPerVisit: 1705,
  topRestaurant: { id: 2, name: 'Spice Route', visits: 34, totalSpent: 40800 },
  topCuisine: { name: 'Indian', visits: 49, totalSpent: 59100 },
  topNeighborhood: { name: 'Bandra', visits: 55, totalSpent: 82800 },
  newVsRevisit: { newRestaurants: 3, revisitCount: 117 },
  avgPax: 2.4,
  totalSavings: 28600,
}
