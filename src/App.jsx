import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import DeleteModal from "./components/Modals/DeleteModal";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import Patents from "./pages/Patents";
import LayoutWithSidebar from "./layouts/LayouWithSidebar";
import MapDashboard from "./pages/MapDashboard";
import EarthEngineConnect from "./pages/EarthEngineConnect";

function App() {
  return (
    <Router>
      <Routes>
        {/* Direct route */}

        {/* Uncomment and organize routes under layout if needed */}
        <Route element={<LayoutWithSidebar />}>
          <Route path="/" element={<MapDashboard />} />
          <Route path="/publications" element={<Dashboard />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/patents" element={<Patents />} />
          <Route path="/earth-engine-auth" element={<EarthEngineConnect />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
