// Earth Engine uses the existing Python service, separate from the dashboard API.
export const EARTH_ENGINE_BASE_URL = "http://localhost:8000";

export function validateClassificationDate(date) {
  if (!date) return "Requested date is required.";
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date) return "Enter a valid requested date.";
  return null;
}

const errorMessages = {
  400: "The server rejected the classification request.",
  401: "Your Earth Engine session has expired. Please connect again.",
  404: "Mine not found. Check the Mine ID.",
  422: "Insufficient Landsat scenes or invalid request. Try another supported date.",
  500: "The server could not create the classification. Please try again.",
  502: "Earth Engine is unavailable. Please try again later.",
};

function detailMessage(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(detailMessage).filter(Boolean).join("; ");
  if (detail && typeof detail === "object") {
    return detailMessage(detail.msg || detail.message || detail.detail);
  }
  return "";
}

export async function fetchClassificationMap(params, sessionId) {
  if (!sessionId?.trim()) {
    throw Object.assign(new Error(errorMessages[401]), { status: 401 });
  }
  const validationError = validateClassificationDate(params.date);
  if (validationError) throw new Error(validationError);
  const response = await fetch(
    `${EARTH_ENGINE_BASE_URL}/earthengine/classification/map?session_id=${encodeURIComponent(sessionId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: params.date, mine_id: params.mineId?.trim() || null }),
    }
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback = errorMessages[response.status] || "Classification request failed.";
    const detail = detailMessage(data?.detail || data?.message);
    throw Object.assign(new Error(detail ? `${fallback} ${detail}` : fallback), { status: response.status });
  }
  if (!data?.tileUrl) throw new Error("The classification response did not include a map tile URL.");
  return data;
}
