import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Car, Navigation } from "lucide-react";

interface VehicleMarker {
  id: number;
  lat: number;
  lng: number;
  name: string;
  speed: number;
  status: "online" | "idle" | "offline";
}

const vehicles: VehicleMarker[] = [
  { id: 1, lat: 41.2995, lng: 69.2401, name: "Toyota Camry - 01A123BC", speed: 67, status: "online" },
  { id: 2, lat: 41.3111, lng: 69.2797, name: "Chevrolet Lacetti - 01B456CD", speed: 0, status: "idle" },
  { id: 3, lat: 39.6542, lng: 66.9597, name: "Isuzu NPR - 01C789EF", speed: 45, status: "online" },
];

interface TimelineSelectorProps {
  selectedHour: string;
  onHourChange: (hour: string) => void;
}

const TimelineSelector = ({ selectedHour, onHourChange }: TimelineSelectorProps) => {
  const hours = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 px-4">
      {hours.map((hour, i) => (
        <button
          key={i}
          onClick={() => {
            onHourChange(hour);
            toast.info(`Vaqt: ${hour}`);
          }}
          className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-lg transition-all ${
            selectedHour === hour
              ? "bg-primary text-primary-foreground"
              : hour === "14:00"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {hour}
        </button>
      ))}
    </div>
  );
};

export const MapVisualization = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(1);
  const [selectedHour, setSelectedHour] = useState("14:00");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      center: [41.2995, 69.2401],
      zoom: 6,
      zoomControl: false,
    });

    // Dark themed tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Custom vehicle icon
    const createVehicleIcon = (status: string, isSelected: boolean) => {
      const color = status === "online" ? "#22c55e" : status === "idle" ? "#eab308" : "#ef4444";
      const size = isSelected ? 40 : 30;
      
      return L.divIcon({
        html: `
          <div style="
            width: ${size}px; 
            height: ${size}px; 
            background: ${color}20;
            border: 2px solid ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isSelected ? '20px' : '10px'} ${color}80;
            transition: all 0.3s;
          ">
            <div style="
              width: ${size * 0.5}px;
              height: ${size * 0.5}px;
              background: ${color};
              border-radius: 50%;
            "></div>
          </div>
        `,
        className: 'custom-vehicle-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    // Add vehicle markers
    vehicles.forEach((vehicle) => {
      const marker = L.marker([vehicle.lat, vehicle.lng], {
        icon: createVehicleIcon(vehicle.status, selectedVehicle === vehicle.id),
      }).addTo(map);

      // Popup content
      const popupContent = `
        <div style="min-width: 180px; font-family: system-ui;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #22d3ee;">${vehicle.name}</div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Holat:</span>
              <span style="color: ${vehicle.status === 'online' ? '#22c55e' : vehicle.status === 'idle' ? '#eab308' : '#ef4444'};">
                ${vehicle.status === 'online' ? 'Faol' : vehicle.status === 'idle' ? 'Kutish' : "O'chiq"}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Tezlik:</span>
              <span style="color: #e2e8f0;">${vehicle.speed} km/s</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Koordinatalar:</span>
              <span style="color: #e2e8f0;">${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-popup',
      });

      marker.on('click', () => {
        toast.success(`Transport tanlandi`, {
          description: `${vehicle.name} - ${vehicle.speed} km/s`,
        });
      });
    });

    // Draw route between Tashkent and Samarkand
    const routeCoords: [number, number][] = [
      [41.2995, 69.2401], // Tashkent
      [40.7836, 68.6141], // Jizzax
      [39.6542, 66.9597], // Samarkand
    ];

    L.polyline(routeCoords, {
      color: '#22d3ee',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative flex-1 h-full min-h-[500px] rounded-lg overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Legend */}
      <div className="absolute left-4 top-4 z-[1000] glass-panel rounded-lg p-3 space-y-2">
        <div className="text-xs font-medium text-foreground mb-2">Transport holati</div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Faol</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Kutish</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">O'chiq</span>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute right-4 top-20 z-[1000] glass-panel rounded-lg p-3 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Jami:</span>
          <span className="font-medium">{vehicles.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">Faol:</span>
          <span className="font-medium text-green-500">{vehicles.filter(v => v.status === 'online').length}</span>
        </div>
      </div>

      {/* Chevron indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce z-[1000]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Timeline */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-2 z-[1000]">
        <TimelineSelector selectedHour={selectedHour} onHourChange={setSelectedHour} />
      </div>
    </div>
  );
};