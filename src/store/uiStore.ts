import { create } from "zustand";

type ThemeMode = "light" | "dark";

interface UIState {
  activeCategory: string;
  searchQuery: string;
  isSearchOpen: boolean;
  themeMode: ThemeMode;
  setActiveCategory: (slug: string) => void;
  setSearchQuery: (q: string) => void;
  toggleSearch: (open?: boolean) => void;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeCategory: "react",
  searchQuery: "",
  isSearchOpen: false,
  themeMode: "dark",
  setActiveCategory: (slug) => set({ activeCategory: slug }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleSearch: (open) =>
    set((s) => ({ isSearchOpen: open ?? !s.isSearchOpen })),
  toggleTheme: () =>
    set((s) => ({ themeMode: s.themeMode === "dark" ? "light" : "dark" })),
  setTheme: (mode) => set({ themeMode: mode }),
}));
