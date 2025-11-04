import React from "react";
// import { useLayerStore } from './useLayerStore';
import { useLayerStore } from "../../store/tileViewStore";
import { FaLayerGroup, FaMap, FaWater, FaBuilding } from "react-icons/fa";
import { MdWaves } from "react-icons/md";

const LayerSwitch = () => {
  const { layers, toggleLayer, resetLayers } = useLayerStore();

  const layerConfig = [
    {
      name: "zaf_adm1",
      label: "Admin Boundaries",
      icon: <FaMap className="w-4 h-4" />,
      description: "Provincial boundary lines",
    },
    {
      name: "zaf_water_areas_dcw",
      label: "Water Bodies",
      icon: <FaWater className="w-4 h-4" />,
      description: "Lakes and reservoirs",
    },
    {
      name: "zaf_water_lines_dcw",
      label: "Rivers & Streams",
      icon: <MdWaves className="w-4 h-4" />,
      description: "Water courses",
    },
    {
      name: "zaf_osm_buildings",
      label: "Buildings",
      icon: <FaBuilding className="w-4 h-4" />,
      description: "OSM buildings",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaLayerGroup className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Map Layers</h3>
        </div>
        <button
          onClick={resetLayers}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {layerConfig.map((layer) => (
          <label
            key={layer.name}
            className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={layers[layer.name]}
              onChange={() => toggleLayer(layer.name)}
              className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{layer.icon}</span>
                <span className="font-medium text-gray-800">{layer.label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{layer.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {Object.values(layers).filter(Boolean).length} of {layerConfig.length}{" "}
          layers visible
        </p>
      </div>
    </div>
  );
};

export default LayerSwitch;
