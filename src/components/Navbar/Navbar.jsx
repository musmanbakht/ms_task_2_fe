import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useEarthEngineAuthStore } from "../../store/earthEngineAuthStore";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, initialize, connect, disconnect } = useEarthEngineAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  useEffect(() => { let active = true; initialize().then(() => { if (!active) return; if (window.location.pathname !== pathname) navigate(window.location.pathname + window.location.search, { replace: true }); if (!useEarthEngineAuthStore.getState().isAuthenticated) setShowPrompt(true); }); return () => { active = false; }; }, [initialize]);
  useEffect(() => { if (isAuthenticated) setShowPrompt(false); }, [isAuthenticated]);
  const title = ({ "/": "Classification", "/supervised-classification": "Supervised classification", "/analysis": "Hotspot analysis", "/change-detection": "Change Detection", "/publications": "Publications", "/staff": "Staff", "/patents": "Patents", "/earth-engine-auth": "Earth Engine" })[pathname] || "SDSS Portal";
  return <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-8 py-2">
    <div className="flex items-center gap-4"><img src="/digimine_logo.jpg" className="h-12" alt="WITS Logo" /><h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h1></div>
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-red-500"}`} aria-label={isAuthenticated ? "Earth Engine connected" : "Earth Engine disconnected"} />
      {isAuthenticated ? <button type="button" onClick={() => disconnect()} aria-label="Disconnect Google Earth Engine" className="group flex items-center gap-0 hover:gap-2 focus-visible:gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 transition-all hover:bg-red-100 focus-visible:bg-red-100"><FaSignOutAlt className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-64 group-hover:opacity-100 group-focus-visible:max-w-64 group-focus-visible:opacity-100">Disconnect Google Earth Engine</span></button> : <ConnectButton connect={connect} loading={loading} />}

    </div>
    {showPrompt && !isAuthenticated && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPrompt(false)}><div role="dialog" aria-modal="true" aria-labelledby="connect-prompt" onClick={e => e.stopPropagation()} className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><button type="button" aria-label="Close" className="absolute right-4 top-4 text-gray-500 hover:text-gray-800" onClick={() => setShowPrompt(false)}><FaTimes /></button><p id="connect-prompt" className="mb-5 pr-6 text-lg text-gray-800">To View supervised classification and stats, connect to google earth engine</p><div className="flex justify-center"><ConnectButton connect={connect} loading={loading} /></div></div></div>}
    {error && <p role="alert" className="w-full text-right text-sm text-red-700">{error}</p>}
  </header>;
}

function ConnectButton({ connect, loading }) {
  return <button type="button" onClick={connect} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 hover:shadow disabled:opacity-50"><FcGoogle className="h-6 w-6" aria-hidden="true" /><span>{loading ? "Connecting…" : "Connect Google Earth Engine"}</span></button>;
}
