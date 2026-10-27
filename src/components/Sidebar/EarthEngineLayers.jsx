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

  // Earth Engine auth state
  const [sessionId, setSessionId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const sessionInfoRef = useRef(null);

  useEffect(() => {
    if (!showSessionInfo) return;
    const dismiss = (event) => {
      if (event.type === "keydown") {
        if (event.key === "Escape") setShowSessionInfo(false);
      } else if (!sessionInfoRef.current?.contains(event.target)) {
        setShowSessionInfo(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [showSessionInfo]);
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
    } catch {
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
    } catch {
      setError("Failed to initialize authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("ee_session_id");
    setIsAuthenticated(false);
    setSessionId(null);
    setShowSessionInfo(false);
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
          <div className="flex items-center justify-between">
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
              {isAuthenticated && sessionId && (
                <div ref={sessionInfoRef} className="relative flex items-center">
                  <button type="button" aria-label="Earth Engine session information"
                    aria-expanded={showSessionInfo} aria-controls="ee-session-info"
                    onClick={() => setShowSessionInfo((show) => !show)}
                    className="text-gray-500 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 rounded-full">
                    <FaInfoCircle className="w-4 h-4" />
                  </button>
                  {showSessionInfo && (
                    <div id="ee-session-info" className="absolute right-0 top-full mt-2 z-50 w-60 rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs text-gray-700">
                      <p className="font-semibold mb-1">Earth Engine session</p>
                      <p className="break-all select-text">Session: {sessionId}</p>
                    </div>
                  )}
                </div>
              )}
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
          handleDisconnect();
          setShowAddDataModal(false);
          setError(message);
        }}
      />
    </>
  );
};

export default EarthEngineLayerSwitch;
