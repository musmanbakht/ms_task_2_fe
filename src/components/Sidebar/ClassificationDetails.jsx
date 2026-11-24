import { formatValue } from "../../utils/formatNumbers";
import { useState } from "react";
import ClassificationStatsModal from "./ClassificationStatsModal";


export default function ClassificationDetails({ layer, visible, onZoom }) {
  const [showStats, setShowStats] = useState(false);
  const mines = layer.mines || [];
  const sceneCount = mines.reduce((total, mine) => total + (mine.sceneCount ?? mine.scenes?.length ?? 0), 0);
  return (
    <div className="mt-2 space-y-2 text-xs text-gray-600 break-words">

      <p>Classifier year: {layer.classifier?.modelYear ?? layer.classifier?.year ?? "Unavailable"}</p>
      <p>Training overall accuracy: {layer.classifier?.accuracy?.overallAccuracy != null ? `${(layer.classifier.accuracy.overallAccuracy * 100).toFixed(2)}%` : "Unavailable"}</p>
      <p>Classifier asset: {layer.classifier?.asset ?? "Unavailable"}</p>
      <button type="button" onClick={() => setShowStats(true)} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Show stats and charts</button>
      {showStats && <ClassificationStatsModal layer={layer} onClose={() => setShowStats(false)} />}
      {layer.classifier?.accuracy && <details><summary className="cursor-pointer text-blue-600">Training metrics</summary>
        {Object.entries(layer.classifier.accuracy).filter(([key]) => key !== "source").map(([key, value]) => <p key={key}>{key}: {formatValue(value)}</p>)}
      </details>}
      {layer.classifier?.featureImportance && <details><summary className="cursor-pointer text-blue-600">Feature importance</summary>
        {Object.entries(layer.classifier.featureImportance).map(([key, value]) => <p key={key}>{key}: {Number(value).toFixed(2)}</p>)}
      </details>}
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
                  {scene.date} — Cloud cover: {formatValue(scene.cloudCover)}%
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
