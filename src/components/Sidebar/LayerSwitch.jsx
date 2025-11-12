import React, { useState } from "react";
// import { useLayerStore } from './useLayerStore';
import { useLayerStore } from "../../store/tileViewStore";
import { FaLayerGroup, FaMap, FaWater, FaBuilding } from "react-icons/fa";
import { MdWaves } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import VectorLegend from "../Legends/VectorLegend";

const LayerSwitch = () => {
  const { layers, toggleLayer, resetLayers } = useLayerStore();

  const layerConfig = [
    {
      name: "zaf_adm1",
      label: "Admin Boundaries",
      icon: <FaMap className="w-4 h-4" />,
      description: "Provincial boundary lines",
      legend: {
        swatch: "fill",
        // Match expression for province colors
        matchExpression: [
          "match",
          ["get", "name_1"],
          "Eastern Cape",
          "#f28cb1",
          "Free State",
          "#f1c40f",
          "Gauteng",
          "#2ecc71",
          "KwaZulu-Natal",
          "#3498db",
          "Limpopo",
          "#9b59b6",
          "Mpumalanga",
          "#e67e22",
          "North West",
          "#1abc9c",
          "Northern Cape",
          "#e74c3c",
          "Western Cape (isolated islands)",
          "#95a5a6",
          "Western Cape",
          "#000000",
          "#cccccc",
        ],
      },
    },
    {
      name: "zaf_water_areas_dcw",
      label: "Water Bodies",
      icon: <FaWater className="w-4 h-4" />,
      description: "Lakes and reservoirs",
      legend: {
        swatch: "fill",
        items: [{ label: "Water body", color: "#1647f7" }],
      },
    },
    {
      name: "zaf_water_lines_dcw",
      label: "Rivers & Streams",
      icon: <MdWaves className="w-4 h-4" />,
      description: "Water courses",
      legend: {
        swatch: "line",
        items: [{ label: "Water course", color: "#1647f7" }],
      },
    },
    {
      name: "zaf_osm_buildings",
      label: "Buildings",
      icon: <FaBuilding className="w-4 h-4" />,
      description: "OSM buildings",
      legend: {
        swatch: "fill",
        items: [{ label: "Building", color: "#ff9900" }],
      },
    },
  ];


  const [expanded, setExpanded] = useState({});
  const toggleExpanded = (name) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

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
        {layerConfig.map((layer) => {
          const isExpanded = !!expanded[layer.name];
          const isVisible = !!layers[layer.name];
          return (
            <div key={layer.name} className="rounded-md hover:bg-gray-50">
              <label className="flex items-start gap-3 p-3 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleLayer(layer.name)}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{layer.icon}</span>
                    <span className="font-medium text-gray-800">
                      {layer.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {layer.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleExpanded(layer.name);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle legend"
                >
                  <FaChevronDown
                    className={`transition-transform ${
                      isExpanded ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
              </label>
              {isExpanded && isVisible && layer.legend && (
                <div className="px-12 pb-3">
                  <VectorLegend
                    title={`${layer.label} Legend`}
                    matchExpression={layer.legend.matchExpression}
                    items={layer.legend.items}
                    showDefault={false}
                    positionClassName=""
                    swatch={layer.legend.swatch || "fill"}
                  />
                </div>
              )}
            </div>
          );
        })}
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
