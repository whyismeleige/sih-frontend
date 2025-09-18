"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import Radar from "radar-sdk-js";
import { io, Socket } from "socket.io-client";

import "radar-sdk-js/dist/radar.css";

if (!process.env.NEXT_PUBLIC_RADAR_KEY)
  throw new Error("RADAR_KEY not defined");

const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_KEY;
const CUSTOM_RADAR_MAP = process.env.NEXT_PUBLIC_CUSTOM_RADAR_MAP

// Types
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

const LiveTrackingMap: React.FC = () => {
  // Refs
  const mapRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const userMarkersRef = useRef<Map<string, UserMarker>>(new Map());

  // State
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [connectedUsers, setConnectedUsers] = useState<LocationData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
  });
  const [userId] = useState<string>(
    () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [userName, setUserName] = useState<string>("");
  const [trackingSettings, setTrackingSettings] = useState<TrackingSettings>({
    enabled: false,
    highAccuracy: true,
    updateInterval: 5000, // 5 seconds
    maxAge: 30000, // 30 seconds
    timeout: 15000, // 15 seconds
  });

  // Socket.IO connection
  const connectSocket = useCallback(() => {
    // Replace with your Socket.IO server URL
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001";

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
      setConnectionStatus({ connected: true, reconnecting: false });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnectionStatus({ connected: false, reconnecting: false });
    });

    socket.on("reconnecting", () => {
      setConnectionStatus((prev) => ({ ...prev, reconnecting: true }));
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus({
        connected: false,
        reconnecting: false,
        error: error.message,
      });
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
  }, [userId, userName]);

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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Control Header */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        {/* User Info */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              padding: "8px 12px",
              marginRight: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              minWidth: "200px",
            }}
          />
          <span style={{ fontSize: "12px", color: "#6c757d" }}>
            ID: {userId.slice(-8)}
          </span>
        </div>

        {/* Connection Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: connectionStatus.connected
                  ? "#28a745"
                  : connectionStatus.reconnecting
                  ? "#ffc107"
                  : "#dc3545",
              }}
            />
            <span style={{ fontSize: "14px" }}>
              {connectionStatus.connected
                ? "Connected"
                : connectionStatus.reconnecting
                ? "Reconnecting..."
                : "Disconnected"}
            </span>
            {connectionStatus.error && (
              <span style={{ fontSize: "12px", color: "#dc3545" }}>
                ({connectionStatus.error})
              </span>
            )}
          </div>

          <div style={{ fontSize: "14px", color: "#6c757d" }}>
            Users online: {connectedUsers.length + (currentLocation ? 1 : 0)}
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={
              connectionStatus.connected ? disconnectSocket : connectSocket
            }
            style={{
              padding: "8px 16px",
              backgroundColor: connectionStatus.connected
                ? "#dc3545"
                : "#007cbf",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {connectionStatus.connected ? "🔴 Disconnect" : "🔌 Connect"}
          </button>

          <button
            onClick={trackingSettings.enabled ? stopTracking : startTracking}
            disabled={!connectionStatus.connected}
            style={{
              padding: "8px 16px",
              backgroundColor: trackingSettings.enabled ? "#ffc107" : "#28a745",
              color: trackingSettings.enabled ? "#000" : "white",
              border: "none",
              borderRadius: "4px",
              cursor: connectionStatus.connected ? "pointer" : "not-allowed",
              opacity: connectionStatus.connected ? 1 : 0.6,
            }}
          >
            {trackingSettings.enabled
              ? "⏹️ Stop Tracking"
              : "📍 Start Tracking"}
          </button>

          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={trackingSettings.highAccuracy}
              onChange={(e) =>
                setTrackingSettings((prev) => ({
                  ...prev,
                  highAccuracy: e.target.checked,
                }))
              }
              disabled={trackingSettings.enabled}
            />
            <span style={{ fontSize: "14px" }}>High Accuracy</span>
          </label>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: "relative" }}>
        <div id="live-map" style={{ height: "100%" }} />
      </div>

      {/* Status Footer */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #dee2e6",
          fontSize: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div>
            {currentLocation && (
              <span>
                📍 Lat: {currentLocation.latitude.toFixed(6)}, Lng:{" "}
                {currentLocation.longitude.toFixed(6)} | Accuracy: ±
                {currentLocation.accuracy.toFixed(1)}m
                {currentLocation.speed &&
                  ` | Speed: ${(currentLocation.speed * 3.6).toFixed(1)} km/h`}
              </span>
            )}
          </div>
          <div style={{ color: "#6c757d" }}>
            {trackingSettings.enabled && "🔄 Live tracking active"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
