import React from 'react'
import { Source, Layer } from "react-map-gl/maplibre";

const ZafWaterLines = ({ TILE_SERVER }) => {
  return (
    <>
    <Source
      id="zaf-water-line-source"
      type="vector"
      tiles={[
        `${TILE_SERVER}/tiles/zaf_water_lines_dcw/{z}/{x}/{y}.mvt`,
      ]}
    />
    <Layer
      id="zaf-water-line"
      type="line"
      source="zaf-water-line-source"
      {...{ "source-layer": "zaf_water_lines_dcw" }}
      paint={{
        "line-color": "#1647f7",
        "line-width": 1,
      }}
    />
  </>
  )
};

export default ZafWaterLines