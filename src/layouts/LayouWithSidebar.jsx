import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { useSidebarStore } from "../store/sidebarStore";

export default function LayoutWithSidebar() {
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - fixed width */}
      <Sidebar />

      {/* Main content area - takes remaining space */}
      <div
        // className="flex-1 flex flex-col overflow-hidden sm:ml-96"
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${isOpen ? "sm:ml-96" : "sm:ml-20"}
        `}
      >
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="h-full">
            <Outlet /> {/* This will render nested routes */}
          </div>
        </main>
      </div>
    </div>
  );
}
