import React from "react";
import { useSidebarStore } from "../../store/sidebarStore";

const SidebarContentSwitch = () => {
  const { sidebarContent, setSidebarContent } = useSidebarStore();

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex">
        <button
          class="rounded-l-sm border border-gray-200 px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none disabled:pointer-events-auto disabled:opacity-50"
          onClick={() => setSidebarContent("layers")}
        >
          Layers
        </button>
        <button
          class="-ml-px rounded-r-sm border border-gray-200 px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none disabled:pointer-events-auto disabled:opacity-50"
          onClick={() => setSidebarContent("legend")}
        >
          Legend
        </button>
        <button
          class="-ml-px rounded-r-sm border border-gray-200 px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none disabled:pointer-events-auto disabled:opacity-50"
          onClick={() => setSidebarContent("analysis")}
        >
          Analysis
        </button>
      </div>
    </div>
  );
};
export default SidebarContentSwitch;
