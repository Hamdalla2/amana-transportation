"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import data from "./data/data";

const BusMap = dynamic(() => import("./ui/BusMap"), { ssr: false });

type BusLine = (typeof data.bus_lines)[number];

// Helper function to get load indicator color
const getLoadColor = (percentage: number) => {
  if (percentage < 70) return "bg-green-500";
  if (percentage >= 70 && percentage <= 90) return "bg-yellow-500";
  return "bg-red-500";
};

// Helper function to get load emoji
const getLoadEmoji = (percentage: number) => {
  if (percentage < 70) return "🟢";
  if (percentage >= 70 && percentage <= 90) return "🟡";
  return "🔴";
};

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
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [routeFilter, setRouteFilter] = useState<string>("All");
  const [showIncidents, setShowIncidents] = useState<boolean>(false);

  const selected = useMemo(
    () => busLines.find((b) => b.id === selectedId) ?? busLines[0],
    [busLines, selectedId],
  );

  // Filter buses based on status and route
  const filteredBuses = useMemo(() => {
    return busLines.filter((bus) => {
      const statusMatch = statusFilter === "All" || bus.status === statusFilter;
      const routeMatch = routeFilter === "All" || bus.route_number === routeFilter;
      return statusMatch && routeMatch;
    });
  }, [busLines, statusFilter, routeFilter]);

  // Get unique statuses and routes for filters
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(busLines.map(bus => bus.status))];
    return ["All", ...statuses];
  }, [busLines]);

  const availableRoutes = useMemo(() => {
    const routes = [...new Set(busLines.map(bus => bus.route_number))];
    return ["All", ...routes];
  }, [busLines]);

  // Calculate operational summary
  const operationalSummary = useMemo(() => {
    return {
      totalBuses: busLines.length,
      activeBuses: busLines.filter(bus => bus.status === "Active").length,
      maintenanceBuses: busLines.filter(bus => bus.status === "Maintenance").length,
      outOfServiceBuses: busLines.filter(bus => bus.status === "Out of Service").length,
      currentPassengers: busLines.reduce((sum, bus) => sum + (bus.passengers?.current || 0), 0),
      averageUtilization: Math.round(busLines.reduce((sum, bus) => sum + (bus.passengers?.utilization_percentage || 0), 0) / busLines.length)
    };
  }, [busLines]);

  // Get all incidents
  const allIncidents = useMemo(() => {
    return busLines.flatMap(bus => 
      bus.incidents?.map(incident => ({
        ...incident,
        busId: bus.id,
        busName: bus.name,
        routeNumber: bus.route_number
      })) || []
    );
  }, [busLines]);

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

      {/* Operational Summary Widget */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-lg font-bold text-blue-600">🚍 {operationalSummary.totalBuses}</div>
            <div className="text-xs text-gray-600">Total Buses</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-lg font-bold text-green-600">✅ {operationalSummary.activeBuses}</div>
            <div className="text-xs text-gray-600">Active Buses</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-lg font-bold text-yellow-600">🛠️ {operationalSummary.maintenanceBuses}</div>
            <div className="text-xs text-gray-600">Maintenance</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-lg font-bold text-purple-600">👥 {operationalSummary.currentPassengers}</div>
            <div className="text-xs text-gray-600">Passengers</div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-semibold text-gray-700">
            📊 Average Utilization: {operationalSummary.averageUtilization}%
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#f9e7bf] border-y border-amber-300 px-4 py-2">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <span className="text-[12px] font-medium text-gray-800">Filters:</span>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[11px] px-2 py-1 rounded border border-gray-300 bg-white"
            >
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="text-[11px] px-2 py-1 rounded border border-gray-300 bg-white"
            >
              {availableRoutes.map(route => (
                <option key={route} value={route}>{route}</option>
              ))}
            </select>
            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`text-[11px] px-2 py-1 rounded border ${
                showIncidents 
                  ? "bg-red-100 text-red-700 border-red-300" 
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              🚨 Incidents ({allIncidents.length})
            </button>
          </div>
        </div>
      </div>

      {/* Section: Active Bus Map */}
      <div className="bg-[#f9e7bf] border-y border-amber-300 px-4 py-2 text-center text-[12px] font-medium text-gray-800">
        Active Bus Map
      </div>

      <section className="px-3 pt-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredBuses.map((line) => {
            const utilization = line.passengers?.utilization_percentage || 0;
            return (
              <button
                key={line.id}
                onClick={() => setSelectedId(line.id)}
                className={`rounded-sm border px-2 py-1 text-[12px] shadow-sm ${
                  selectedId === line.id
                    ? "bg-[#16a34a] text-white border-emerald-700"
                    : "bg-[#e5e7eb] text-gray-800 border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{`Bus ${line.id}`}</span>
                  <span className="text-[10px]">{getLoadEmoji(utilization)}</span>
                </div>
                <div className="mt-1">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${getLoadColor(utilization)}`}
                        style={{ width: `${utilization}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px]">{utilization}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="p-3">
        <div className="h-[260px] overflow-hidden rounded-sm border shadow-sm">
          <BusMap line={selected} />
        </div>
      </section>

      {/* Incident Dashboard */}
      {showIncidents && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-semibold text-red-800">🚨 Incident Dashboard</h3>
            <button
              onClick={() => setShowIncidents(false)}
              className="text-red-600 text-[12px] px-2 py-1 rounded border border-red-300"
            >
              Close
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allIncidents.length === 0 ? (
              <div className="text-center text-gray-600 text-[12px] py-2">
                No active incidents
              </div>
            ) : (
              allIncidents.map((incident) => (
                <div
                  key={`${incident.busId}-${incident.id}`}
                  className={`bg-white rounded p-2 text-[11px] border-l-4 ${
                    incident.priority === "High" ? "border-red-500" : 
                    incident.priority === "Medium" ? "border-yellow-500" : "border-gray-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">
                        {incident.type} - Bus {incident.busId} ({incident.routeNumber})
                      </div>
                      <div className="text-gray-600">{incident.description}</div>
                      <div className="text-gray-500">
                        Status: {incident.status} | Priority: {incident.priority}
                      </div>
                    </div>
                    <div className="text-right text-gray-500">
                      <div>{incident.reported_time}</div>
                      <div>{incident.reported_by}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Section: Bus Schedule */}
      <div className="bg-[#f9e7bf] border-y border-amber-300 px-4 py-2 text-center text-[12px] font-medium text-gray-800">
        Bus Schedule
      </div>

      <section className="px-3 pt-2">
        <div className="mb-2 grid grid-cols-5 gap-2">
          {filteredBuses.map((line) => {
            const utilization = line.passengers?.utilization_percentage || 0;
            return (
              <button
                key={line.id}
                onClick={() => setSelectedId(line.id)}
                className={`rounded-sm border px-2 py-1 text-[12px] shadow-sm ${
                  selectedId === line.id
                    ? "bg-[#16a34a] text-white border-emerald-700"
                    : "bg-[#e5e7eb] text-gray-800 border-gray-300"
                } col-span-1`}
              >
                <div className="flex items-center justify-between">
                  <span>{`Bus ${line.id}`}</span>
                  <span className="text-[10px]">{getLoadEmoji(utilization)}</span>
                </div>
              </button>
            );
          })}
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