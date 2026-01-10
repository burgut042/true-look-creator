import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const initializeSocket = () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.warn('No access token found, cannot connect to socket');
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to GPS Tracking server');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });

  socket.on('connection:success', (data) => {
    console.log('Connection success:', data);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Subscribe to a specific vehicle
export const subscribeToVehicle = (vehicleId: number) => {
  if (socket && socket.connected) {
    socket.emit('subscribe:vehicle', vehicleId);
    console.log(`Subscribed to vehicle ${vehicleId}`);
  }
};

// Unsubscribe from a vehicle
export const unsubscribeFromVehicle = (vehicleId: number) => {
  if (socket && socket.connected) {
    socket.emit('unsubscribe:vehicle', vehicleId);
    console.log(`Unsubscribed from vehicle ${vehicleId}`);
  }
};

// Subscribe to all vehicles
export const subscribeToAllVehicles = () => {
  if (socket && socket.connected) {
    socket.emit('subscribe:all');
    console.log('Subscribed to all vehicles');
  }
};

// Event listeners
export const onLocationUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('location:update', callback);
  }
};

export const onVehicleStatus = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('vehicle:status', callback);
  }
};

export const onNewAlert = (callback: (alert: any) => void) => {
  if (socket) {
    socket.on('alert:new', callback);
  }
};

export const onNewVehicle = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('vehicle:new', callback);
  }
};

export const onTripStarted = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('trip:started', callback);
  }
};

export const onTripEnded = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('trip:ended', callback);
  }
};

// Remove event listeners
export const removeLocationUpdateListener = (callback: (data: any) => void) => {
  if (socket) {
    socket.off('location:update', callback);
  }
};

export const removeVehicleStatusListener = (callback: (data: any) => void) => {
  if (socket) {
    socket.off('vehicle:status', callback);
  }
};

export const removeNewAlertListener = (callback: (alert: any) => void) => {
  if (socket) {
    socket.off('alert:new', callback);
  }
};

export const removeNewVehicleListener = (callback: (data: any) => void) => {
  if (socket) {
    socket.off('vehicle:new', callback);
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  subscribeToVehicle,
  unsubscribeFromVehicle,
  subscribeToAllVehicles,
  onLocationUpdate,
  onVehicleStatus,
  onNewAlert,
  onNewVehicle,
  onTripStarted,
  onTripEnded,
  removeLocationUpdateListener,
  removeVehicleStatusListener,
  removeNewAlertListener,
  removeNewVehicleListener
};
