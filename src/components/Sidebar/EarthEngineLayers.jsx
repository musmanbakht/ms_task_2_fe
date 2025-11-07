import React, { useState, useEffect } from "react";
import { useLayerStore } from "../../store/tileViewStore";
import {
  FaLayerGroup,
  FaMap,
  FaWater,
  FaBuilding,
  FaPlus,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { MdWaves } from "react-icons/md";
import AddEarthEngineData from "../Modals/AddEarthEngineData";
import useEarthEngineStore from "../../store/earthEngineStore";

const API_BASE_URL = "http://localhost:8000";

const EarthEngineLayerSwitch = () => {
  const { layers, toggleLayer, resetLayers } = useLayerStore();

  const {
    eeLayers,
    activeLayers,
    toggleLayerVisibility,
    removeLayer,
    clearAllLayers,
  } = useEarthEngineStore();

  // Earth Engine auth state
  const [sessionId, setSessionId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  // Add this useEffect to handle the callback from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("auth_status")) {
      if (params.get("auth_status") === "success") {
        const sid = params.get("session_id");
        if (sid) {
          localStorage.setItem("ee_session_id", sid);
          setSessionId(sid);
          checkAuthStatus(sid);
        }
      } else if (params.get("auth_status") === "error") {
        setError(params.get("message") || "Authentication failed");
      }
      // Clean URL (remove query params)
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    console.log("checking sesseion id", localStorage.getItem("ee_session_id"));
    const savedSessionId = localStorage.getItem("ee_session_id");
    if (savedSessionId) {
      checkAuthStatus(savedSessionId);
    }
  }, []);

  const checkAuthStatus = async (sid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status/${sid}`);
      if (!response.ok) {
        console.log("Status check res failed");
      }
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setSessionId(sid);
        localStorage.setItem("ee_session_id", sid);
      } else {
        localStorage.removeItem("ee_session_id");
      }
    } catch (err) {
      setError("Auth status check failed");
      localStorage.removeItem("ee_session_id");
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/initialize`);
      if (!response.ok) throw new Error("Initialization failed");
      const data = await response.json();
      setSessionId(data.session_id);
      window.location.href = data.auth_url;
    } catch (err) {
      setError("Failed to initialize authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("ee_session_id");
    setIsAuthenticated(false);
    setSessionId(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Google Earth Engine
            </h3>
          </div>
          <button
            onClick={clearAllLayers}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Earth Engine Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* <span className="text-sm font-medium text-gray-700">
                <FcGoogle />
              </span> */}
              <FcGoogle />
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isAuthenticated
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isAuthenticated ? "🌍 Connected" : "⚪ Disconnected"}
              </div>
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleDisconnect}
                className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded font-medium transition-colors"
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {isAuthenticated && sessionId && (
            <p className="text-xs text-gray-500 mt-1">
              Session: {sessionId.substring(0, 8)}...
            </p>
          )}
        </div>

        {/* Add Data Button */}
        {isAuthenticated && (
          <button
            onClick={() => setShowAddDataModal(true)}
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
                      {layer.product} - {layer.province}
                    </span>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Date: {layer.inputDate}
                  </p>
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
      />
    </>
  );
};

export default EarthEngineLayerSwitch;
