import { create } from 'zustand'

type ViewMode = 'grid' | 'list'
type Theme = 'light' | 'dark' | 'system'

interface UiState {
  viewMode: ViewMode
  theme: Theme
  sidebarOpen: boolean
  searchQuery: string

  setViewMode: (mode: ViewMode) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSearchQuery: (q: string) => void
}

export const useUiStore = create<UiState>()((set) => ({
  viewMode: 'grid',
  theme: 'system',
  sidebarOpen: true,
  searchQuery: '',

  setViewMode: (mode) => set({ viewMode: mode }),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
