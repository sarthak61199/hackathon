export interface RestaurantFeatureProperties {
  id: number
  name: string
  address: string
  cuisine: string
  cuisineIcon: string | null
  cuisineColor: string
  chainName: string | null
  neighborhood: string | null
  cityName: string
  costForTwo: number
  priceTier: number  // 1-4
  logo: string | null
  visitCount: number
  totalSpent: number
  avgSpent: number
  lastVisit: string   // ISO date
  firstVisit: string  // ISO date
  loyaltyScore: number
  opacity: number     // 1.0 from API, modified client-side by date filter
}

export interface SpendTimelineEntry {
  date: string
  amount: number
  pax: number
}

export interface CustomerStats {
  visitCount: number
  totalSpent: number
  avgSpent: number
  lastVisit: string
  firstVisit: string
  loyaltyScore: number
  avgPax: number
  totalSavings: number
  favouriteDeal: string | null
  spendTimeline: SpendTimelineEntry[]
}

export interface RestaurantDetail {
  id: number
  name: string
  cuisine: string
  cuisineIcon: string | null
  chainName: string | null
  address: string
  neighborhood: string | null
  area: string | null
  cityName: string
  costForTwo: number
  priceTier: number
  logo: string | null
  coordinates: [number, number]
  customerStats: CustomerStats
}

export interface HistoryEntry {
  id: number
  restaurantId: number
  restaurantName: string
  cuisine: string
  date: string
  time: string
  pax: number
  children: number
  deal: string
  billAmount: number | null
  paidAmount: number | null
  walletAmount: number | null
  dealDiscount: number | null
  tipAmount: number | null
  couponAmount: number | null
}

export interface HistoryResponse {
  data: HistoryEntry[]
  meta: {
    total: number
    totalSpent: number
  }
}
