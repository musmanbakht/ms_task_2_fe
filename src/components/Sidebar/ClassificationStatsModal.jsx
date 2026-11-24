import { formatNumber, formatValue } from "../../utils/formatNumbers";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const names = ["Water", "Barren", "Vegetation", "Mining"];
const percent = (value) => value == null ? "Unavailable" : `${(value * 100).toFixed(2)}%`;
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity) : [];
const title = (key) => key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function Chart({ title: heading, data, bars, percentAxis = false }) {
  return <section className="rounded-xl border p-4 min-w-0"><h3 className="font-semibold mb-3">{heading}</h3>
    <div style={{ width: "100%", height: 260 }}><ResponsiveContainer><BarChart data={data} margin={{ bottom: 50 }}>
      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={65} fontSize={10} />
      <YAxis domain={percentAxis ? [0, 100] : [0, "auto"]} tickFormatter={formatNumber} /><Tooltip formatter={formatNumber} /><Legend verticalAlign="top" />
      {bars.map((bar) => <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color} />)}
    </BarChart></ResponsiveContainer></div>
  </section>;
}

export default function ClassificationStatsModal({ layer, onClose }) {
  const stats = layer.statistics;
  const records = stats?.records || [];
  const [index, setIndex] = useState(0);
  const record = records[index];
  useEffect(() => {
    const handleKey = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  const producer = flatten(record?.producers_accuracy);
  const user = flatten(record?.users_accuracy);
  const accuracy = names.map((name, i) => ({ name, producer: producer[i] == null ? null : producer[i] * 100, user: user[i] == null ? null : user[i] * 100 }));
  const areas = names.map((name) => ({ name, area: record?.[`${name.toLowerCase()}_km2`] ?? 0 }));
  const importance = Object.entries(record?.feature_importance || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  return createPortal(<div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-labelledby="stats-title" onClick={(e) => e.stopPropagation()} className="bg-white text-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-5 md:p-7">
      <div className="flex justify-between gap-4 items-start"><div><h2 id="stats-title" className="text-xl font-bold">Classification statistics and charts</h2>
        <p className="text-sm text-gray-600">Classifier year {stats?.year ?? layer.classifier?.modelYear}. Historical model results, not accuracy or areas measured for the requested image.</p></div>
        <button onClick={onClose} aria-label="Close statistics" className="text-2xl px-2">×</button></div>
      {stats?.error && <p className="mt-4 text-red-700">{stats.error}</p>}
      {!stats && <p className="mt-4">Statistics are unavailable for this layer. Generate the classification again.</p>}
      {stats && !stats.error && !records.length && <p className="mt-4">No statistics found for this mine.</p>}
      {record && <>
        <label className="block mt-5 text-sm font-medium">Mine <select value={index} onChange={(e) => setIndex(Number(e.target.value))} className="ml-2 border rounded p-2">{records.map((item, i) => <option key={item.mine_id} value={i}>{item.Mine_Name} ({item.mine_id})</option>)}</select></label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">{[["Overall validation accuracy", percent(record.overall_accuracy)], ["Kappa", record.kappa?.toFixed(2) ?? "Unavailable"], ["Test samples", record.testing_samples ?? "Unavailable"]].map(([label, value]) => <div key={label} className="bg-slate-50 rounded-lg p-4"><p className="text-sm text-gray-600">{label}</p><p className="text-xl font-semibold">{value}</p></div>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Chart title="Producer’s and user’s accuracy (%)" data={accuracy} percentAxis bars={[{key:"producer",label:"Producer’s",color:"#2563eb"},{key:"user",label:"User’s",color:"#16a34a"}]} />
          <Chart title="Class areas (km²)" data={areas} bars={[{key:"area",label:"Area (km²)",color:"#0d9488"}]} />
          {!!importance.length && <Chart title="Feature importance" data={importance} bars={[{key:"value",label:"Importance",color:"#7c3aed"}]} />}
          <section className="rounded-xl border p-4 overflow-auto"><h3 className="font-semibold mb-3">Confusion matrix</h3><p className="text-xs mb-2">Rows: reference class; columns: predicted class.</p><table className="text-sm border-collapse"><thead><tr><th className="p-2">Reference / predicted</th>{names.map(n => <th className="p-2" key={n}>{n}</th>)}</tr></thead><tbody>{(record.confusion_matrix || []).map((row, i) => <tr key={i}><th className="p-2 text-left">{names[i] ?? i}</th>{row.map((v, j) => <td className="border p-2 text-right" key={j}>{v}</td>)}</tr>)}</tbody></table></section>
        </div>
        <details className="mt-5"><summary className="cursor-pointer font-semibold">All statistics and model settings</summary><dl className="mt-3 grid gap-2">{Object.entries(record).map(([key, value]) => <div key={key} className="border-b pb-2"><dt className="font-medium">{title(key)}</dt><dd className="break-all text-sm">{formatValue(value)}</dd></div>)}</dl></details>
      </>}
    </div></div>, document.body);
}
