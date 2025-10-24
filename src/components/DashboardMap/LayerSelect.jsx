import React, { useState } from "react";

const LayerSelect = ({ selectedLayers, onLayerToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const parcelLayerOptions = [
    { label: "SB9", key: "sb9_final", type: "solid" },
    {
      label: "SB1123",
      key: "sb1123_final",
      type: "dashed",
    },
    { label: "AB68", key: "ab68_final", type: "fill05" },
    { label: "AB98", key: "ab98_final", type: "fill1" },
  ];

  return (
    <div
      className={`bg-white shadow-lg border border-gray-200 min-w-64 ${
        isExpanded ? "rounded-lg" : "rounded-full"
      }`}
    >
      {/* Header */}
      <div
        className={`bg-[#376476] text-white p-4 cursor-pointer flex items-center justify-between ${
          isExpanded ? "rounded-t-lg" : "rounded-full"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-semibold">Senate and Assembly Bills</h3>
        <span>{isExpanded ? "▲" : "▼"}</span>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {parcelLayerOptions.map(({ label, key, type }) => {
            const isChecked = selectedLayers.has(key);

            // Style indicator based on layer type
            const getStyleIndicator = () => {
              switch (key) {
                case "sb9_final":
                  return (
                    <div
                      className="w-6 h-4 rounded-sm border border-white"
                      style={{ backgroundColor: "#357FCC", opacity: 0.7 }}
                    />
                  );
                case "sb1123_final":
                  return (
                    <div
                      className="w-6 h-4 rounded-sm border-2 border-dashed"
                      style={{
                        backgroundColor: "#FF6B35",
                        opacity: 0.3,
                        borderColor: "#FF6B35",
                      }}
                    />
                  );
                case "ab68_final":
                  return (
                    <div
                      className="w-6 h-4 rounded-sm border-red-950 border-2 border-dashed"
                      style={{
                        backgroundColor: "#E74C3C",
                        opacity: 0.4,
                        // borderColor: "#C0392B"
                      }}
                    />
                  );
                case "ab98_final":
                  return (
                    <div
                      className="w-6 h-4 rounded-sm border-2"
                      style={{
                        backgroundColor: "#27AE60",
                        opacity: 0.5,
                        borderColor: "#229954",
                        borderStyle: "dashed",
                      }}
                    />
                  );
                default:
                  return <div className="w-6 h-4 bg-gray-300 rounded-sm" />;
              }
            };

            return (
              <label
                key={key}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                {getStyleIndicator()}
                <span className="text-sm flex-1">{label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onLayerToggle(key)}
                  className="w-4 h-4"
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LayerSelect;
