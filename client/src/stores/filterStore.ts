import { create } from 'zustand'

type SortField = 'visits' | 'totalSpent' | 'lastVisit' | 'loyaltyScore' | 'name'
type SortOrder = 'asc' | 'desc'

interface FilterState {
  searchQuery: string
  sortBy: SortField
  sortOrder: SortOrder
  cuisineFilter: string | null
}

interface FilterActions {
  setSearchQuery: (query: string) => void
  setSortBy: (field: SortField) => void
  toggleSortOrder: () => void
  setCuisineFilter: (cuisine: string | null) => void
  resetFilters: () => void
}

type FilterStore = FilterState & FilterActions

export const useFilterStore = create<FilterStore>((set) => ({
  searchQuery: '',
  sortBy: 'visits',
  sortOrder: 'desc',
  cuisineFilter: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleSortOrder: () => set((s) => ({ sortOrder: s.sortOrder === 'asc' ? 'desc' : 'asc' })),
  setCuisineFilter: (cuisineFilter) => set({ cuisineFilter }),
  resetFilters: () => set({ searchQuery: '', sortBy: 'visits', sortOrder: 'desc', cuisineFilter: null }),
}))
