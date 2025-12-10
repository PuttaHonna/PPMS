import { create } from 'zustand';

type View = 'list' | 'matrix' | 'calendar' | 'notes' | 'graph' | 'profile' | 'shop';

interface UIState {
    currentView: View;
    setView: (view: View) => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentView: 'list',
    setView: (view) => set({ currentView: view }),
}));
