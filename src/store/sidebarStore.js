import { create } from "zustand";
const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
console.log(">>>>>>>>>>>>>>", typeof window, window?.innerWidth, isMobile);
export const useSidebarStore = create((set) => ({
  sidebarContent: "layers", // default
  setSidebarContent: (content) => set({ sidebarContent: content }),

  isOpen: !isMobile, // or false if you want it collapsed initially
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),
}));
