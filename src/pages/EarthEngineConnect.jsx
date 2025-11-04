import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // If using react-router, otherwise use window.history

const API_BASE_URL = "http://localhost:8000";

export default function EarthEngineConnect() {
  const [sessionId, setSessionId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exampleResult, setExampleResult] = useState(null);
  const location = useLocation();
  const history = useNavigate(); // If using react-router

  // Check if already authenticated or handle callback params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
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
      if (history) {
        history.replace({ search: "" });
      } else {
        window.history.replaceState({}, "", location.pathname);
      }
    } else {
      const savedSessionId = localStorage.getItem("ee_session_id");
      if (savedSessionId) {
        checkAuthStatus(savedSessionId);
      }
    }
  }, [location]);

  const checkAuthStatus = async (sid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status/${sid}`);
      if (!response.ok) throw new Error("Status check failed");
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setSessionId(sid);
        localStorage.setItem("ee_session_id", sid);
      }
    } catch (err) {
      setError("Auth status check failed: " + err.message);
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
      // Redirect to auth URL (seamless flow)
      window.location.href = data.auth_url;
    } catch (err) {
      setError("Failed to initialize authentication: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("ee_session_id");
    setIsAuthenticated(false);
    setSessionId(null);
    setExampleResult(null);
  };

  const runExampleQuery = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ee/example?session_id=${sessionId}`
      );
      if (!response.ok) throw new Error("Query failed");
      const data = await response.json();
      setExampleResult(data);
    } catch (err) {
      setError("Example query failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Earth Engine Authentication
          </h1>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isAuthenticated
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isAuthenticated ? "🌍 Connected" : "⚪ Not Connected"}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Connect to Google Earth Engine to access satellite imagery and
              geospatial datasets.
            </p>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? "Initializing..." : "Connect to Earth Engine"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Successfully connected to Earth Engine
              </p>
              <p className="text-green-700 text-sm mt-1">
                Session ID: {sessionId?.substring(0, 8)}...
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Try it out:
              </h2>
              <button
                onClick={runExampleQuery}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? "Running Query..." : "Run Example Query"}
              </button>

              {exampleResult && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Result:
                  </p>
                  <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(exampleResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
