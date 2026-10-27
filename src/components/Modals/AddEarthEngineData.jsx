import React, { useState } from "react";
import { validateClassificationDate } from "../../API/earthEngine";
import { FaSearch } from "react-icons/fa";
import useEarthEngineStore from "../../store/earthEngineStore";

export default function AddEarthEngineData({ isOpen, onClose, sessionId, onSessionExpired }) {
  const [searchQuery, setSearchQuery] = useState("");
  //   const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("imagery");
  const [date, setDate] = useState("");
  const [mineId, setMineId] = useState("");
  const [zoomToLayer, setZoomToLayer] = useState(true);
  const { fetchAndAddLayer, fetchAndAddClassification, requestLayerExtent, loading, error, setError } = useEarthEngineStore();

  const handleClassify = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!sessionId || localStorage.getItem("ee_session_id") !== sessionId) {
      onSessionExpired("Please connect to Earth Engine again.");
      return;
    }
    const validationError = validateClassificationDate(date);
    if (validationError) {
      setError(validationError);
      return;
    }
    const result = await fetchAndAddClassification({ date, mineId }, sessionId);
    if (result.success) {
      if (zoomToLayer) requestLayerExtent(result.layerId);
      onClose();
    } else if (result.status === 401) {
      onSessionExpired(result.error);
    }
  };
  if (!isOpen) return null;

  const handleAddDataset = async () => {
    // Example parameters - adjust based on your needs
    const params = {
      product: "modis",
      province: "Gauteng",
      input_date: "2009-12-31",
      palette: null,
      geometry: null,
    };

    const result = await fetchAndAddLayer(params, sessionId);

    if (result.success) {
      console.log("Layer added successfully:", result.layerId);
      onClose();
    } else {
      console.error("Failed to add layer:", result.error);
    }
  };
  const popularDatasets = [
    {
      id: "LANDSAT/LC08/C02/T1_L2",
      name: "Landsat 8 Collection 2 Tier 1",
      description: "Atmospherically corrected surface reflectance",
    },
    {
      id: "COPERNICUS/S2_SR",
      name: "Sentinel-2 MSI",
      description: "MultiSpectral Instrument, Level-2A",
    },
    {
      id: "MODIS/006/MOD13A1",
      name: "MODIS Vegetation Indices",
      description: "16-Day NDVI and EVI",
    },
    {
      id: "NASA/NASADEM_HGT/001",
      name: "NASADEM Digital Elevation",
      description: "Global 30m elevation data",
    },
  ];

  const filteredDatasets = popularDatasets.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2
              id="modal-title"
              className="text-xl font-bold text-gray-800 flex items-center gap-2"
            >
              <span className="text-2xl">🌍</span>
              Add Earth Engine Data
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Search and add datasets from Google Earth Engine catalog
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex gap-2 mb-4">
            {[['imagery', 'Simple imagery'], ['classification', 'Supervised classification']].map(([value, label]) => (
              <button key={value} type="button" disabled={loading} aria-pressed={mode === value}
                onClick={() => { setMode(value); setError(null); }}
                className={`px-3 py-2 rounded-lg text-sm ${mode === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
          {error && <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</p>}
          {mode === "classification" ? (
            <form onSubmit={handleClassify} className="space-y-4">
              <p id="classification-date-help" className="text-sm text-gray-600">Choose the requested classification date.</p>
              <label className="block text-sm font-medium text-gray-700">
                Requested date
                <input type="date" required value={date}
                  aria-describedby="classification-date-help" disabled={loading}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Mine ID (optional)
                <input type="text" value={mineId} disabled={loading} aria-describedby="mine-id-help"
                  onChange={(e) => setMineId(e.target.value)}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
              </label>
              <p id="mine-id-help" className="text-sm text-gray-600">Leave Mine ID blank to classify all mines.</p>
              <label className="flex gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={zoomToLayer} disabled={loading} onChange={(e) => setZoomToLayer(e.target.checked)} />
                Zoom to classification when added
              </label>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                {loading ? "Classifying..." : "Classify"}
              </button>
            </form>
          ) : <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search datasets by name or ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Click on any dataset below to add it to
                your map. You can configure visualization parameters after
                adding.
              </p>
            </div>

            {/* Datasets List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>Popular Datasets</span>
                <span className="text-xs font-normal text-gray-500">
                  ({filteredDatasets.length} available)
                </span>
              </h3>

              {filteredDatasets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    No datasets found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                filteredDatasets.map((dataset) => (
                  <button
                    key={dataset.id}
                    onClick={() => handleAddDataset(dataset.id)}
                    disabled={loading}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {dataset.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          {dataset.id}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {dataset.description}
                        </p>
                      </div>
                      <div className="text-blue-600 group-hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Connected with session: {sessionId?.substring(0, 8)}...
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-300 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
