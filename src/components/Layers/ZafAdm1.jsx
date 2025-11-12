// ZafAdm1Layer.jsx
import React from "react";
import { Source, Layer } from "react-map-gl/maplibre";

export default function ZafAdm1({ TILE_SERVER }) {
  const PROVINCE_COLOR_MATCH = [
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
  ];
  return (
    <>
      <Source
        id="zaf-adm1-source"
        type="vector"
        tiles={[`${TILE_SERVER}/tiles/zaf_adm1/{z}/{x}/{y}.mvt`]}
      />

      {/* 🧱 Boundary lines only, different color per province */}
      <Layer
        id="zaf-adm1-line"
        type="line"
        source="zaf-adm1-source"
        {...{ "source-layer": "zaf_adm1" }}
        paint={{
          "line-color": PROVINCE_COLOR_MATCH,
          "line-width": 4,
        }}
      />

      {/* 🏷️ Province labels (try to place near centroid) */}
      <Layer
        id="zaf-adm1-labels"
        type="symbol"
        source="zaf-adm1-source"
        {...{ "source-layer": "zaf_adm1" }}
        layout={{
          "text-field": ["get", "name_1"],
          "text-size": 12,
          "text-font": ["Noto Sans Bold"],
          "symbol-placement": "point", // uses polygon centroid if available
          "text-allow-overlap": false,
        }}
        paint={{
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        }}
      />
    </>
  );
}
