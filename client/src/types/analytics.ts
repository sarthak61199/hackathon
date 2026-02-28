export interface SpendByCuisine {
  cuisine: string
  cuisineColor: string
  total: number
  visits: number
  percentage: number
}

export interface SpendByNeighborhood {
  neighborhood: string
  total: number
  visits: number
}

export interface VisitByDayOfWeek {
  day: string
  dayIndex: number  // 0-6 Mon-Sun
  count: number
}

export interface VisitByTimeSlot {
  slot: string  // Breakfast, Lunch, Evening, Dinner, Late Night
  count: number
}

export interface MonthlySpend {
  month: string  // "2025-01"
  totalSpend: number
  avgSpend: number
  visits: number
}

export interface AnalyticsResponse {
  spendByCuisine: SpendByCuisine[]
  spendByNeighborhood: SpendByNeighborhood[]
  visitsByDayOfWeek: VisitByDayOfWeek[]
  visitsByTimeSlot: VisitByTimeSlot[]
  monthlySpendTrend: MonthlySpend[]
}

export interface TopItem {
  id?: number
  name: string
  visits: number
  totalSpent: number
}

export interface SummaryResponse {
  customerName: string
  totalVisits: number
  totalSpent: number
  uniqueRestaurants: number
  avgSpendPerVisit: number
  topRestaurant: TopItem & { id: number }
  topCuisine: TopItem
  topNeighborhood: TopItem
  newVsRevisit: {
    newRestaurants: number
    revisitCount: number
  }
  avgPax: number
  totalSavings: number
}
