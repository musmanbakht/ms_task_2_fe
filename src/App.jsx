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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
// import DeleteModal from "./components/Modals/DeleteModal";
// import Sidebar from "./components/Sidebar/Sidebar";
// import Navbar from "./components/Navbar/Navbar";
// import { Route, Router, Routes } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import Staff from "./pages/Staff";
// import Patents from "./pages/Patents";
// import LayoutWithSidebar from "./layouts/LayouWithSidebar";

// function App() {
//   return (
//     <Router>
//       <div>
//         {/* Main content */}
//         <div>
//           <Routes>
//             {/* <Route path="/about" element={<About />} />
//             <Route path="/" element={<Home />} />
//             <Route path="/settings" element={<Home />} /> */}
//             {/* <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/staff" element={<Staff />} />
//             <Route path="/patents" element={<Patents />} /> */}
//             {/* Pages with sidebar */}
//             {/* <Route element={<LayoutWithSidebar />}> */}
//               <Route path="/dashboard" element={<Dashboard />} />
//               {/* <Route path="/staff" element={<Staff />} />
//               <Route path="/patents" element={<Patents />} /> */}
//             {/* </Route> */}
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;
