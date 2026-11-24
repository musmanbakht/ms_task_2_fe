import { formatValue } from "../utils/formatNumbers";
import React, { useState, useCallback, useRef, useEffect } from "react";
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
import ZafAdm1 from "../components/Layers/ZafAdm1";
import ZafWaterLines from "../components/Layers/ZafWaterLines";
import ZafWaterAreas from "../components/Layers/ZafWaterAreas";
import ZafBuildings from "../components/Layers/ZafBuildings";
import MinesAoi from "../components/Layers/MinesAoi";
import VectorLegend from "../components/Legends/VectorLegend";
import ZafAdm0 from "../components/Layers/ZafAdm0";

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
      glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf", // Add this!

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

export default function MapDashboard({ analysisLayer = null, analysisMine = null, analysisLegend = null, hotspotData = null, analysisMines = null, changeTile = null }) {
  const mapRef = useRef(null);
  const { layers: layerVisibility } = useLayerStore();
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
  const { getVisibleLayers, extentRequest, clearExtentRequest, getLayer } = useEarthEngineStore();
  const analysisMode = analysisMines !== null;
  const visibleLayers = analysisMode ? [] : getVisibleLayers();

  useEffect(() => {
    if (!mapLoaded || !extentRequest || analysisMode) return;
    const bounds = extentRequest.bounds;
    if (getLayer(extentRequest.layerId) && Array.isArray(bounds) && bounds.length === 4 &&
        bounds.every(Number.isFinite) && bounds[0] < bounds[2] && bounds[1] < bounds[3]) {
      mapRef.current?.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { padding: 40, maxZoom: 14, duration: 800 });
    }
    clearExtentRequest();
  }, [mapLoaded, extentRequest, clearExtentRequest, getLayer]);

  useEffect(() => {
    if (!mapLoaded || !analysisMine?.geometry) return;
    const coordinates = analysisMine.geometry.coordinates.flat(Infinity);
    const xs = [], ys = [];
    for (let i = 0; i < coordinates.length; i += 2) { xs.push(coordinates[i]); ys.push(coordinates[i + 1]); }
    if (xs.length) mapRef.current?.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], { padding: 35, maxZoom: 14, duration: 500 });
  }, [mapLoaded, analysisMine]);

  useEffect(() => {
    if (!mapLoaded || !analysisMines?.length || analysisMine) return;
    const coordinates = analysisMines.flatMap((mine) => mine.geometry.coordinates.flat(Infinity));
    const xs = [], ys = [];
    for (let i = 0; i < coordinates.length; i += 2) { xs.push(coordinates[i]); ys.push(coordinates[i + 1]); }
    if (xs.length) mapRef.current?.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], {padding: 40, duration: 500});
  }, [mapLoaded, analysisMines, analysisMine]);

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
        onLoad={() => setMapLoaded(true)}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={BASEMAPS[basemap].style}
        style={{ width: "100%", height: "100%" }}
        maxZoom={17.9} // prevents zooming in past level 19
        onClick={handleMapClick}
      >
        {mapLoaded && !analysisMode && (
          <>
            {/* {layerVisibility.zaf_adm1 && (
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
            )} */}
            {layerVisibility.zaf_adm1 && <ZafAdm1 TILE_SERVER={TILE_SERVER} />}
            {layerVisibility.zaf_water_areas_dcw && (
              <ZafWaterAreas TILE_SERVER={TILE_SERVER} />
            )}

            {layerVisibility.zaf_water_lines_dcw && (
              <ZafWaterLines TILE_SERVER={TILE_SERVER} />
            )}
          </>
        )}

        {!analysisMode && layerVisibility.zaf_osm_buildings &&
          viewState.zoom >= BUILDING_ZOOM_THRESHOLD && (
          <ZafBuildings TILE_SERVER={TILE_SERVER} />
          )}
        {/* 💬 Message overlay */}
        {!analysisMode && layerVisibility.zaf_osm_buildings &&
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
                        <td className="break-all">{formatValue(val)}</td>
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
        {!analysisMode && mapLoaded && layerVisibility.zaf_adm0 && <ZafAdm0 TILE_SERVER={TILE_SERVER} />}
        {!analysisMode && mapLoaded && layerVisibility.mines_aoi && <MinesAoi TILE_SERVER={TILE_SERVER} />}
        {analysisMode && changeTile && <Source key={changeTile} id="change-raster" type="raster" tiles={[changeTile]} tileSize={256}><Layer id="change-raster-layer" type="raster" /></Source>}
        {analysisMode && hotspotData && <Source id="hotspot-grid" type="geojson" data={hotspotData}>
          <Layer id="hotspot-fill" type="fill" paint={{"fill-color": ["match", ["get", "category"], "hotspot_99", "#99000d", "hotspot_95", "#ef3b2c", "hotspot_90", "#fcae91", "not_significant", "#d9d9d9", "coldspot_90", "#bdd7e7", "coldspot_95", "#3182bd", "coldspot_99", "#08519c", "#737373"], "fill-opacity": 0.8, "fill-outline-color": "#888888"}} />
        </Source>}
        <NavigationControl position="top-right" />
      </Map>

      {visibleLayers.some((layer) => layer.type === "classification") && <div className="absolute bottom-8 left-4 z-10 space-y-2 max-h-[60%] overflow-auto">
        {visibleLayers.filter((layer) => layer.type === "classification").map((layer, index) => (
          <VectorLegend key={layer.id || index} title={`Classification (${layer.classifier?.modelYear ?? "unknown"})`}
            positionClassName="relative" items={(layer.classes || []).map((entry) => ({ label: entry.name, color: entry.color }))} />
        ))}
      </div>}
      {analysisLegend?.length > 0 && <VectorLegend title="Analysis legend" items={analysisLegend.map((item) => ({ label: item.label, color: item.color }))} />}
      {/* Basemap Switch Panel */}
      <div className="absolute top-32 right-2 z-10">
        <button
          aria-label="Change basemap"
          onClick={() => setShowBasemapPanel(!showBasemapPanel)}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors text-gray-700 font-semibold"
        >
          🗺️
        </button>

        {showBasemapPanel && (
          <div className="absolute top-14 right-0 bg-white rounded-lg shadow-lg p-3 min-w-[150px]">
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
