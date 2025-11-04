import { create } from "zustand";

const useEarthEngineStore = create((set, get) => ({
  // Store all EE layers
  eeLayers: [],

  // Active/visible layers
  activeLayers: {},

  // Loading state
  loading: false,

  // Error state
  error: null,

  // Add a new EE layer
  addLayer: (layerData) => {
    const newLayer = {
      id: `ee-layer-${Date.now()}`,
      ...layerData,
      addedAt: new Date().toISOString(),
      visible: true,
    };

    set((state) => ({
      eeLayers: [...state.eeLayers, newLayer],
      activeLayers: {
        ...state.activeLayers,
        [newLayer.id]: true,
      },
    }));

    return newLayer.id;
  },

  // Remove a layer by ID
  removeLayer: (layerId) => {
    set((state) => {
      const { [layerId]: _, ...remainingActiveLayers } = state.activeLayers;
      return {
        eeLayers: state.eeLayers.filter((layer) => layer.id !== layerId),
        activeLayers: remainingActiveLayers,
      };
    });
  },

  // Toggle layer visibility
  toggleLayerVisibility: (layerId) => {
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layerId]: !state.activeLayers[layerId],
      },
    }));
  },

  // Update layer properties (e.g., opacity, palette)
  updateLayer: (layerId, updates) => {
    set((state) => ({
      eeLayers: state.eeLayers.map((layer) =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      ),
    }));
  },

  // Get a specific layer by ID
  getLayer: (layerId) => {
    return get().eeLayers.find((layer) => layer.id === layerId);
  },

  // Get all visible layers
  getVisibleLayers: () => {
    const state = get();
    return state.eeLayers.filter((layer) => state.activeLayers[layer.id]);
  },

  // Clear all layers
  clearAllLayers: () => {
    set({
      eeLayers: [],
      activeLayers: {},
    });
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error state
  setError: (error) => set({ error }),

  // Fetch and add layer from API
  fetchAndAddLayer: async (params, sessionId) => {
    const API_BASE_URL = "http://localhost:8000";

    set({ loading: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE_URL}/earthengine/get-map?session_id=${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch layer data");
      }

      const data = await response.json();

      // Structure the layer data
      const layerData = {
        product: params.product,
        province: params.province,
        inputDate: params.input_date,
        geometry: params.geometry,
        tileUrl: data.tileUrl,
        boundingBox: data.boundingBox,
        palette: data.palette,
        crs: data.crs,
        spatialResolution: data.spatialResolution,
        imageDate: data.imageDate,
        bandMinValue: data.bandMinValue,
        bandMaxValue: data.bandMaxValue,
        status: data.status,
      };

      const layerId = get().addLayer(layerData);
      set({ loading: false });

      return { success: true, layerId, data: layerData };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Reorder layers (for layer control)
  reorderLayers: (startIndex, endIndex) => {
    set((state) => {
      const result = Array.from(state.eeLayers);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { eeLayers: result };
    });
  },
}));

export default useEarthEngineStore;
