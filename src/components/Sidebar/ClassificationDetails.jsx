import VectorLegend from "../Legends/VectorLegend";

export default function ClassificationDetails({ layer, visible, onZoom }) {
  const mines = layer.mines || [];
  const sceneCount = mines.reduce((total, mine) => total + (mine.sceneCount ?? mine.scenes?.length ?? 0), 0);
  return (
    <div className="mt-2 space-y-2 text-xs text-gray-600 break-words">
      {visible && <VectorLegend title="Classification legend" positionClassName=""
        items={(layer.classes || []).map((entry) => ({ label: entry.name, color: entry.color }))} />}
      <p>Classifier year: {layer.classifier?.modelYear ?? layer.classifier?.year ?? "Unavailable"}</p>
      <p>Collection: {layer.imagery?.collection ?? "Unavailable"}</p>
      <p>Cloud-cover threshold: {layer.imagery?.cloudCoverThreshold ?? "Unavailable"}%</p>
      <p>Selected scenes (across mines): {sceneCount}</p>
      <details>
        <summary className="cursor-pointer text-blue-600">Scene details</summary>
        {mines.map((mine, index) => (
          <div key={`${mine.mineId}-${index}`} className="mt-2">
            <p className="font-medium">{mine.mineName || mine.mineId} ({mine.sceneCount ?? mine.scenes?.length ?? 0} scenes)</p>
            <ul className="space-y-1 mt-1">
              {(mine.scenes || []).map((scene, sceneIndex) => (
                <li key={`${scene.sceneId}-${sceneIndex}`} title={scene.sceneId}>
                  {scene.date} — Cloud cover: {scene.cloudCover ?? "Unavailable"}%
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>
      {layer.boundingBox && <button type="button" onClick={onZoom} className="text-blue-600 hover:text-blue-800">Zoom to layer</button>}
    </div>
  );
}
