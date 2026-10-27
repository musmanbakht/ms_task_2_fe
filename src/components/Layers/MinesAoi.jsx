import { Source, Layer } from "react-map-gl/maplibre";

export default function MinesAoi({ TILE_SERVER }) {
  return (
    <Source id="mines-aoi-source" type="vector"
      tiles={[`${TILE_SERVER}/tiles/mines_aoi/{z}/{x}/{y}.mvt`]}>
      <Layer id="mines-aoi-points" type="circle" source-layer="mines_aoi"
        paint={{ "circle-color": "#ff0000", "circle-radius": 5 }} />
    </Source>
  );
}
