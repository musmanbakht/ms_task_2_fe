// Format display values only; calculations and exports retain their original precision.
export function formatNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : value;
}
export function formatValue(value) {
  if (value == null) return "Unavailable";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : formatNumber(value);
  if (typeof value === "object") return JSON.stringify(value, (_key, item) => typeof item === "number" && Number.isFinite(item) && !Number.isInteger(item) ? Number(item.toFixed(2)) : item);
  return String(value);
}
