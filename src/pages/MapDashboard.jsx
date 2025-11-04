import React, { useState, useCallback, useRef } from "react";
import Map, {
  NavigationControl,
  Layer,
  Source,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLayerStore } from "../store/tileViewStore";
import { FaCaretRight } from "react-icons/fa";
import useEarthEngineStore from "../store/earthEngineStore";

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
};

export default function MapDashboard() {
  const mapRef = useRef(null);
  const { layers: layerVisibility } = useLayerStore();
  const [selectedBaseLayer, setselectedBaseLayer] = useState([]);
  const [viewState, setViewState] = useState({
    longitude: 24,
    latitude: -30,
    zoom: 5,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [basemap, setBasemap] = useState("satellite");
  const [showBasemapPanel, setShowBasemapPanel] = useState(false);
  const [popupCoords, setPopupCoords] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [featureIndex, setFeatureIndex] = useState(0);
  const BUILDING_ZOOM_THRESHOLD = 13;
  const { getVisibleLayers } = useEarthEngineStore();
  const visibleLayers = getVisibleLayers();

  // const handleParcelLayerToggle = useCallback((layerKey) => {
  //   selectedBaseLayer((prev) => {
  //     const newSet = new Set(prev);
  //     if (newSet.has(layerKey)) {
  //       newSet.delete(layerKey);
  //     } else {
  //       newSet.add(layerKey);
  //     }
  //     return newSet;
  //   });
  // }, []);
  const TILE_SERVER = "http://localhost:8000";
  console.log("MAP LOADED", layerVisibility.zaf_osm_buildings, viewState.zoom);
  // 🧭 Handle click
  const handleMapClick = useCallback((e) => {
    if (!mapRef.current) return;

    const features = mapRef.current.queryRenderedFeatures(e.point);

    if (features.length > 0) {
      setSelectedFeatures(features);
      setFeatureIndex(0);
      setPopupCoords(e.lngLat);
    } else {
      setSelectedFeatures([]);
      setPopupCoords(null);
    }
  }, []);

  const handleNextFeature = () => {
    setFeatureIndex((prev) => (prev + 1) % selectedFeatures.length);
  };

  const currentFeature =
    selectedFeatures.length > 0 ? selectedFeatures[featureIndex] : null;
  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef} // 👈 ADD THIS LINE
        {...viewState}
        onLoad={(e) => setMapLoaded(true)}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={BASEMAPS[basemap].style}
        style={{ width: "100%", height: "100%" }}
        maxZoom={17.9} // prevents zooming in past level 19
        onClick={handleMapClick}
      >
        {mapLoaded && (
          <>
            {layerVisibility.zaf_adm1 && (
              <>
                <Source
                  id="zaf-adm1-source"
                  type="vector"
                  tiles={[`${TILE_SERVER}/tiles/zaf_adm1/{z}/{x}/{y}.mvt`]}
                />
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
              </>
            )}
            {layerVisibility.zaf_water_areas_dcw && (
              <>
                <Source
                  id="zaf-water-area-source"
                  type="vector"
                  tiles={[
                    `${TILE_SERVER}/tiles/zaf_water_areas_dcw/{z}/{x}/{y}.mvt`,
                  ]}
                />
                <Layer
                  id="zaf-water-areas"
                  type="fill"
                  source="zaf-water-area-source"
                  {...{ "source-layer": "zaf_water_areas_dcw" }}
                  paint={{
                    "fill-color": "#1647f7",
                    "fill-opacity": 0.6,
                  }}
                />
              </>
            )}

            {layerVisibility.zaf_water_lines_dcw && (
              <>
                <Source
                  id="zaf-water-line-source"
                  type="vector"
                  tiles={[
                    `${TILE_SERVER}/tiles/zaf_water_lines_dcw/{z}/{x}/{y}.mvt`,
                  ]}
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
              </>
            )}
          </>
        )}

        {layerVisibility.zaf_osm_buildings &&
          viewState.zoom >= BUILDING_ZOOM_THRESHOLD && (
            <>
              <Source
                id="zaf-osm-buildings-source"
                type="vector"
                tiles={[
                  `${TILE_SERVER}/tiles/zaf_osm_buildings/{z}/{x}/{y}.mvt`,
                ]}
                maxzoom={16}
              />
              <Layer
                id="zaf-osm-buildings-fill"
                type="fill"
                source="zaf-osm-buildings-source"
                {...{ "source-layer": "zaf_osm_buildings" }}
                paint={{
                  "fill-color": "#ff9900",
                  "fill-opacity": 0.6,
                }}
              />
            </>
          )}
        {/* 💬 Message overlay */}
        {layerVisibility.zaf_osm_buildings &&
          viewState.zoom < BUILDING_ZOOM_THRESHOLD && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 text-gray-800 px-4 py-2 rounded-lg shadow-md text-sm font-medium">
              Zoom in to view buildings
            </div>
          )}
        {/* ======== POPUP ======== */}
        {currentFeature && popupCoords && (
          <Popup
            longitude={popupCoords.lng}
            latitude={popupCoords.lat}
            onClose={() => {
              setSelectedFeatures([]);
              setPopupCoords(null);
            }}
            closeButton={true}
            closeOnMove={false}
          >
            <div className="text-sm text-gray-800 max-w-xs p-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {currentFeature.layer?.id || "Feature"}
                </h3>
                {selectedFeatures.length > 1 && (
                  <button
                    onClick={handleNextFeature}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaCaretRight />
                  </button>
                )}
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(currentFeature.properties)
                    .filter(
                      ([key]) =>
                        ![
                          "geom",
                          "geometry",
                          "the_geom",
                          "gid",
                          "id_1",
                          "id_0",
                        ].includes(key)
                    )
                    .map(([key, val]) => (
                      <tr key={key}>
                        <td className="font-medium pr-2 align-top">{key}</td>
                        <td className="break-all">{String(val)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {selectedFeatures.length > 1 && (
                <p className="mt-2 text-[10px] text-gray-500 text-right">
                  {featureIndex + 1} of {selectedFeatures.length}
                </p>
              )}
            </div>
          </Popup>
        )}
        {/* Earth Engine Layers */}
        {visibleLayers.map((layer) => (
          <Source
            key={`gee-source-${layer.id}`}
            id={`gee-source-${layer.id}`}
            type="raster"
            tiles={[layer.tileUrl]}
            bounds={layer.boundingBox}
            tileSize={256}
          >
            <Layer
              id={`gee-layer-${layer.id}`}
              type="raster"
              source={`gee-source-${layer.id}`}
              layout={{
                visibility: "visible",
              }}
            />
          </Source>
        ))}
        <NavigationControl position="top-right" />
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
    </div>
  );
}
