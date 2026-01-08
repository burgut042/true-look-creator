import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Car, Navigation, Shield, ShieldAlert, Maximize2, Minimize2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Yandex Maps API type declarations
declare global {
  interface Window {
    ymaps: any;
  }
}

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
  { id: 1, lat: 41.3111, lng: 69.2797, name: "Toyota Camry - 01A123BC", speed: 67, status: "online" },
  { id: 2, lat: 41.2856, lng: 69.2035, name: "Chevrolet Lacetti - 01B456CD", speed: 0, status: "idle" },
  { id: 3, lat: 41.3337, lng: 69.2890, name: "Isuzu NPR - 01C789EF", speed: 45, status: "online" },
];

// Geofences removed - using district boundaries from GeoJSON instead
const geofences: Geofence[] = [];

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
    onHoursChange(["01:00"]);
    toast.info("Tanlov tozalandi");
  };

  return (
    <div className="space-y-1">
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
  const mapInstanceRef = useRef<any>(null);
  const vehicleMarkerRefs = useRef<any[]>([]);
  const geofenceCircleRefs = useRef<any[]>([]);
  const routeRef = useRef<any>(null);
  const applyThemeRef = useRef<((dark: boolean) => void) | null>(null);
  const districtLayersRef = useRef<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(1);
  const [selectedHours, setSelectedHours] = useState<string[]>(["01:00"]);
  const [showGeofences, setShowGeofences] = useState(false);
  const [geofenceAlerts, setGeofenceAlerts] = useState<string[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapDarkMode, setMapDarkMode] = useState(false);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if vehicle is outside geofence
  const checkGeofenceViolation = (vehicle: VehicleMarker, geofence: Geofence): boolean => {
    const distance = calculateDistance(
      vehicle.lat,
      vehicle.lng,
      geofence.center[0],
      geofence.center[1]
    );
    return distance > geofence.radius;
  };

  // Check all vehicles against geofences
  useEffect(() => {
    if (!mapReady) return;

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
  }, [selectedHours, mapReady]);

  // Create custom vehicle icon HTML
  const createVehicleIconLayout = (status: string, isSelected: boolean, id: number) => {
    if (!window.ymaps) return null;

    const color = status === "online" ? "#22c55e" : status === "idle" ? "#eab308" : "#ef4444";
    const size = isSelected ? 40 : 30;

    return window.ymaps.templateLayoutFactory.createClass(
      `<div style="
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
        cursor: pointer;
      ">
        <div style="
          width: ${size * 0.5}px;
          height: ${size * 0.5}px;
          background: ${color};
          border-radius: 50%;
        "></div>
      </div>`,
      {
        build: function () {
          // @ts-ignore
          this.constructor.superclass.build.call(this);
        }
      }
    );
  };

  // Initialize Yandex Map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.ymaps) {
        console.log("Waiting for Yandex Maps API to load...");
        setTimeout(initMap, 500);
        return;
      }

      window.ymaps.ready(() => {
        try {
          if (mapInstanceRef.current) return;

        // Create map centered on Tashkent city
        const map = new window.ymaps.Map(mapRef.current, {
          center: [41.2995, 69.2401], // Toshkent shahar markazi
          zoom: 12,
          controls: []
        });

        // Apply dark theme if needed
        const applyTheme = (dark: boolean) => {
          try {
            const container = map.container.getElement();
            if (container && dark) {
              container.style.filter = 'invert(0.9) hue-rotate(180deg) brightness(0.9) contrast(1.1)';
            } else if (container) {
              container.style.filter = 'none';
            }
          } catch (e) {
            console.log('Theme applied');
          }
        };

        // Store applyTheme function in ref so we can use it from toggle button
        applyThemeRef.current = applyTheme;

        // Apply initial theme
        applyTheme(mapDarkMode);

        // Add zoom control
        const zoomControl = new window.ymaps.control.ZoomControl({
          options: {
            position: { right: 10, top: 10 }
          }
        });
        map.controls.add(zoomControl);

        // Add vehicle markers
        vehicles.forEach((vehicle) => {
          const iconLayout = createVehicleIconLayout(
            vehicle.status,
            selectedVehicle === vehicle.id,
            vehicle.id
          );

          if (!iconLayout) return;

          const placemark = new window.ymaps.Placemark(
            [vehicle.lat, vehicle.lng],
            {
              balloonContentHeader: `<div style="font-weight: 600; color: #22d3ee;">${vehicle.name}</div>`,
              balloonContentBody: `
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
              `,
              hintContent: vehicle.name
            },
            {
              iconLayout: iconLayout,
              iconShape: {
                type: 'Circle',
                coordinates: [0, 0],
                radius: selectedVehicle === vehicle.id ? 20 : 15
              }
            }
          );

          placemark.events.add('click', () => {
            setSelectedVehicle(vehicle.id);
            toast.success(`Transport tanlandi`, {
              description: `${vehicle.name} - ${vehicle.speed} km/s`,
            });
          });

          map.geoObjects.add(placemark);
          vehicleMarkerRefs.current.push(placemark);
        });

        // Draw route within Tashkent city
        const routeCoords: [number, number][] = [
          [41.2856, 69.2035], // Chilonzor
          [41.2995, 69.2401], // Toshkent markazi
          [41.3337, 69.2890], // Yunusobod
        ];

        const polyline = new window.ymaps.Polyline(
          routeCoords,
          {
            hintContent: "Chilonzor - Markaz - Yunusobod yo'nalishi"
          },
          {
            strokeColor: '#22d3ee',
            strokeWidth: 3,
            strokeStyle: '5 5',
            opacity: 0.7
          }
        );

        // map.geoObjects.add(polyline);
        // routeRef.current = polyline;

        // Load and display Tashkent city districts from GeoJSON
        fetch('/tuman_4326.geojson')
          .then(response => response.json())
          .then(geojsonData => {
            // Faqat Toshkent shahridagi tumanlar
            const tashkentDistricts = [
              'Bektemir tumani',
              'Chilonzor tumani',
              'Mirobod tumani',
              'Mirzo ulug‘bek tumani',
              'Olmazor tumani',
              'Shayxontohur tumani',
              'Uchtepa tumani',
              'Yakkasaroy tumani',
              'Yashnobod tumani',
              'Yunusobod tumani',
              'Sergeli tumani',
              'Yangihayot tumani'
            ];

            // Har bir tuman uchun turli shaffof ranglar
            const districtColors = [
              '#FF6B6B30', '#4ECDC430', '#45B7D130', '#FFA07A30', '#98D8C830',
              '#F7DC6F30', '#BB8FCE30', '#85C1E930', '#F8B88B30', '#ABEBC630',
              '#FAD7A030', '#D7BDE230', '#A9CCE330', '#F9E79F30', '#D98AAD30',
              '#AED6F130', '#F5B7B130', '#B2DFDB30', '#C5CAE930', '#FFB6C130', '#A8E6CF30'
            ];

            // Chegaralar rangi
            const borderColors = [
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
              '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B88B', '#ABEBC6',
              '#FAD7A0', '#D7BDE2', '#A9CCE3', '#F9E79F', '#D98AAD',
              '#AED6F1', '#F5B7B1', '#B2DFDB', '#C5CAE9', '#FFB6C1', '#A8E6CF'
            ];

            // Filter only Tashkent city and nearby districts
            const tashkentFeatures = geojsonData.features.filter((feature: any) =>
              tashkentDistricts.includes(feature.properties.district)
            );

            // Add each district boundary to map
            tashkentFeatures.forEach((feature: any, index: number) => {
              const coordinates = feature.geometry.coordinates;
              const fillColor = districtColors[index % districtColors.length];
              const strokeColor = borderColors[index % borderColors.length];

              // Handle MultiPolygon
              coordinates.forEach((polygon: any) => {
                const polygonCoords = polygon[0].map((coord: any) => [coord[1], coord[0]]);

                const polygonObject = new window.ymaps.Polygon(
                  [polygonCoords],
                  {
                    hintContent: feature.properties.district,
                    balloonContent: `<div style="font-family: system-ui;">
                      <div style="font-weight: 600; color: ${strokeColor}; margin-bottom: 4px;">${feature.properties.district}</div>
                      <div style="font-size: 11px; color: #94a3b8;">Toshkent hududi</div>
                    </div>`
                  },
                  {
                    fillColor: fillColor,
                    strokeColor: strokeColor,
                    strokeWidth: 3
                  }
                );

                // Add click event to focus on district and remove fill color
                polygonObject.events.add('click', (e: any) => {
                  e.preventDefault();

                  // Remove fill color from clicked polygon
                  polygonObject.options.set('fillColor', '#00000000');

                  // Focus on district
                  const bounds = polygonObject.geometry.getBounds();
                  map.setBounds(bounds, {
                    checkZoomRange: true,
                    duration: 500
                  });

                  toast.info(feature.properties.district, {
                    description: 'Tumanga fokus berildi'
                  });
                });

                map.geoObjects.add(polygonObject);
                districtLayersRef.current.push(polygonObject);
              });
            });

            toast.success("Tuman chegaralari yuklandi", {
              description: `${tashkentFeatures.length} ta tuman ko'rsatildi`
            });
          })
          .catch(error => {
            console.error('Error loading GeoJSON:', error);
            toast.error("Tuman chegaralarini yuklab bo'lmadi");
          });

        // Geofence circles removed - using district boundaries instead

        mapInstanceRef.current = map;
        setMapReady(true);

        // Watch for global theme changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && mapInstanceRef.current) {
              const isDarkNow = document.documentElement.classList.contains('dark');
              setMapDarkMode(isDarkNow);
              applyTheme(isDarkNow);
            }
          });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => {
          observer.disconnect();
        };
        } catch (error) {
          console.error("Error initializing Yandex Maps:", error);
          toast.error("Xarita yuklanishda xatolik", {
            description: "Iltimos, sahifani yangilang."
          });
        }
      });
    };

    // Initialize map after a short delay to ensure API is loaded
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        // Clear district layers
        districtLayersRef.current.forEach(layer => {
          try {
            mapInstanceRef.current.geoObjects.remove(layer);
          } catch (e) {
            console.log('Layer already removed');
          }
        });
        districtLayersRef.current = [];

        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Toggle geofence visibility
  useEffect(() => {
    if (!mapReady) return;

    geofenceCircleRefs.current.forEach(circle => {
      if (showGeofences) {
        circle.options.set('opacity', 1);
        circle.options.set('fillOpacity', 0.2);
      } else {
        circle.options.set('opacity', 0);
        circle.options.set('fillOpacity', 0);
      }
    });
  }, [showGeofences, mapReady]);

  // Update vehicle marker when selection changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    // Recreate vehicle markers with updated selection
    vehicleMarkerRefs.current.forEach(marker => {
      mapInstanceRef.current.geoObjects.remove(marker);
    });
    vehicleMarkerRefs.current = [];

    vehicles.forEach((vehicle) => {
      const iconLayout = createVehicleIconLayout(
        vehicle.status,
        selectedVehicle === vehicle.id,
        vehicle.id
      );

      if (!iconLayout) return;

      const placemark = new window.ymaps.Placemark(
        [vehicle.lat, vehicle.lng],
        {
          balloonContentHeader: `<div style="font-weight: 600; color: #22d3ee;">${vehicle.name}</div>`,
          balloonContentBody: `
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
          `,
          hintContent: vehicle.name
        },
        {
          iconLayout: iconLayout,
          iconShape: {
            type: 'Circle',
            coordinates: [0, 0],
            radius: selectedVehicle === vehicle.id ? 20 : 15
          }
        }
      );

      placemark.events.add('click', () => {
        setSelectedVehicle(vehicle.id);
        toast.success(`Transport tanlandi`, {
          description: `${vehicle.name} - ${vehicle.speed} km/s`,
        });
      });

      mapInstanceRef.current.geoObjects.add(placemark);
      vehicleMarkerRefs.current.push(placemark);
    });
  }, [selectedVehicle, mapReady]);

  return (
    <div className={`relative flex-1 h-full min-h-[500px] rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : ''}`}>
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Fullscreen and theme toggle */}
      <div className="absolute right-4 top-4 z-[1000] flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newDarkMode = !mapDarkMode;
            setMapDarkMode(newDarkMode);
            if (applyThemeRef.current) {
              applyThemeRef.current(newDarkMode);
            }
            toast.info(newDarkMode ? "Tun rejimi yoqildi" : "Kun rejimi yoqildi");
          }}
          className="glass-panel border-border/50 hover:bg-accent"
          title={mapDarkMode ? "Kun rejimiga o'tish" : "Tun rejimiga o'tish"}
        >
          {mapDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFullscreen}
          className="glass-panel border-border/50 hover:bg-accent"
          title={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Legend - hide in fullscreen for cleaner view */}
      {!isFullscreen && (
        <div className="absolute right-1 bottom-20 z-[1000] glass-panel rounded-lg p-3 space-y-2">
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
      <div className={`absolute ${isFullscreen ? 'left-1 top-1' : 'left-1 top-1'} z-[1000] glass-panel rounded-lg p-3 space-y-2`}>
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
