import { Source, Layer } from "react-map-gl/maplibre";

export default function ZafAdm0({ TILE_SERVER }) {
  return (
    <Source id="zaf-adm0-source" type="vector"
      tiles={[`${TILE_SERVER}/tiles/zaf_adm0/{z}/{x}/{y}.mvt`]}>
      <Layer id="zaf-adm0-line" type="line" source-layer="zaf_adm0"
        paint={{ "line-color": "#ffffff", "line-width": 2 }} />
    </Source>
  );
}
