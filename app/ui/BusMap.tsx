"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
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
  bus_stops: BusStop[];
};

const greenBusIcon = new L.DivIcon({
  className: "",
  html: '<div style="background:#16a34a;border-radius:9999px;width:18px;height:18px;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.25);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const redStopIcon = new L.DivIcon({
  className: "",
  html: '<div style="background:#ef4444;border-radius:9999px;width:14px;height:14px;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const orangeNextIcon = new L.DivIcon({
  className: "",
  html: '<div style="background:#f59e0b;border-radius:9999px;width:16px;height:16px;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function BusMap({
  line,
}: {
  line: BusLine;
  allLines: BusLine[];
}) {
  const center: [number, number] = [
    line.current_location.latitude,
    line.current_location.longitude,
  ];

  return (
    <MapContainer center={center} zoom={12} className="h-full w-full">
      {/* Light, slightly desaturated OSM tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <Marker position={center} icon={greenBusIcon}>
        <Popup>
          <div className="space-y-1">
            <div className="font-semibold">Bus {line.id}</div>
            <div className="text-xs">Status: {line.status}</div>
            <div className="text-xs">
              Next stop:{" "}
              {line.bus_stops.find((s) => s.is_next_stop)?.name ?? "N/A"}
            </div>
          </div>
        </Popup>
      </Marker>

      {line.bus_stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.latitude, stop.longitude]}
          icon={stop.is_next_stop ? orangeNextIcon : redStopIcon}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{stop.name}</div>
              <div className="text-xs">
                Next Bus Arrival Time: {stop.estimated_arrival}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
