import { NavLink } from "react-router-dom";
import { FaLayerGroup, FaChartArea, FaExchangeAlt } from "react-icons/fa";

export default function SidebarContentSwitch() {
  const links = [["/", "Classification", FaLayerGroup], ["/supervised-classification", "Supervised classification", FaLayerGroup], ["/analysis", "Hotspot analysis", FaChartArea], ["/change-detection", "Change Detection", FaExchangeAlt]];
  return <nav aria-label="Pages" className="flex w-full flex-col gap-1 pt-10 pb-3">{links.map(([to, label, Icon]) =>
    <NavLink key={to} end={to === "/"} to={to} className={({isActive}) => `flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}><Icon className="h-5 w-5 shrink-0" aria-hidden="true" />{label}</NavLink>
  )}</nav>;
}
