import { Link } from "react-router-dom";

export default function Analysis() {
  return <div className="flex flex-col gap-3"><Link to="/analysis" className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Open mining analysis</Link><Link to="/change-detection" className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Change Detection</Link></div>;
}
