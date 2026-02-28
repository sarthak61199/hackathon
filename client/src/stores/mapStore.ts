import { create } from 'zustand'

interface DateRange {
  start: string  // ISO date "2020-01-01"
  end: string    // ISO date
}

interface MapState {
  center: [number, number]
  zoom: number
  selectedRestaurantId: number | null
  isPanelOpen: boolean
  showHeatmap: boolean
  dateRange: DateRange
}

interface MapActions {
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  selectRestaurant: (id: number | null) => void
  closePanel: () => void
  toggleHeatmap: () => void
  setDateRange: (range: DateRange) => void
  flyTo: (lng: number, lat: number, zoom?: number) => void
}

type MapStore = MapState & MapActions

export const useMapStore = create<MapStore>((set) => ({
  center: [72.8777, 19.0760],
  zoom: 11,
  selectedRestaurantId: null,
  isPanelOpen: false,
  showHeatmap: false,
  dateRange: {
    start: '2020-01-01',
    end: new Date().toISOString().split('T')[0],
  },

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  selectRestaurant: (id) => set({
    selectedRestaurantId: id,
    isPanelOpen: id !== null,
  }),
  closePanel: () => set({ selectedRestaurantId: null, isPanelOpen: false }),
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),
  setDateRange: (dateRange) => set({ dateRange }),
  flyTo: (lng, lat, zoom = 15) => set({ center: [lng, lat], zoom }),
}))
