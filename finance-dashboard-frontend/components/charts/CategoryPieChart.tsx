"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-50 ring-1 ring-slate-900/5 items-center justify-center flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
          {payload[0].name}
        </p>
        <p className="text-sm font-black text-slate-900 tracking-tighter leading-none tabular-nums">
          ${payload[0].value.toLocaleString("en-US")}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          No active data detected
        </span>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <div className="h-full w-full flex flex-col items-center justify-around gap-6 py-4 md:py-8 lg:flex-row lg:gap-12">
      {/* Visual Canvas: Ultra-Thin Donut - ENLARGED */}
      <div className="relative flex items-center justify-center w-full max-w-[280px] aspect-square md:max-w-[400px] lg:max-w-none lg:w-[480px] lg:h-[480px] transition-transform duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <p className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 md:mb-2">
            Exposure
          </p>
          <h2 className="text-xl md:text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
            ${total.toLocaleString("en-US")}
          </h2>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="80%"
              outerRadius="95%"
              paddingAngle={2}
              dataKey="total"
              nameKey="category"
              stroke="none"
              animationDuration={2000}
              animationBegin={100}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.02))" }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative List: Minimalist Focus - GRID FOR MOBILE, LIST FOR DESKTOP */}
      <div className="w-full lg:w-72 max-h-[200px] lg:max-h-[460px] overflow-y-auto pr-2 custom-scrollbar-minimal pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-4 lg:gap-5">
          {sortedData.map((entry, index) => {
            const percentage = total > 0 ? ((entry.total / total) * 100).toFixed(1) : 0;
            return (
              <div key={entry.category} className="flex items-center group cursor-default">
                <div className="flex items-center gap-2 lg:gap-4 w-full">
                  <div 
                    className="w-1 h-5 lg:h-6 rounded-full transition-all duration-300 group-hover:h-8 shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[8px] lg:text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1 group-hover:text-indigo-600 transition-colors truncate">
                      {entry.category}
                    </span>
                    <span className="text-[9px] lg:text-[11px] font-black text-slate-400 tabular-nums leading-none uppercase tracking-tighter transition-all group-hover:translate-x-1 whitespace-nowrap">
                      {percentage}% Share
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
