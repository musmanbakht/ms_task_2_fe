import { create } from "zustand";

export const useLayerStore = create((set) => ({
  // Initial layer visibility states
  layers: {
    mines_aoi: true,
    zaf_adm0: false, // country boundary
    zaf_adm1: true, // provincial boundary lines
    zaf_water_areas_dcw: false,
    zaf_water_lines_dcw: false,
    zaf_osm_buildings: false,
  },

  // Toggle any layer on/off
  toggleLayer: (layerName) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerName]: !state.layers[layerName],
      },
    })),

  // Set visibility directly (true/false)
  setLayerVisibility: (layerName, isVisible) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerName]: isVisible,
      },
    })),

  // Utility: reset all to default (if needed)
  resetLayers: () =>
    set({
      layers: {
        mines_aoi: true,
        zaf_adm0: false,
        zaf_adm1: true,
        zaf_water_areas_dcw: false,
        zaf_water_lines_dcw: false,
        zaf_osm_buildings: false,
      },
    }),
}));
