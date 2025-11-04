import React from "react";
import { FaChevronLeft, FaStamp } from "react-icons/fa6";
import { FaBars } from "react-icons/fa";
import { useState } from "react";
import { useSidebarStore } from "../../store/sidebarStore";
import SidebarContentSwitch from "./SidebarContentSwitch";
import LayerSwitch from "./LayerSwitch";
import Legends from "../Legends/Legends";
import Analysis from "../Analysis/Analysis";
import EarthEngineLayerSwitch from "./EarthEngineLayers";
const Sidebar = () => {
  // const [isOpen, setIsOpen] = useState(false);
  const { isOpen, toggleSidebar, sidebarContent } = useSidebarStore();

  // const toggleSidebar = () => setIsOpen(!isOpen);
  let content;
  if (sidebarContent === "layers")
    content = (
      <div className="">
        <LayerSwitch />
        <EarthEngineLayerSwitch />
      </div>
    );
  else if (sidebarContent === "legend") content = <Legends />;
  else if (sidebarContent === "analysis") content = <Analysis />;
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
