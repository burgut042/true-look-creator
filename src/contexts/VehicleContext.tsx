import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { vehicleAPI } from '@/lib/api';
import {
  initializeSocket,
  disconnectSocket,
  subscribeToAllVehicles,
  onLocationUpdate,
  onVehicleStatus,
  onNewAlert,
  onNewVehicle,
  removeLocationUpdateListener,
  removeVehicleStatusListener,
  removeNewAlertListener,
  removeNewVehicleListener
} from '@/lib/socket';
import { toast } from 'sonner';

export interface Vehicle {
  id: number;
  name: string;
  plate_number: string;
  type: string;
  model?: string;
  year?: number;
  color?: string;
  status: 'online' | 'idle' | 'offline';
  battery?: number;
  driver?: {
    name: string;
    phone: string;
  } | null;
  location?: {
    lat: number;
    lng: number;
    speed: number;
    direction?: number;
  } | null;
  lastUpdate?: string;
  settings?: {
    enableGeofence: boolean;
    enableSpeedAlert: boolean;
    maxSpeed: number;
  };
}

interface Alert {
  id: number;
  type: string;
  message: string;
  severity: string;
  vehicle_id: number;
  created_at: string;
}

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  selectVehicle: (vehicle: Vehicle | null) => void;
  refreshVehicles: () => Promise<void>;
  updateVehicleLocation: (vehicleId: number, location: any) => void;
  updateVehicleStatus: (vehicleId: number, status: any) => void;
  addAlert: (alert: Alert) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within VehicleProvider');
  }
  return context;
};

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleAPI.getAll();
      const vehiclesData = response.data.vehicles || [];
      setVehicles(vehiclesData);
      console.log('✅ Vehicles loaded:', vehiclesData.length);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load vehicles';
      setError(errorMsg);
      console.error('❌ Error loading vehicles:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update vehicle location from socket
  const updateVehicleLocation = (vehicleId: number, locationData: any) => {
    console.log('🔄 Location update received:', vehicleId, locationData);

    setVehicles(prev => {
      const updated = prev.map(vehicle =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              location: {
                lat: locationData.latitude,
                lng: locationData.longitude,
                speed: locationData.speed || 0,
                direction: locationData.direction
              },
              status: locationData.status || vehicle.status,
              lastUpdate: locationData.recordedAt || new Date().toISOString()
            }
          : vehicle
      );
      console.log('✅ Vehicles updated, count:', updated.length);
      return updated;
    });

    // Update selected vehicle if it's the one being updated
    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle(prev =>
        prev
          ? {
              ...prev,
              location: {
                lat: locationData.latitude,
                lng: locationData.longitude,
                speed: locationData.speed || 0,
                direction: locationData.direction
              },
              status: locationData.status || prev.status,
              lastUpdate: locationData.recordedAt || new Date().toISOString()
            }
          : null
      );
    }
  };

  // Update vehicle status from socket
  const updateVehicleStatus = (vehicleId: number, statusData: any) => {
    setVehicles(prev =>
      prev.map(vehicle =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              status: statusData.status || vehicle.status,
              battery: statusData.battery !== undefined ? statusData.battery : vehicle.battery
            }
          : vehicle
      )
    );

    if (selectedVehicle?.id === vehicleId) {
      setSelectedVehicle(prev =>
        prev
          ? {
              ...prev,
              status: statusData.status || prev.status,
              battery: statusData.battery !== undefined ? statusData.battery : prev.battery
            }
          : null
      );
    }
  };

  // Add alert
  const addAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
    toast.error(alert.message, {
      description: new Date(alert.created_at).toLocaleString('uz-UZ')
    });
  };

  // Initialize socket and fetch data
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      // If no token, use demo mode with mock data
      console.warn('No access token found, using demo mode');
      setVehicles([
        {
          id: 1,
          name: "Toyota Camry",
          plate_number: "01A123BC",
          type: "car",
          status: "online",
          battery: 87,
          location: { lat: 41.3111, lng: 69.2797, speed: 67 }
        },
        {
          id: 2,
          name: "Chevrolet Lacetti",
          plate_number: "01B456CD",
          type: "car",
          status: "idle",
          battery: 95,
          location: { lat: 41.2856, lng: 69.2035, speed: 0 }
        },
        {
          id: 3,
          name: "Isuzu NPR",
          plate_number: "01C789EF",
          type: "truck",
          status: "online",
          battery: 72,
          location: { lat: 41.3337, lng: 69.2890, speed: 45 }
        }
      ] as Vehicle[]);
      setLoading(false);
      return;
    }

    // Fetch vehicles
    fetchVehicles();

    // Initialize socket connection
    const socket = initializeSocket();

    if (socket) {
      // Subscribe to all vehicles
      subscribeToAllVehicles();

      // Setup event listeners
      const handleLocationUpdate = (data: any) => {
        updateVehicleLocation(data.vehicleId, data);
      };

      const handleStatusUpdate = (data: any) => {
        updateVehicleStatus(data.vehicleId, data);
      };

      const handleNewAlert = (alert: any) => {
        addAlert(alert);
      };

      const handleNewVehicle = (data: any) => {
        console.log('🆕 New vehicle registered:', data);
        toast.success('Yangi qurilma qo\'shildi!', {
          description: `${data.name} tizimga ulandi`
        });
        // Refresh vehicles list to include the new vehicle
        fetchVehicles();
      };

      onLocationUpdate(handleLocationUpdate);
      onVehicleStatus(handleStatusUpdate);
      onNewAlert(handleNewAlert);
      onNewVehicle(handleNewVehicle);

      // Cleanup
      return () => {
        removeLocationUpdateListener(handleLocationUpdate);
        removeVehicleStatusListener(handleStatusUpdate);
        removeNewAlertListener(handleNewAlert);
        removeNewVehicleListener(handleNewVehicle);
        disconnectSocket();
      };
    }
  }, []);

  const selectVehicle = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  };

  const refreshVehicles = async () => {
    await fetchVehicles();
  };

  const value: VehicleContextType = {
    vehicles,
    selectedVehicle,
    alerts,
    loading,
    error,
    selectVehicle,
    refreshVehicles,
    updateVehicleLocation,
    updateVehicleStatus,
    addAlert
  };

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
};
