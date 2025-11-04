import { create } from "zustand";

export const useLayerStore = create((set) => ({
  // Initial layer visibility states
  layers: {
    zaf_adm1: true, // admin boundary lines
    zaf_water_areas_dcw: true, // water bodies
    zaf_water_lines_dcw: true, // rivers/streams
    zaf_osm_buildings: true, // rivers/streams
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
        zaf_adm1: true,
        zaf_water_areas_dcw: true,
        zaf_water_lines_dcw: true,
        zaf_osm_buildings: true,
      },
    }),
}));
