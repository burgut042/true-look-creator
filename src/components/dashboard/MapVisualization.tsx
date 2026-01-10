import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Car, Navigation, Shield, ShieldAlert, Maximize2, Minimize2, Sun, Moon, ZoomIn, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVehicles } from "@/contexts/VehicleContext";

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
  // Get vehicles from context
  const { vehicles: vehiclesFromContext, loading: vehiclesLoading, selectedVehicleId: selectedVehicleIdFromContext, selectVehicle } = useVehicles();

  // Map vehicles to VehicleMarker format
  const vehicles: VehicleMarker[] = vehiclesFromContext
    .filter(v => v.location && v.location.lat && v.location.lng)
    .map(v => ({
      id: v.id,
      lat: v.location!.lat,
      lng: v.location!.lng,
      name: `${v.name} - ${v.plate_number}`,
      speed: v.location!.speed || 0,
      status: v.status
    }));

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const vehicleMarkerRefs = useRef<any[]>([]);
  const geofenceCircleRefs = useRef<any[]>([]);
  const routeRef = useRef<any>(null);
  const applyThemeRef = useRef<((dark: boolean) => void) | null>(null);
  const districtLayersRef = useRef<any[]>([]);
  const vehicleTrajectories = useRef<Map<number, { polyline: any; coords: [number, number][] }>>(new Map());
  const selectedVehicleId = selectedVehicleIdFromContext?.id || null;
  const [selectedHours, setSelectedHours] = useState<string[]>(["01:00"]);
  const [showGeofences, setShowGeofences] = useState(false);
  const [geofenceAlerts, setGeofenceAlerts] = useState<string[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapDarkMode, setMapDarkMode] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);

  // Markerga fokus berish funksiyasi - BALLON O'CHIRILDI
  const focusOnMarker = useCallback((vehicleId: number) => {
    if (!mapInstanceRef.current || !window.ymaps || isFocusing) {
      console.log("Focus skipped: map not ready or already focusing");
      return;
    }
    
    setIsFocusing(true);
    
    // Vehicle'ni topish
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      toast.warning("Transport topilmadi");
      setIsFocusing(false);
      return;
    }
    
    const coordinates = [vehicle.lat, vehicle.lng];
    const map = mapInstanceRef.current;
    
    console.log("Focusing on marker:", vehicle.name, coordinates);
    
    try {
      // Oddiy centrlash (animatsiyasiz)
      map.setCenter(coordinates, 16, {
        duration: 600,
        timingFunction: 'ease-in-out'
      });
      
      // Markerni kattalashtirish
      const markerIndex = vehicles.findIndex(v => v.id === vehicleId);
      const marker = vehicleMarkerRefs.current[markerIndex];
      
      if (marker) {
        const isSelected = selectedVehicleId === vehicleId;
        const newRadius = 25; // Kattalashtirilgan radius
        
        // Kattalashtirish
        marker.options.set({
          iconShape: {
            type: 'Circle',
            coordinates: [0, 0],
            radius: newRadius
          }
        });
        
        // 2 soniyadan so'ng original o'lchamga qaytarish
        setTimeout(() => {
          if (marker) {
            const originalRadius = isSelected ? 22 : 17;
            marker.options.set({
              iconShape: {
                type: 'Circle',
                coordinates: [0, 0],
                radius: originalRadius
              }
            });
          }
        }, 2000);
        
        // BALLOON O'CHIRILDI - xatoni oldini olish uchun
        // setTimeout(() => {
        //   try {
        //     marker.balloon.open();
        //   } catch (e) {
        //     console.log("Balloon ochishda xatolik:", e);
        //   }
        // }, 300);
      }
      
      toast.success(`${vehicle.name} markazlashtirildi`, {
        description: `Tezlik: ${vehicle.speed} km/s`,
        icon: <Target className="w-4 h-4" />,
      });
      
    } catch (error) {
      console.error("Focus error:", error);
    } finally {
      setTimeout(() => setIsFocusing(false), 1000);
    }
  }, [vehicles, selectedVehicleId, isFocusing]);

  // Barcha transportlarga fokus berish
  const focusOnAllVehicles = useCallback(() => {
    if (!mapInstanceRef.current || vehicles.length === 0) {
      toast.warning("Transportlar mavjud emas");
      return;
    }
    
    const map = mapInstanceRef.current;
    const coordinates = vehicles.map(v => [v.lat, v.lng] as [number, number]);
    
    if (coordinates.length === 1) {
      // Agar faqat bitta transport bo'lsa, unga fokus berish
      focusOnMarker(vehicles[0].id);
      return;
    }
    
    try {
      // Barcha transportlar uchun bounds hisoblash
      const bounds = window.ymaps.util.bounds.fromPoints(coordinates);
      
      map.setBounds(bounds, {
        checkZoomRange: true,
        duration: 800
      });
      
      toast.info("Barcha transportlar ko'rsatildi", {
        description: `${vehicles.length} ta transport xaritada markazlashtirildi`
      });
    } catch (error) {
      console.error("Focus all error:", error);
      // Fallback: birinchi transportga fokus
      if (vehicles.length > 0) {
        focusOnMarker(vehicles[0].id);
      }
    }
  }, [vehicles, focusOnMarker]);

  // Tanlangan transport o'zgarganda avtomatik fokus berish
  useEffect(() => {
    if (selectedVehicleId && mapReady) {
      // Kichik kechikish bilan fokus berish
      setTimeout(() => {
        focusOnMarker(selectedVehicleId);
      }, 300);
    }
  }, [selectedVehicleId, mapReady, focusOnMarker]);

  // Get vehicle type from vehiclesFromContext
  const getVehicleType = (vehicleId: number): string => {
    const vehicle = vehiclesFromContext.find(v => v.id === vehicleId);
    return vehicle?.type || 'car';
  };

  // Create custom vehicle/person icon HTML
  const createVehicleIconLayout = (status: string, isSelected: boolean, id: number) => {
    if (!window.ymaps) return null;

    const color = status === "online" ? "#22c55e" : status === "idle" ? "#eab308" : "#ef4444";
    const size = isSelected ? 44 : 34;
    const vehicleType = getVehicleType(id);

    // Different icons for different types
    const isPerson = vehicleType === 'person';
    const isBicycle = vehicleType === 'bicycle';
    const isScooter = vehicleType === 'scooter';

    // Icon SVG
    let iconSvg = '';
    if (isPerson) {
      // Person icon
      iconSvg = `<svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="${color}">
        <circle cx="12" cy="6" r="3"/>
        <path d="M12 10c-3 0-5 2-5 5v6h2v-6c0-1.5 1-3 3-3s3 1.5 3 3v6h2v-6c0-3-2-5-5-5z"/>
      </svg>`;
    } else if (isBicycle) {
      // Bicycle icon
      iconSvg = `<svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/>
        <path d="M12 5l3 3M8 11l4 7 4-7"/>
      </svg>`;
    } else if (isScooter) {
      // Scooter icon
      iconSvg = `<svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
        <circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
        <path d="M9 19h6M12 5v10M14 7l-4-2"/>
      </svg>`;
    } else {
      // Default vehicle icon (circle)
      iconSvg = `<div style="width: ${size * 0.5}px; height: ${size * 0.5}px; background: ${color}; border-radius: 50%;"></div>`;
    }

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
        box-shadow: 0 0 ${isSelected ? '24px' : '12px'} ${color}80;
        transition: all 0.3s;
        cursor: pointer;
        position: relative;
      ">
        ${iconSvg}
        ${isSelected ? `<div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          background: ${color};
          border-radius: 50%;
          border: 2px solid white;
          animation: ping 1s infinite;
        "></div>` : ''}
      </div>
      <style>
        @keyframes ping {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      </style>`,
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

        // Clear trajectories
        vehicleTrajectories.current.forEach((trajectory) => {
          try {
            mapInstanceRef.current.geoObjects.remove(trajectory.polyline);
          } catch (e) {
            console.log('Trajectory already removed');
          }
        });
        vehicleTrajectories.current.clear();

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

  // Update vehicle markers and trajectories
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    console.log('🗺️ Map updating with vehicles:', vehicles.length);

    // Recreate vehicle markers with updated selection
    vehicleMarkerRefs.current.forEach(marker => {
      try {
        mapInstanceRef.current.geoObjects.remove(marker);
      } catch (e) {
        console.log('Marker already removed');
      }
    });
    vehicleMarkerRefs.current = [];

    vehicles.forEach((vehicle, index) => {
      console.log('📍 Adding marker for:', vehicle.name);
      const iconLayout = createVehicleIconLayout(
        vehicle.status,
        selectedVehicleId === vehicle.id,
        vehicle.id
      );

      if (!iconLayout) return;

      // Oddiy Placemark yaratish - balloon options'larini kamaytirish
      const placemark = new window.ymaps.Placemark(
        [vehicle.lat, vehicle.lng],
        {
          // Balloon content'ni oddiy qilish
          balloonContentHeader: `<div style="font-weight: 600; color: #22d3ee; font-size: 14px;">${vehicle.name}</div>`,
          balloonContentBody: `
            <div style="font-size: 12px;">
              <div><strong>Holat:</strong> ${vehicle.status === 'online' ? 'Faol' : vehicle.status === 'idle' ? 'Kutish' : "O'chiq"}</div>
              <div><strong>Tezlik:</strong> ${vehicle.speed} km/s</div>
              <div><strong>Koordinatalar:</strong> ${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}</div>
            </div>
          `,
          hintContent: `${vehicle.name} - ${vehicle.speed} km/s`
        },
        {
          iconLayout: iconLayout,
          iconShape: {
            type: 'Circle',
            coordinates: [0, 0],
            radius: selectedVehicleId === vehicle.id ? 22 : 17
          },
          // Minimal balloon options
          balloonCloseButton: false,
          balloonAutoPan: false,
          openBalloonOnClick: false, // Avtomatik balloon ochilishini o'chirish
          hideIconOnBalloonOpen: false,
          balloonPanelMaxMapArea: 0,
          balloonShadow: false,
          balloonLayout: window.ymaps.templateLayoutFactory.createClass(
            '<div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 200px;">$[properties.balloonContent]</div>'
          )
        }
      );

      // Oddiy click event - FAKAT FOCUS UCHUN
      const handleMarkerClick = () => {
        console.log('Marker clicked:', vehicle.id, vehicle.name);
        
        const fullVehicle = vehiclesFromContext.find(v => v.id === vehicle.id);
        if (fullVehicle) {
          selectVehicle(fullVehicle);
          
          // Markerga focus berish
          setTimeout(() => {
            focusOnMarker(vehicle.id);
          }, 100);
          
          toast.success(`Transport tanlandi`, {
            description: `${vehicle.name} - ${vehicle.speed} km/s`,
          });
        }
      };

      // Click event'ni qo'shish
      placemark.events.add('click', handleMarkerClick);

      // Placemark'ni xaritaga qo'shish
      mapInstanceRef.current.geoObjects.add(placemark);
      
      // Marker'ni array'ga saqlash
      vehicleMarkerRefs.current[index] = placemark;

      // Update trajectory for this vehicle
      updateVehicleTrajectory(vehicle);
    });
  }, [selectedVehicleId, vehicles, mapReady]);

  // Function to update vehicle trajectory with professional styling
  const updateVehicleTrajectory = (vehicle: VehicleMarker) => {
    if (!mapInstanceRef.current || !window.ymaps) return;

    const map = mapInstanceRef.current;
    const vehicleId = vehicle.id;
    const newCoord: [number, number] = [vehicle.lat, vehicle.lng];
    const vehicleType = getVehicleType(vehicleId);

    console.log('🛣️ updateVehicleTrajectory called for:', vehicle.name, 'at:', newCoord);

    // Get or create trajectory for this vehicle
    let trajectory = vehicleTrajectories.current.get(vehicleId);

    if (!trajectory) {
      console.log('✨ Creating NEW trajectory for:', vehicle.name);
      // Create new trajectory with professional styling
      const color = vehicle.status === 'online' ? '#22c55e' : vehicle.status === 'idle' ? '#eab308' : '#ef4444';

      // Different stroke width for different types
      const strokeWidth = vehicleType === 'person' ? 4 : vehicleType === 'bicycle' || vehicleType === 'scooter' ? 3 : 4;

      const polyline = new window.ymaps.Polyline(
        [newCoord],
        {
          hintContent: `${vehicle.name} - Harakat trayektoriyasi`,
          balloonContent: `
            <div style="font-family: system-ui; padding: 4px;">
              <div style="font-weight: 600; color: ${color}; margin-bottom: 4px;">${vehicle.name}</div>
              <div style="font-size: 11px; color: #666;">
                ${vehicleType === 'person' ? '🚶 Shaxs' :
                  vehicleType === 'bicycle' ? '🚴 Velosiped' :
                  vehicleType === 'scooter' ? '🛴 Skuter' : '🚗 Transport'}
              </div>
              <div style="font-size: 11px; color: #666; margin-top: 4px;">
                Nuqtalar: <span style="font-weight: 600;">1</span>
              </div>
            </div>
          `
        },
        {
          strokeColor: color,
          strokeWidth: strokeWidth,
          strokeOpacity: selectedVehicleId === vehicleId ? 0.85 : 0.5,
          strokeStyle: selectedVehicleId === vehicleId ? 'solid' : 'dot',
          zIndex: selectedVehicleId === vehicleId ? 1000 : 100
        }
      );

      map.geoObjects.add(polyline);

      trajectory = {
        polyline,
        coords: [newCoord]
      };

      vehicleTrajectories.current.set(vehicleId, trajectory);
      console.log('✅ New trajectory created with 1 point');
    } else {
      console.log('🔄 Updating EXISTING trajectory for:', vehicle.name);
      // Update existing trajectory
      const { polyline, coords } = trajectory;

      console.log('📊 Current coords count:', coords.length, 'Last coord:', coords[coords.length - 1], 'New coord:', newCoord);

      // Add all coordinates without validation - show complete trajectory
      coords.push(newCoord);
      console.log('➕ Pushed new coord! Total coords now:', coords.length);

      // Keep last 200 points for persons, 150 for vehicles
      const maxPoints = vehicleType === 'person' ? 200 : 150;
      if (coords.length > maxPoints) {
        coords.shift();
        console.log('🗑️ Removed oldest point, keeping last', maxPoints);
      }

      // Update polyline geometry
      polyline.geometry.setCoordinates(coords);
      console.log('🎨 Polyline geometry updated with', coords.length, 'points');

      // Update color and styling based on status
      const color = vehicle.status === 'online' ? '#22c55e' : vehicle.status === 'idle' ? '#eab308' : '#ef4444';

      // Update balloon content with point count
      polyline.properties.set('balloonContent', `
        <div style="font-family: system-ui; padding: 4px;">
          <div style="font-weight: 600; color: ${color}; margin-bottom: 4px;">${vehicle.name}</div>
          <div style="font-size: 11px; color: #666;">
            ${vehicleType === 'person' ? '🚶 Shaxs' :
              vehicleType === 'bicycle' ? '🚴 Velosiped' :
              vehicleType === 'scooter' ? '🛴 Skuter' : '🚗 Transport'}
          </div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">
            Nuqtalar: <span style="font-weight: 600;">${coords.length}</span>
          </div>
          <div style="font-size: 10px; color: #999; margin-top: 2px;">
            Tezlik: ${vehicle.speed} km/h
          </div>
        </div>
      `);

      // Update polyline color
      polyline.options.set('strokeColor', color);

      // Update stroke width for different types
      const strokeWidth = vehicleType === 'person' ? 4 : vehicleType === 'bicycle' || vehicleType === 'scooter' ? 3 : 4;
      polyline.options.set('strokeWidth', strokeWidth);

      // Update styling based on selection
      polyline.options.set('strokeOpacity', selectedVehicleId === vehicleId ? 0.85 : 0.5);
      polyline.options.set('strokeStyle', selectedVehicleId === vehicleId ? 'solid' : 'dot');
      polyline.options.set('zIndex', selectedVehicleId === vehicleId ? 1000 : 100);
    }
  };

  return (
    <div className={`relative flex-1 h-full min-h-[500px] rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : ''}`}>
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Controls panel */}
      <div className="absolute right-4 top-4 z-[1000] flex gap-2">
        {/* Barcha transportlarga fokus tugmasi */}
        <Button
          variant="outline"
          size="icon"
          onClick={focusOnAllVehicles}
          className="glass-panel border-border/50 hover:bg-accent"
          title="Barcha transportlarni ko'rsatish"
          disabled={vehicles.length === 0 || isFocusing}
        >
          <Target className="w-4 h-4" />
        </Button>

        {/* Theme toggle */}
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
          disabled={isFocusing}
        >
          {mapDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        {/* Fullscreen toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFullscreen}
          className="glass-panel border-border/50 hover:bg-accent"
          title={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
          disabled={isFocusing}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Focus hint panel */}
      {!isFullscreen && (
        <div className="absolute left-4 top-16 z-[1000] glass-panel rounded-lg p-3 max-w-xs">
          <div className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Fokus berish
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Marker'ga bosing - mashinaga fokus</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Avtomatik - transport tanlanganda</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Target tugmasi - barchasini ko'rish</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend - hide in fullscreen for cleaner view */}
      {!isFullscreen && (
        <div className="absolute right-1 bottom-20 z-[1000] glass-panel rounded-lg p-3 space-y-2">
          <div className="text-xs font-medium text-foreground mb-2">Holat</div>
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
          <div className="border-t border-border/50 my-2" />
          <div className="text-xs font-medium text-foreground mb-1">Tur</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">🚗 Transport</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">🚶 Shaxs</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">🚴 Velosiped</span>
          </div>
        </div>
      )}

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