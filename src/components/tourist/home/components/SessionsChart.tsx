import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Radar from "radar-sdk-js";
import { io, Socket } from "socket.io-client";
import {
  LocationOn,
  MyLocation,
  People,
  WifiOff,
  Wifi,
} from "@mui/icons-material";

// Types
if (!process.env.NEXT_PUBLIC_RADAR_KEY)
  throw new Error("RADAR_KEY not defined");

const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_KEY;
const CUSTOM_RADAR_MAP = process.env.NEXT_PUBLIC_CUSTOM_RADAR_MAP;

interface LocationData {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  batteryLevel?: number;
}

interface UserMarker {
  userId: string;
  marker: any;
  lastUpdate: number;
  isCurrentUser: boolean;
}

interface TrackingSettings {
  enabled: boolean;
  highAccuracy: boolean;
  updateInterval: number;
  maxAge: number;
  timeout: number;
}

interface ConnectionStatus {
  connected: boolean;
  error?: string;
  reconnecting: boolean;
}

interface MiniRadarMapProps {
  className?: string;
  height?: number;
  radarApiKey?: string;
  socketUrl?: string;
  onLocationUpdate?: (location: LocationData) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
}

const MiniRadarMap: React.FC<MiniRadarMapProps> = ({
  className,
  height = 400,
  radarApiKey = "mock-key",
  socketUrl,
  onLocationUpdate,
  onConnectionStatusChange,
}) => {
  const theme = useTheme();
  const mapRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const userMarkersRef = useRef<Map<string, UserMarker>>(new Map());

  // State
  const [connectedUsers, setConnectedUsers] = useState<LocationData[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);
  const [userId] = useState<string>(() => 
    `user_${Math.random().toString(36).substr(2, 9)}`
  );

  const [userName, setUserName] = useState<string>("");
  const [trackingSettings, setTrackingSettings] = useState<TrackingSettings>({
    enabled: false,
    highAccuracy: true,
    updateInterval: 5000, // 5 seconds
    maxAge: 30000, // 30 seconds
    timeout: 15000, // 15 seconds
  });

  // Calculate total users
  const totalUsers = connectedUsers.length + (trackingEnabled ? 1 : 0);

  // Get connection chip properties
  const getConnectionChipProps = () => {
    if (connectionStatus.reconnecting) {
      return {
        label: "Reconnecting...",
        color: "warning" as const,
        icon: <WifiOff />
      };
    }
    
    if (connectionStatus.connected) {
      return {
        label: "Connected",
        color: "success" as const,
        icon: <Wifi />
      };
    }
    
    return {
      label: connectionStatus.error || "Disconnected",
      color: "error" as const,
      icon: <WifiOff />
    };
  };

  // Toggle tracking function
  const toggleTracking = useCallback(() => {
    if (trackingEnabled) {
      stopTracking();
      setTrackingEnabled(false);
    } else {
      startTracking();
      setTrackingEnabled(true);
    }
  }, [trackingEnabled]);

  // Socket.IO connection
  const connectSocket = useCallback(() => {
    // Replace with your Socket.IO server URL
    const SOCKET_URL =
      socketUrl || process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001";

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      timeout: 5000,
      query: {
        userId,
        userName: userName || `User ${userId.slice(-4)}`,
      },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to server");
      const status = { connected: true, reconnecting: false };
      setConnectionStatus(status);
      onConnectionStatusChange?.(status);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      const status = { connected: false, reconnecting: false };
      setConnectionStatus(status);
      onConnectionStatusChange?.(status);
    });

    socket.on("reconnecting", () => {
      const status = { connected: false, reconnecting: true };
      setConnectionStatus(status);
      onConnectionStatusChange?.(status);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      const status = {
        connected: false,
        reconnecting: false,
        error: error.message,
      };
      setConnectionStatus(status);
      onConnectionStatusChange?.(status);
    });

    // Listen for location updates from other users
    socket.on("locationUpdate", (locationData: LocationData) => {
      if (locationData.userId !== userId) {
        setConnectedUsers((prev) => {
          const updated = prev.filter(
            (user) => user.userId !== locationData.userId
          );
          return [...updated, locationData];
        });
        updateUserMarker(locationData);
      }
    });

    // Listen for user disconnections
    socket.on("userDisconnected", (disconnectedUserId: string) => {
      setConnectedUsers((prev) =>
        prev.filter((user) => user.userId !== disconnectedUserId)
      );
      removeUserMarker(disconnectedUserId);
    });

    // Listen for all connected users
    socket.on("connectedUsers", (users: LocationData[]) => {
      setConnectedUsers(users.filter((user) => user.userId !== userId));
      users.forEach((user) => {
        if (user.userId !== userId) {
          updateUserMarker(user);
        }
      });
    });
  }, [userId, userName, socketUrl, onConnectionStatusChange]);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Get battery level (if available)
  const getBatteryLevel = async (): Promise<number | undefined> => {
    try {
      if ("getBattery" in navigator) {
        const battery = await (navigator as any).getBattery();
        return Math.round(battery.level * 100);
      }
    } catch (error) {
      console.warn("Battery API not available:", error);
    }
    return undefined;
  };

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    // Connect socket if not connected
    if (!socketRef.current) {
      connectSocket();
    }

    const options: PositionOptions = {
      enableHighAccuracy: trackingSettings.highAccuracy,
      timeout: trackingSettings.timeout,
      maximumAge: trackingSettings.maxAge,
    };

    const successCallback = async (position: GeolocationPosition) => {
      const batteryLevel = await getBatteryLevel();

      const locationData: LocationData = {
        userId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: Date.now(),
        batteryLevel,
      };

      setCurrentLocation(locationData);
      onLocationUpdate?.(locationData);

      // Send location to server
      if (socketRef.current?.connected) {
        socketRef.current.emit("locationUpdate", locationData);
      }

      // Update map center and user marker
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [locationData.longitude, locationData.latitude],
          zoom: 16,
        });
        updateCurrentUserMarker(locationData);
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error);
      setConnectionStatus((prev) => ({
        ...prev,
        error: `Location error: ${error.message}`,
      }));
    };

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    setTrackingSettings((prev) => ({ ...prev, enabled: true }));
  }, [
    userId,
    trackingSettings.highAccuracy,
    trackingSettings.timeout,
    trackingSettings.maxAge,
    connectSocket,
    onLocationUpdate,
  ]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingSettings((prev) => ({ ...prev, enabled: false }));
  }, []);

  // Update current user marker
  const updateCurrentUserMarker = (locationData: LocationData) => {
    if (!mapRef.current) return;

    const existingMarker = userMarkersRef.current.get(userId);
    if (existingMarker) {
      existingMarker.marker.setLngLat([
        locationData.longitude,
        locationData.latitude,
      ]);
      existingMarker.lastUpdate = locationData.timestamp;
    } else {
      const marker = Radar.ui
        .marker({
          text: userName || "You",
          color: "#28a745",
          popup: {
            html: `
              <div style="text-align: center;">
                <h3>${userName || "Your Location"}</h3>
                <p><strong>Accuracy:</strong> ${locationData.accuracy.toFixed(
                  1
                )}m</p>
                <p><strong>Speed:</strong> ${
                  locationData.speed
                    ? `${(locationData.speed * 3.6).toFixed(1)} km/h`
                    : "Unknown"
                }</p>
                <p><strong>Battery:</strong> ${
                  locationData.batteryLevel || "Unknown"
                }%</p>
                <p><strong>Updated:</strong> ${new Date(
                  locationData.timestamp
                ).toLocaleTimeString()}</p>
              </div>
            `,
          },
        })
        .setLngLat([locationData.longitude, locationData.latitude])
        .addTo(mapRef.current);

      userMarkersRef.current.set(userId, {
        userId,
        marker,
        lastUpdate: locationData.timestamp,
        isCurrentUser: true,
      });
    }
  };

  // Update other users' markers
  const updateUserMarker = (locationData: LocationData) => {
    if (!mapRef.current) return;

    const existingMarker = userMarkersRef.current.get(locationData.userId);
    if (existingMarker) {
      existingMarker.marker.setLngLat([
        locationData.longitude,
        locationData.latitude,
      ]);
      existingMarker.lastUpdate = locationData.timestamp;
    } else {
      const marker = Radar.ui
        .marker({
          text: `User ${locationData.userId.slice(-4)}`,
          color: "#007cbf",
          popup: {
            html: `
              <div style="text-align: center;">
                <h3>User ${locationData.userId.slice(-4)}</h3>
                <p><strong>Accuracy:</strong> ${locationData.accuracy.toFixed(
                  1
                )}m</p>
                <p><strong>Speed:</strong> ${
                  locationData.speed
                    ? `${(locationData.speed * 3.6).toFixed(1)} km/h`
                    : "Unknown"
                }</p>
                <p><strong>Battery:</strong> ${
                  locationData.batteryLevel || "Unknown"
                }%</p>
                <p><strong>Updated:</strong> ${new Date(
                  locationData.timestamp
                ).toLocaleTimeString()}</p>
              </div>
            `,
          },
        })
        .setLngLat([locationData.longitude, locationData.latitude])
        .addTo(mapRef.current);

      userMarkersRef.current.set(locationData.userId, {
        userId: locationData.userId,
        marker,
        lastUpdate: locationData.timestamp,
        isCurrentUser: false,
      });
    }
  };

  // Remove user marker
  const removeUserMarker = (userId: string) => {
    const userMarker = userMarkersRef.current.get(userId);
    if (userMarker) {
      userMarker.marker.remove();
      userMarkersRef.current.delete(userId);
    }
  };

  // Initialize map
  useEffect(() => {
    Radar.initialize(RADAR_KEY);

    const map = Radar.ui.map({
      container: "live-map",
      style: CUSTOM_RADAR_MAP,
      center: [77.209, 28.6139], // Delhi coordinates
      zoom: 10,
    });
    mapRef.current = map;

    map.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      userMarkersRef.current.forEach((userMarker) => {
        userMarker.marker.remove();
      });
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      disconnectSocket();
    };
  }, [stopTracking, disconnectSocket]);

  return (
    <Card
      variant="outlined"
      sx={{ width: "100%", height }}
      className={className}
    >
      <CardContent
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography component="h2" variant="subtitle2">
            Live Location Tracking
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip
              title={connectionStatus.connected ? "Disconnect" : "Connect"}
            >
              <IconButton
                size="small"
                onClick={connectionStatus.connected ? disconnectSocket : connectSocket}
                color={connectionStatus.connected ? "success" : "default"}
              >
                {connectionStatus.connected ? <Wifi /> : <WifiOff />}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={trackingEnabled ? "Stop Tracking" : "Start Tracking"}
            >
              <IconButton
                size="small"
                onClick={toggleTracking}
                disabled={!connectionStatus.connected}
                color={trackingEnabled ? "primary" : "default"}
              >
                {trackingEnabled ? <LocationOn /> : <MyLocation />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Status Info */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
        >
          <Chip size="small" {...getConnectionChipProps()} variant="outlined" />

          {totalUsers > 0 && (
            <Chip
              size="small"
              icon={<People />}
              label={`${totalUsers} user${totalUsers !== 1 ? "s" : ""}`}
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>

        {/* Map Container */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            backgroundColor:
              theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f5f5",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          {/* Map Display */}
          <Box
            id="live-map"
            sx={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!mapLoaded ? (
              <Typography variant="body2" color="text.secondary">
                Loading map...
              </Typography>
            ) : (
              <Box sx={{ position: "absolute", width: "100%", height: "100%" }}>
                {/* Current user marker */}
                {currentLocation && trackingEnabled && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.success.main,
                      border: `3px solid white`,
                      boxShadow: 2,
                      zIndex: 2,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.success.main,
                        opacity: 0.3,
                        animation: "pulse 2s infinite",
                      },
                    }}
                  />
                )}

                {/* Other users markers */}
                {connectedUsers.map((user: LocationData, index: number) => (
                  <Box
                    key={user.userId}
                    sx={{
                      position: "absolute",
                      left: `${30 + index * 25}%`,
                      top: `${40 + index * 15}%`,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                      border: `2px solid white`,
                      boxShadow: 1,
                      zIndex: 1,
                    }}
                  />
                ))}

                {/* Center crosshair */}
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 2,
                    height: 20,
                    backgroundColor: theme.palette.text.secondary,
                    opacity: 0.3,
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%) rotate(90deg)",
                      width: 2,
                      height: 20,
                      backgroundColor: theme.palette.text.secondary,
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer Status */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
            {currentLocation
              ? `±${currentLocation.accuracy.toFixed(1)}m accuracy`
              : trackingEnabled
              ? "Acquiring location..."
              : "Location tracking off"}
          </Typography>
          {trackingEnabled && (
            <Typography variant="caption" color="primary">
              Live
            </Typography>
          )}
        </Stack>
      </CardContent>

      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </Card>
  );
};

export default MiniRadarMap;