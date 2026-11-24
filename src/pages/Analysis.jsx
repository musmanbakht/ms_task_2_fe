import LoadingSkeleton from "../components/Common/LoadingSkeleton";
import { formatNumber, formatValue } from "../utils/formatNumbers";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import MapDashboard from "./MapDashboard";
import useMiningAnalysisStore from "../store/miningAnalysisStore";

function MetricChart({ title, data, field, line = false }) {
  const Chart = line ? LineChart : BarChart;
  return <section className="bg-white rounded-xl p-4 shadow min-w-0"><h2 className="font-semibold mb-2">{title}</h2><div className="h-60"><ResponsiveContainer><Chart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" {...(line ? { type: "number", domain: [2000, 2023], ticks: [2000, 2005, 2010, 2015, 2020, 2023] } : { type: "category", interval: 0 })} /><YAxis tickFormatter={formatNumber} /><Tooltip formatter={formatNumber} />{line ? <Line dataKey={field} stroke="#2563eb" /> : <Bar dataKey={field} fill="#2563eb" maxBarSize={42} />}</Chart></ResponsiveContainer></div></section>;
}
export default function Analysis() {
  const { data, error, loading, load } = useMiningAnalysisStore();
  const [mineId, setMineId] = useState(""), [year, setYear] = useState(2023);
  useEffect(() => { load(); }, [load]);
  const mine = data?.mines.find((item) => item.mine_id === mineId);
  const chartData = data?.years.map((y) => ({ year: y, area: mine?.time_series?.[y]?.mining_area_km2 ?? null, percent: mine?.time_series?.[y]?.mining_percentage ?? null })) || [];
  const hotspotData = useMemo(() => ({type: "FeatureCollection", features: (data?.hotspot_results?.features || []).filter((f) => Number(f.properties.year) === year)}), [data, year]);
  const availability = data?.metadata?.availability?.[year];
  const trends = Object.entries(mine?.statistics || {}).filter(([key]) => /trend|change|ever_mined|persistent_mined|_frac|slope/i.test(key));
  return <div className="p-4 md:p-6 space-y-4">
    <p className="text-sm text-gray-600">Gi* significance: two-sided normal approximation; Benjamini–Hochberg correction per mine and year. Temporal trends describe mining area, not hotspot significance.</p>
    {error && <div role="alert" className="p-3 bg-red-50 text-red-700 rounded">{error} <button type="button" className="underline ml-2" onClick={() => load({ retry: true })} disabled={loading}>Retry</button></div>}{!data && !error && <><LoadingSkeleton text="Loading hotspot map and results…" className="h-[400px]" /><LoadingSkeleton text="Loading mining charts…" className="h-48" /></>}
    {data && <><div className="flex gap-4"><label>Mine<select className="block border rounded p-2 bg-white" value={mineId} onChange={e => setMineId(e.target.value)}><option value="">All mines</option>{data.mines.map(m => <option key={m.mine_id} value={m.mine_id}>{m.name}</option>)}</select></label><label>Year<select className="block border rounded p-2 bg-white" value={year} onChange={e => setYear(Number(e.target.value))}>{data.years.map(y => <option key={y} value={y}>{y}</option>)}</select></label></div>
      {(data.hotspot_status !== "available" || availability?.status !== "available") && <p role="status" className="text-amber-800 bg-amber-50 p-3 rounded">{data.job?.status === "running" ? "Calculating hotspot results for all mines and years. This may take several minutes." : availability?.reason || (data.job?.status === "failed" ? data.job.error : null) || data.hotspot_error || `Gi* results for ${year} are unavailable.`}</p>}
      <div className="h-[400px] rounded-xl overflow-hidden shadow"><MapDashboard analysisMines={data.mines} analysisMine={mine} hotspotData={hotspotData} analysisLegend={data.legends.hotspot} /></div>
      {mine ? <><p>Selected year: {mine.time_series?.[year]?.mining_area_km2?.toFixed(2)} km²; {mine.time_series?.[year]?.mining_percentage?.toFixed(2)}% mining.</p><div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><MetricChart title="Mining area (km²)" data={chartData} field="area" /><MetricChart title="Mining percentage" data={chartData} field="percent" /><MetricChart title="Mining area trend (km²)" data={chartData} field="area" line /></div><section className="bg-white rounded-xl p-4 shadow"><h2 className="font-semibold mb-3">Trend and change</h2><dl className="divide-y divide-gray-200">{trends.map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3"><dt className="font-semibold text-gray-700 capitalize">{key.replaceAll("_", " ")}</dt><dd className="text-gray-600 break-words">{formatValue(value)}</dd></div>)}</dl></section></> : <p>Select a mine to see its charts and summary.</p>}
    </>}
  </div>;
}
