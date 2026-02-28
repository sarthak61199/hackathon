import { create } from 'zustand'

type ActiveView = 'map' | 'list'

interface AppState {
  customerId: number | null
  activeView: ActiveView
}

interface AppActions {
  setCustomerId: (id: number) => void
  setActiveView: (view: ActiveView) => void
}

type AppStore = AppState & AppActions

export const useAppStore = create<AppStore>((set) => ({
  customerId: null,
  activeView: 'map',

  setCustomerId: (customerId) => set({ customerId }),
  setActiveView: (activeView) => set({ activeView }),
}))
