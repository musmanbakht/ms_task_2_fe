import { create } from "zustand";
import { EARTH_ENGINE_BASE_URL } from "../API/earthEngine.js";

let pending = null;
let pollTimer = null;
const endpoint = `${EARTH_ENGINE_BASE_URL}/api/mining/hotspot-analysis`;

async function request(sessionId) {
  const url = sessionId ? `${endpoint}?session_id=${encodeURIComponent(sessionId)}` : endpoint;
  const response = await fetch(url);
  let body;
  try { body = await response.json(); } catch { throw new Error("The analysis service returned an invalid response."); }
  if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "Analysis request failed.");
  return body;
}

const useMiningAnalysisStore = create((set, get) => ({
  data: null,
  loading: false,
  error: null,
  load: async ({ retry = false } = {}) => {
    if (pending) return pending;
    if (!retry && get().data?.hotspot_status === "available") return get().data;
    if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
    set({ loading: true, error: null });
    pending = (async () => {
      try {
        let data = await request();
        set({ data });
        if (data.hotspot_status !== "available" && data.job?.status !== "running" && (retry || data.job?.status !== "failed")) {
          const session = localStorage.getItem("ee_session_id");
          if (!session) throw new Error("Connect to Google Earth Engine to calculate hotspot results.");
          data = await request(session);
          set({ data });
        }
        if (data.job?.status === "running" && data.hotspot_status !== "available") {
          pollTimer = setTimeout(() => { pollTimer = null; get().load(); }, 5000);
        } else if (data.job?.status === "failed" && data.hotspot_status !== "available") {
          set({ error: data.job.error || "Hotspot analysis failed." });
        }
        return data;
      } catch (error) {
        set({ error: error.message });
        return null;
      } finally {
        set({ loading: false });
        pending = null;
      }
    })();
    return pending;
  },
}));
export default useMiningAnalysisStore;
