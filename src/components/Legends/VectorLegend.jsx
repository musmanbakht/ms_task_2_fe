import React from "react";

/**
 * Generic legend for categorical color "match" expressions.
 *
 * Props:
 * - title?: string
 * - matchExpression: any[]  // e.g. ["match", ["get","name"], "A", "#f00", "B", "#0f0", "#999"]
 * - showDefault?: boolean    // whether to show the default color entry
 * - defaultLabel?: string    // label for default entry
 * - positionClassName?: string // optional className to position the legend
 */
export default function VectorLegend({
  title,
  matchExpression,
  items, // optional: [{ label, color }]
  showDefault = false,
  defaultLabel = "Other",
  positionClassName = "absolute bottom-4 left-4 z-10",
  // Swatch rendering options
  swatch = "fill", // "fill" | "line" | "circle"
  lineWidth = 12, // px
  lineThickness = 3, // px
  circleRadius = 6, // px
  circleStrokeColor = "#000",
  circleStrokeWidth = 0, // px
}) {
  const entries = React.useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
      return { pairs: items, defaultColor: null };
    }
    if (!Array.isArray(matchExpression) || matchExpression.length < 4)
      return [];
    const [op, keyExpr, ...rest] = matchExpression;
    if (op !== "match") return [];
    // rest is alternating [value, color, value, color, ..., defaultColor]
    const pairs = [];
    for (let i = 0; i < rest.length - 1; i += 2) {
      const value = rest[i];
      const color = rest[i + 1];
      if (typeof value === "string" && typeof color === "string") {
        pairs.push({ label: value, color });
      } else {
        // stop if we reach non-pair (likely the default color or malformed)
        break;
      }
    }
    const defaultColor = rest[rest.length - 1];
    return { pairs, defaultColor };
  }, [matchExpression, items]);

  if (!entries || !entries.pairs || entries.pairs.length === 0) {
    return null;
  }

  const renderSwatch = (color, key) => {
    if (swatch === "line") {
      return (
        <span
          key={key}
          style={{
            display: "inline-block",
            width: lineWidth,
            height: 0,
            borderTop: `${lineThickness}px solid ${color}`,
            marginRight: 6,
          }}
        />
      );
    }
    if (swatch === "circle") {
      return (
        <span
          key={key}
          style={{
            background: color,
            width: circleRadius * 2,
            height: circleRadius * 2,
            display: "inline-block",
            marginRight: 6,
            borderRadius: "50%",
            border:
              circleStrokeWidth > 0
                ? `${circleStrokeWidth}px solid ${circleStrokeColor}`
                : "none",
          }}
        />
      );
    }
    // default: fill square
    return (
      <span
        key={key}
        style={{
          background: color,
          width: 12,
          height: 12,
          display: "inline-block",
          marginRight: 6,
        }}
      />
    );
  };

  return (
    <div
      className={`${positionClassName} bg-white/95 text-gray-800 px-3 py-2 rounded shadow text-xs`}
    >
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div className="space-y-1">
        {entries.pairs.map((e) => (
          <div key={e.label} className="flex items-center">
            {renderSwatch(e.color, e.label)}
            <span>{e.label}</span>
          </div>
        ))}
        {showDefault && entries.defaultColor && (
          <div className="flex items-center">
            {renderSwatch(entries.defaultColor, "default")}
            <span>{defaultLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}


