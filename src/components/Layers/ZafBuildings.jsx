import { Source, Layer } from "react-map-gl/maplibre";
import React from 'react'

const ZafBuildings = ({ TILE_SERVER }) => {
  return (
    <>
    <Source
      id="zaf-osm-buildings-source"
      type="vector"
      tiles={[
        `${TILE_SERVER}/tiles/zaf_osm_buildings/{z}/{x}/{y}.mvt`,
      ]}
      maxzoom={16}
    />
    <Layer
      id="zaf-osm-buildings-fill"
      type="fill"
      source="zaf-osm-buildings-source"
      {...{ "source-layer": "zaf_osm_buildings" }}
      paint={{
        "fill-color": "#ff9900",
        "fill-opacity": 0.6,
      }}
    />
  </>
  )
}

export default ZafBuildings