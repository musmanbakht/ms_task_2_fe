import { Source, Layer } from "react-map-gl/maplibre";
import React from 'react'

const ZafWaterAreas = ({ TILE_SERVER }) => {
  return (
    <>
                <Source
                  id="zaf-water-area-source"
                  type="vector"
                  tiles={[
                    `${TILE_SERVER}/tiles/zaf_water_areas_dcw/{z}/{x}/{y}.mvt`,
                  ]}
                />
                <Layer
                  id="zaf-water-areas"
                  type="fill"
                  source="zaf-water-area-source"
                  {...{ "source-layer": "zaf_water_areas_dcw" }}
                  paint={{
                    "fill-color": "#1647f7",
                    "fill-opacity": 0.6,
                  }}
                />
              </>
  )
};

export default ZafWaterAreas