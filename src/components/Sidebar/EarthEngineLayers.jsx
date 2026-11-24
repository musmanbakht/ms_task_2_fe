import { useEarthEngineAuthStore } from "../../store/earthEngineAuthStore";
import React, { useState, useEffect, useRef } from "react";
import ClassificationDetails from "./ClassificationDetails";
import { EARTH_ENGINE_BASE_URL as API_BASE_URL } from "../../API/earthEngine";
import {
  FaLayerGroup,
  FaMap,
  FaWater,
  FaBuilding,
  FaPlus,
  FaInfoCircle,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { MdWaves } from "react-icons/md";
import AddEarthEngineData from "../Modals/AddEarthEngineData";
import useEarthEngineStore from "../../store/earthEngineStore";



const EarthEngineLayerSwitch = () => {


  const {
    eeLayers,
    activeLayers,
    toggleLayerVisibility,
    removeLayer,
    clearAllLayers,
    setError: setLayerError,
    requestLayerExtent,
  } = useEarthEngineStore();

  const { sessionId, isAuthenticated, disconnect } = useEarthEngineAuthStore();
  const [showAddDataModal, setShowAddDataModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Imagery and classification
            </h3>
          </div>
          <button
            onClick={clearAllLayers}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Add Data Button */}
        {isAuthenticated && (
          <button
            onClick={() => { setLayerError(null); setShowAddDataModal(true); }}
            className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <FaPlus className="w-3 h-3" />
            Add Data
          </button>
        )}
        {eeLayers.length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-semibold text-gray-700">
              Earth Engine Layers
            </h4>
            {eeLayers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={activeLayers[layer.id]}
                  onChange={() => toggleLayerVisibility(layer.id)}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 text-sm">
                      {layer.name || `${layer.product} - ${layer.province}`}
                    </span>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Date: {layer.requestedDate || layer.inputDate}
                  </p>
                  {layer.type === "classification" && (
                    <ClassificationDetails layer={layer} visible={activeLayers[layer.id]} onZoom={() => requestLayerExtent(layer.id)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Earth Engine Layers Section */}

      {/* Add Data Modal */}
      <AddEarthEngineData
        isOpen={showAddDataModal}
        onClose={() => setShowAddDataModal(false)}
        sessionId={sessionId}
        onSessionExpired={(message) => {
          disconnect(message);
          setShowAddDataModal(false);
        }}
      />
    </>
  );
};

export default EarthEngineLayerSwitch;
