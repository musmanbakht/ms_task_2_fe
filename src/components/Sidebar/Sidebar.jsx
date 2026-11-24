import React from "react";
import { useLocation } from "react-router-dom";
import { useSavedClassification } from "../../store/savedClassificationStore";
import { FaChevronLeft, FaStamp } from "react-icons/fa6";
import { FaBars } from "react-icons/fa";
import { useSidebarStore } from "../../store/sidebarStore";
import SidebarContentSwitch from "./SidebarContentSwitch";
import LayerSwitch from "./LayerSwitch";
import EarthEngineLayerSwitch from "./EarthEngineLayers";
import Legends from "../Legends/Legends";
import Analysis from "../Analysis/Analysis";
const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebarStore();
  const { pathname } = useLocation();
  const { year, selectYear } = useSavedClassification();
  const content = <div className="flex flex-col gap-4">{pathname === "/supervised-classification" ? <section className="w-80 rounded-lg bg-white shadow-lg p-4"><h2 className="font-semibold mb-3">Select year</h2><div className="grid grid-cols-3 gap-2">{[2000,2005,2010,2015,2020,2023].map(y => <button key={y} type="button" aria-pressed={year === y} onClick={() => selectYear(y)} className={`rounded-full border px-3 py-2 ${year === y ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}>{y}</button>)}</div></section> : <EarthEngineLayerSwitch />}<LayerSwitch /></div>;
  return (
    <>
      <aside
        id="default-sidebar"
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-gray-50 dark:bg-gray-800
${
  isOpen ? "w-96 translate-x-0" : "w-20 sm:w-20 -translate-x-0 sm:translate-x-0"
}
`}
        aria-label="Sidebar"
      >
        {/* <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800"> */}
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 ">
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <FaChevronLeft
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
          {isOpen && (
            <>
              <SidebarContentSwitch />
              <div className="py-4 flex flex-col justify-center items-center">
                {content}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
