import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Car, Navigation, Shield, ShieldAlert, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleMarker {
  id: number;
  lat: number;
  lng: number;
  name: string;
  speed: number;
  status: "online" | "idle" | "offline";
}

interface Geofence {
  id: number;
  name: string;
  center: [number, number];
  radius: number;
  active: boolean;
}

const vehicles: VehicleMarker[] = [
  { id: 1, lat: 41.2995, lng: 69.2401, name: "Toyota Camry - 01A123BC", speed: 67, status: "online" },
  { id: 2, lat: 41.3111, lng: 69.2797, name: "Chevrolet Lacetti - 01B456CD", speed: 0, status: "idle" },
  { id: 3, lat: 39.6542, lng: 66.9597, name: "Isuzu NPR - 01C789EF", speed: 45, status: "online" },
];

const geofences: Geofence[] = [
  { id: 1, name: "Toshkent hududi", center: [41.2995, 69.2401], radius: 15000, active: true },
  { id: 2, name: "Samarqand hududi", center: [39.6542, 66.9597], radius: 10000, active: true },
];

interface TimelineSelectorProps {
  selectedHours: string[];
  onHoursChange: (hours: string[]) => void;
}

const TimelineSelector = ({ selectedHours, onHoursChange }: TimelineSelectorProps) => {
  const hours = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  const toggleHour = (hour: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl/Cmd
      if (selectedHours.includes(hour)) {
        const newHours = selectedHours.filter(h => h !== hour);
        onHoursChange(newHours.length > 0 ? newHours : [hour]);
      } else {
        onHoursChange([...selectedHours, hour]);
      }
    } else if (e.shiftKey && selectedHours.length > 0) {
      // Range select with Shift
      const lastSelected = selectedHours[selectedHours.length - 1];
      const lastIndex = hours.indexOf(lastSelected);
      const currentIndex = hours.indexOf(hour);
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const rangeHours = hours.slice(start, end + 1);
      const uniqueHours = [...new Set([...selectedHours, ...rangeHours])];
      onHoursChange(uniqueHours);
    } else {
      // Single select
      onHoursChange([hour]);
    }
    
    if (selectedHours.includes(hour) && !e.ctrlKey && !e.metaKey) {
      toast.info(`Vaqt: ${hour}`);
    } else {
      const count = e.ctrlKey || e.metaKey || e.shiftKey 
        ? (selectedHours.includes(hour) ? selectedHours.length - 1 : selectedHours.length + 1)
        : 1;
      toast.info(`${count} ta soat tanlandi`);
    }
  };

  const clearSelection = () => {
    onHoursChange(["14:00"]);
    toast.info("Tanlov tozalandi");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-4">
        <div className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">{selectedHours.length}</span> ta soat tanlangan
          <span className="ml-2 opacity-60">(Ctrl+click - ko'p tanlash, Shift+click - diapazon)</span>
        </div>
        {selectedHours.length > 1 && (
          <button
            onClick={clearSelection}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Tozalash
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-2 px-4">
        {hours.map((hour, i) => {
          const isSelected = selectedHours.includes(hour);
          return (
            <button
              key={i}
              onClick={(e) => toggleHour(hour, e)}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-lg transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {hour}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface MapVisualizationProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MapVisualization = ({ isFullscreen = false, onToggleFullscreen }: MapVisualizationProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geofenceLayersRef = useRef<L.Circle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(1);
  const [selectedHours, setSelectedHours] = useState<string[]>(["14:00"]);
  const [showGeofences, setShowGeofences] = useState(true);
  const [geofenceAlerts, setGeofenceAlerts] = useState<string[]>([]);

  // Check if vehicle is outside geofence
  const checkGeofenceViolation = (vehicle: VehicleMarker, geofence: Geofence): boolean => {
    const distance = mapInstanceRef.current?.distance(
      [vehicle.lat, vehicle.lng],
      geofence.center
    ) || 0;
    return distance > geofence.radius;
  };

  // Check all vehicles against geofences
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const alerts: string[] = [];
    vehicles.forEach(vehicle => {
      geofences.forEach(geofence => {
        if (geofence.active && checkGeofenceViolation(vehicle, geofence)) {
          alerts.push(`${vehicle.name} - ${geofence.name} dan tashqarida!`);
        }
      });
    });
    
    setGeofenceAlerts(alerts);
    
    // Show toast for violations
    if (alerts.length > 0) {
      toast.warning("Geofence ogohlantirish!", {
        description: `${alerts.length} ta transport chegaradan tashqarida`,
      });
    }
  }, [selectedHours]); // Re-check when time changes

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      center: [41.2995, 69.2401],
      zoom: 6,
      zoomControl: false,
    });

    // Check if dark mode
    const isDark = document.documentElement.classList.contains('dark');
    
    // Select tile layer based on theme
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
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

    // Add geofence circles
    geofences.forEach((geofence) => {
      const circle = L.circle(geofence.center, {
        radius: geofence.radius,
        color: '#8b5cf6',
        fillColor: '#8b5cf680',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
      
      circle.bindPopup(`
        <div style="font-family: system-ui; min-width: 120px;">
          <div style="font-weight: 600; color: #8b5cf6; margin-bottom: 4px;">${geofence.name}</div>
          <div style="font-size: 12px; color: #94a3b8;">Radius: ${(geofence.radius / 1000).toFixed(1)} km</div>
        </div>
      `);
      
      geofenceLayersRef.current.push(circle);
    });

    mapInstanceRef.current = map;

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && mapInstanceRef.current && tileLayerRef.current) {
          const isDarkNow = document.documentElement.classList.contains('dark');
          const newTileUrl = isDarkNow
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
          
          tileLayerRef.current.setUrl(newTileUrl);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Toggle geofence visibility
  useEffect(() => {
    geofenceLayersRef.current.forEach(layer => {
      if (showGeofences) {
        layer.setStyle({ opacity: 1, fillOpacity: 0.2 });
      } else {
        layer.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    });
  }, [showGeofences]);

  return (
    <div className={`relative flex-1 h-full min-h-[500px] rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : ''}`}>
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Fullscreen toggle */}
      <div className="absolute right-4 top-4 z-[1000] flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFullscreen}
          className="glass-panel border-border/50 hover:bg-accent"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Legend - hide in fullscreen for cleaner view */}
      {!isFullscreen && (
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
      )}

      {/* Geofence Controls */}
      <div className={`absolute ${isFullscreen ? 'left-4 top-4' : 'left-4 top-36'} z-[1000] glass-panel rounded-lg p-3 space-y-2`}>
        <div className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-500" />
          Geo-chegara
        </div>
        <Button
          variant={showGeofences ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShowGeofences(!showGeofences);
            toast.info(showGeofences ? "Geo-chegaralar yashirildi" : "Geo-chegaralar ko'rsatildi");
          }}
          className="w-full text-xs"
        >
          {showGeofences ? "Yashirish" : "Ko'rsatish"}
        </Button>
        {geofenceAlerts.length > 0 && (
          <div className="mt-2 p-2 bg-destructive/20 rounded border border-destructive/50">
            <div className="flex items-center gap-1 text-xs text-destructive">
              <ShieldAlert className="w-3 h-3" />
              <span>{geofenceAlerts.length} ta ogohlantirish</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={`absolute ${isFullscreen ? 'right-16' : 'right-4'} top-16 z-[1000] glass-panel rounded-lg p-3 space-y-2 text-xs`}>
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

      {/* Geofence Alerts Panel - shown in fullscreen */}
      {isFullscreen && geofenceAlerts.length > 0 && (
        <div className="absolute left-4 bottom-24 z-[1000] glass-panel rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-destructive mb-2">
            <ShieldAlert className="w-4 h-4" />
            Geofence ogohlantirishlari
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {geofenceAlerts.map((alert, i) => (
              <div key={i} className="text-xs text-muted-foreground bg-destructive/10 rounded px-2 py-1">
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chevron indicator */}
      {!isFullscreen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce z-[1000]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}

      {/* Timeline */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-2 z-[1000]">
        <TimelineSelector selectedHours={selectedHours} onHoursChange={setSelectedHours} />
      </div>

      {/* ESC hint in fullscreen */}
      {isFullscreen && (
        <div className="absolute bottom-4 right-4 z-[1000] text-xs text-muted-foreground glass-panel rounded px-2 py-1">
          ESC yoki <Minimize2 className="w-3 h-3 inline" /> tugmasini bosing
        </div>
      )}
    </div>
  );
};