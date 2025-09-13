"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import data from "./data/data";

const BusMap = dynamic(() => import("./ui/BusMap"), { ssr: false });

type BusLine = (typeof data.bus_lines)[number];

export default function Home() {
  const busLines = useMemo(
    () =>
      data.bus_lines.map((line) => ({
        ...line,
        capacity: line.passengers?.capacity ?? 0,
      })),
    [],
  );
  const [selectedId, setSelectedId] = useState<number>(busLines[0]?.id ?? 1);
  const selected = useMemo(
    () => busLines.find((b) => b.id === selectedId) ?? busLines[0],
    [busLines, selectedId],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top black utility bar */}
      <div className="flex items-center justify-between bg-[#1f2937] px-3 py-2 text-[10px] text-gray-200">
        <span className="rounded bg-[#374151] px-2 py-1">Amana Logo</span>
        <span className="rounded bg-[#374151] px-2 py-1">Menu</span>
      </div>

      {/* Brand header */}
      <header className="bg-[#4CAF50] px-4 py-3 border-b border-green-600/30">
        <div className="text-center">
          <h1 className="text-[18px] font-bold text-black">
            {data.company_info.name}
          </h1>
          <p className="text-[10px] text-black/80 tracking-wide">
            Proudly Servicing Malaysian Bus Riders Since{" "}
            {data.company_info.founded}
          </p>
        </div>
      </header>

      {/* Section: Active Bus Map */}
      <div className="bg-[#f9e7bf] border-y border-amber-300 px-4 py-2 text-center text-[12px] font-medium text-gray-800">
        Active Bus Map
      </div>

      <section className="px-3 pt-2">
        <div className="grid grid-cols-4 gap-2">
          {busLines.map((line) => (
            <button
              key={line.id}
              onClick={() => setSelectedId(line.id)}
              className={`rounded-sm border px-2 py-1 text-[12px] shadow-sm ${
                selectedId === line.id
                  ? "bg-[#16a34a] text-white border-emerald-700"
                  : "bg-[#e5e7eb] text-gray-800 border-gray-300"
              }`}
            >
              {`Bus ${line.id}`}
            </button>
          ))}
        </div>
      </section>

      <section className="p-3">
        <div className="h-[260px] overflow-hidden rounded-sm border shadow-sm">
          <BusMap line={selected} />
        </div>
      </section>

      {/* Section: Bus Schedule */}
      <div className="bg-[#f9e7bf] border-y border-amber-300 px-4 py-2 text-center text-[12px] font-medium text-gray-800">
        Bus Schedule
      </div>

      <section className="px-3 pt-2">
        <div className="mb-2 grid grid-cols-5 gap-2">
          {busLines.map((line) => (
            <button
              key={line.id}
              onClick={() => setSelectedId(line.id)}
              className={`rounded-sm border px-2 py-1 text-[12px] shadow-sm ${
                selectedId === line.id
                  ? "bg-[#16a34a] text-white border-emerald-700"
                  : "bg-[#e5e7eb] text-gray-800 border-gray-300"
              } col-span-1`}
            >
              {`Bus ${line.id}`}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-sm border shadow-sm">
          <div className="grid grid-cols-2 bg-[#f3f4f6] text-[12px] font-semibold">
            <div className="px-3 py-2">Bus Stop</div>
            <div className="px-3 py-2 text-right">Next Time of Arrival</div>
          </div>
          <ul className="divide-y text-[13px]">
            {selected.bus_stops.map((stop) => (
             <li
                key={stop.id}
                className={`grid grid-cols-2 ${
                  stop.is_next_stop ? "bg-[#FFA500] text-white font-semibold" : "bg-white"
                }`}
              >
                <div className="px-3 py-2 text-gray-800">{stop.name}</div>
                <div className="px-3 py-2 text-right text-gray-700">
                  {stop.estimated_arrival}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#1f2937] p-4 text-center text-[10px] text-gray-200">
        © {new Date().getFullYear()} {data.company_info.name}
      </footer>
    </div>
  );
}
