import { create } from "zustand";
import { EARTH_ENGINE_BASE_URL } from "../API/earthEngine.js";

export const useEarthEngineAuthStore = create((set, get) => ({
  sessionId: null, isAuthenticated: false, loading: false, error: "",
  initialize: async () => {
    const params = new URLSearchParams(window.location.search);
    let sid = localStorage.getItem("ee_session_id");
    if (params.has("auth_status")) {
      if (params.get("auth_status") === "success") sid = params.get("session_id");
      else { sid = null; set({ error: params.get("message") || "Authentication failed" }); }
      const returnPath = sessionStorage.getItem("ee_return_path") || window.location.pathname;
      sessionStorage.removeItem("ee_return_path");
      window.history.replaceState({}, "", returnPath);
    }
    if (!sid) return;
    localStorage.setItem("ee_session_id", sid);
    try {
      const response = await fetch(`${EARTH_ENGINE_BASE_URL}/api/auth/status/${encodeURIComponent(sid)}`);
      if (!response.ok || !(await response.json()).authenticated) throw new Error("Session expired. Connect again.");
      localStorage.setItem("ee_session_id", sid);
      set({ sessionId: sid, isAuthenticated: true, error: "" });
    } catch (error) {
      localStorage.removeItem("ee_session_id");
      set({ sessionId: null, isAuthenticated: false, error: error.message });
    }
  },
  connect: async () => {
    set({ loading: true, error: "" });
    try {
      sessionStorage.setItem("ee_return_path", window.location.pathname + window.location.search);
      const response = await fetch(`${EARTH_ENGINE_BASE_URL}/api/auth/initialize`);
      if (!response.ok) throw new Error("Failed to initialize authentication.");
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) { set({ error: error.message }); }
    finally { set({ loading: false }); }
  },
  disconnect: (message = "") => {
    localStorage.removeItem("ee_session_id");
    set({ sessionId: null, isAuthenticated: false, error: message });
  },
}));
