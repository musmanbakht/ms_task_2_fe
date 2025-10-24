import React, { useState, useCallback } from "react";
import Map, { NavigationControl, Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import LayerSelect from "../components/DashboardMap/LayerSelect";
const BASEMAPS = {
  osm: {
    name: "OpenStreetMap",
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  satellite: {
    name: "Satellite",
    style: {
      version: 8,
      sources: {
        satellite: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri",
        },
      },
      layers: [
        {
          id: "satellite",
          type: "raster",
          source: "satellite",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  dark: {
    name: "Dark",
    style: {
      version: 8,
      sources: {
        dark: {
          type: "raster",
          tiles: [
            "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
          ],
          tileSize: 256,
          attribution: "© Stadia Maps",
        },
      },
      layers: [
        {
          id: "dark",
          type: "raster",
          source: "dark",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
  },
  hybrid: {
    name: "Hybrid",
    style: {
      version: 8,
      sources: {
        satellite: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri",
        },
        osm_labels: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "hybrid-satellite",
          type: "raster",
          source: "satellite",
          minzoom: 0,
          maxzoom: 19,
        },
        {
          id: "hybrid-labels",
          type: "raster",
          source: "osm_labels",
          minzoom: 0,
          maxzoom: 19,
          paint: {
            // make the OSM overlay semi-transparent so satellite imagery shows through
            "raster-opacity": 0.65,
          },
        },
      ],
    },
  },
};

export default function MapDashboard() {
  const [selectedBaseLayer, setselectedBaseLayer] = useState([]);
  const [viewState, setViewState] = useState({
    longitude: 24,
    latitude: -30,
    zoom: 5,
  });

  const [basemap, setBasemap] = useState("osm");
  const [showBasemapPanel, setShowBasemapPanel] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [layers, setLayers] = useState({
    markers: true,
    heatmap: false,
    polygons: false,
  });

  const toggleLayer = (layerName) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };
  const handleParcelLayerToggle = useCallback((layerKey) => {
    selectedBaseLayer((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layerKey)) {
        newSet.delete(layerKey);
      } else {
        newSet.add(layerKey);
      }
      return newSet;
    });
  }, []);
  const TILE_SERVER = "http://localhost:5001/api";

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={BASEMAPS[basemap].style}
        style={{ width: "100%", height: "100%" }}
      >
        <Source
          id="zaf-adm1-source"
          type="vector"
          tiles={[`${TILE_SERVER}/tiles/zaf_adm1/{z}/{x}/{y}.mvt`]}
          maxzoom={14}
        />
        <Source
          id="zaf-water-area-source"
          type="vector"
          tiles={[`${TILE_SERVER}/tiles/zaf_water_areas_dcw/{z}/{x}/{y}.mvt`]}
          maxzoom={14}
        />
        <Source
          id="zaf-water-line-source"
          type="vector"
          tiles={[`${TILE_SERVER}/tiles/zaf_water_lines_dcw/{z}/{x}/{y}.mvt`]}
          maxzoom={14}
        />
        {/* <Layer
          id="zaf-adm1-fill"
          type="fill"
          source="zaf-adm1-source"
          {...{ "source-layer": "zaf_adm1" }}
          paint={{
            "fill-color": "#ffffff",
            "fill-opacity": 0.18,
          }}
        /> */}
        <Layer
          id="zaf-adm1-line"
          type="line"
          source="zaf-adm1-source"
          {...{ "source-layer": "zaf_adm1" }}
          paint={{
            "line-color": "#ffffff",
            "line-width": 4,
          }}
        />
        <Layer
          id="zaf-water-areas"
          type="fill"
          source="zaf-water-area-source"
          {...{ "source-layer": "zaf_water_areas_dcw" }}
          paint={{
            "fill-color": "#1647f7",
            "fill-opacity": 1,
          }}
        />
        <Layer
          id="zaf-water-line"
          type="line"
          source="zaf-water-line-source"
          {...{ "source-layer": "zaf_water_lines_dcw" }}
          paint={{
            "line-color": "#1647f7",
            "line-width": 1,
          }}
        />

        {/* sample layers */}
        <div className="absolute top-3 left-72 z-50 space-y-2">
          <LayerSelect
            selectedLayers={selectedBaseLayer}
            onLayerToggle={handleParcelLayerToggle}
          />
        </div>
        <NavigationControl position="top-right" />

        {layers.markers && (
          <Source
            id="markers"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [-0.1276, 51.5074] },
                  properties: { title: "London" },
                },
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [-0.1406, 51.5014] },
                  properties: { title: "Marker 2" },
                },
              ],
            }}
          >
            <Layer
              id="markers-layer"
              type="circle"
              paint={{
                "circle-radius": 8,
                "circle-color": "#ef4444",
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </Source>
        )}

        {layers.polygons && (
          <Source
            id="polygons"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [
                      [
                        [-0.15, 51.52],
                        [-0.1, 51.52],
                        [-0.1, 51.49],
                        [-0.15, 51.49],
                        [-0.15, 51.52],
                      ],
                    ],
                  },
                },
              ],
            }}
          >
            <Layer
              id="polygons-layer"
              type="fill"
              paint={{
                "fill-color": "#3b82f6",
                "fill-opacity": 0.4,
              }}
            />
            <Layer
              id="polygons-outline"
              type="line"
              paint={{
                "line-color": "#1d4ed8",
                "line-width": 2,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Basemap Switch Panel */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowBasemapPanel(!showBasemapPanel)}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors text-gray-700 font-semibold"
        >
          🗺️
        </button>

        {showBasemapPanel && (
          <div className="absolute top-14 left-0 bg-white rounded-lg shadow-lg p-3 min-w-[150px]">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Basemaps
            </h3>
            {Object.entries(BASEMAPS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  setBasemap(key);
                  setShowBasemapPanel(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  basemap === key
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layer Switch Panel */}
      <div className="absolute top-4 left-20 z-10">
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors text-gray-700 font-semibold"
        >
          📊
        </button>

        {showLayerPanel && (
          <div className="absolute top-14 left-0 bg-white rounded-lg shadow-lg p-3 min-w-[180px]">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Layers</h3>
            {Object.entries(layers).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleLayer(key)}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm text-gray-700 capitalize">{key}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
