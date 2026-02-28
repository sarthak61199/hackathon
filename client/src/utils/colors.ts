export const CUISINE_COLORS: Record<string, string> = {
  // Indian
  'Indian': '#f97316',
  'North Indian': '#f97316',
  'South Indian': '#ea580c',
  'Mughlai': '#c2410c',
  'Biryani': '#fb923c',
  'Punjabi': '#fdba74',

  // Asian
  'Chinese': '#ef4444',
  'Japanese': '#dc2626',
  'Thai': '#f87171',
  'Korean': '#fca5a5',
  'Asian': '#fecaca',
  'Pan Asian': '#fca5a5',
  'Sushi': '#dc2626',

  // Western
  'Italian': '#22c55e',
  'Continental': '#16a34a',
  'American': '#15803d',
  'Mediterranean': '#86efac',
  'French': '#4ade80',

  // Cafe & Fast Food
  'Cafe': '#a78bfa',
  'Coffee': '#8b5cf6',
  'Bakery': '#c4b5fd',
  'Fast Food': '#7c3aed',
  'Burger': '#6d28d9',
  'Pizza': '#5b21b6',
  'Sandwich': '#ede9fe',

  // Seafood & BBQ
  'Seafood': '#38bdf8',
  'BBQ': '#0284c7',
  'Grill': '#0ea5e9',

  // Desserts & Drinks
  'Desserts': '#f472b6',
  'Ice Cream': '#ec4899',
  'Juices': '#db2777',
  'Bar': '#be185d',

  // Other
  'Street Food': '#fbbf24',
  'Healthy': '#84cc16',
  'Vegetarian': '#65a30d',
  'Vegan': '#4d7c0f',
}

const FALLBACK_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#84cc16', '#f97316',
]

export function getCuisineColor(cuisine: string): string {
  if (!cuisine) return FALLBACK_COLORS[0]
  const direct = CUISINE_COLORS[cuisine]
  if (direct) return direct

  // Partial match
  const lower = cuisine.toLowerCase()
  for (const [key, color] of Object.entries(CUISINE_COLORS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return color
    }
  }

  // Hash-based fallback for consistent colors per unknown cuisine
  let hash = 0
  for (let i = 0; i < cuisine.length; i++) {
    hash = cuisine.charCodeAt(i) + ((hash << 5) - hash)
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}
