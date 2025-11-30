import { create } from 'zustand';

// Example store - modify as needed
interface AppState {
  // Add your state properties here
}

interface AppActions {
  // Add your actions here
}

export const useAppStore = create<AppState & AppActions>()(() => ({
  // Initialize state and actions here
}));
