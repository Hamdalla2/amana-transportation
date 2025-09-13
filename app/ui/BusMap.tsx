"use client";

import { MapContainer, Marker, Popup, TileLayer, Polyline } from "react-leaflet";
import L from "leaflet";

type LatLng = { latitude: number; longitude: number };

type BusStop = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  estimated_arrival: string;
  is_next_stop: boolean;
};

export type BusLine = {
  id: number;
  name: string;
  route_number: string;
  current_location: LatLng & { address: string };
  status: string;
  capacity: number; 
  bus_stops: BusStop[];
};

// 🟢 Icons

const busIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 24px; 
      height: 24px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 20px;
    ">
      🚌
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const stopPinIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #ef4444; /* أحمر */
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const nextStopPinIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 20px solid #f59e0b; 
      border-radius: 3px 3px 0 0;
      position: relative;
      top: -10px;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 20], 
});

export default function BusMap({ line }: { line: BusLine }) {
  const center: [number, number] = [
    line.current_location.latitude,
    line.current_location.longitude,
  ];

  const routePositions: [number, number][] = line.bus_stops.map(stop => [
    stop.latitude,
    stop.longitude,
  ]);

  return (
    <MapContainer center={center} zoom={12} className="h-full w-full">
      {/* Grayscale OSM tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <Polyline positions={routePositions} color="#16a34a" weight={3} />

      {/* Current Bus Marker */}
      <Marker position={center} icon={busIcon}>
        <Popup>
          <div className="space-y-1">
            <div className="font-semibold">Bus {line.name}</div>
            <div className="text-xs">Status: {line.status}</div>
            <div className="text-xs">Capacity: {line.capacity}%</div>
            <div className="text-xs">
              Next stop: {line.bus_stops.find(s => s.is_next_stop)?.name ?? "N/A"}
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Bus Stops */}
      {line.bus_stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.latitude, stop.longitude]}
          icon={stop.is_next_stop ? nextStopPinIcon : stopPinIcon}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold text-sm">{stop.name}</div>
              <div className="text-xs">Next Bus Arrival: {stop.estimated_arrival}</div>
              <div className="text-xs">Status: {stop.is_next_stop ? "Next Stop" : "Normal Stop"}</div>
              <div className="text-xs">Route Number: {line.route_number}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
