"use client";
import React, { useRef, useEffect, useState } from "react";
import Radar from "radar-sdk-js";

import "radar-sdk-js/dist/radar.css";

if (!process.env.NEXT_PUBLIC_RADAR_KEY)
  throw new Error("RADAR_KEY not defined");

const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_KEY;
const CUSTOM_RADAR_MAP = process.env.NEXT_PUBLIC_CUSTOM_RADAR_MAP

// Types
interface MarkerData {
  id: number;
  coordinates: [number, number];
  text: string;
  popup: {
    html: string;
  };
}

interface GeofenceData {
  id: number;
  coordinates: [number, number];
  radius: number;
  description: string;
  tag: string;
}

interface MarkerInstance {
  id: number;
  marker: any; // Radar marker instance
}

interface GeofenceInstance {
  id: number;
  sourceId: string;
  layerId: string;
}

interface RadarAddress {
  formattedAddress: string;
  geometry: {
    coordinates: [number, number];
  };
}

const RadarMap: React.FC = () => {
  const mapRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const markersRef = useRef<MarkerInstance[]>([]);
  const userLocationMarkerRef = useRef<any>(null);
  const geofencesRef = useRef<GeofenceInstance[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      id: 1,
      coordinates: [-73.9910078, 40.7342465],
      text: "Radar HQ",
      popup: {
        html: `
          <div style="text-align: center;">
            <h3>Radar HQ</h3>
            <p>Main office location</p>
          </div>
        `
      }
    },
    {
      id: 2,
      coordinates: [-73.990389, 40.735862],
      text: "Union Square",
      popup: {
        html: `
          <div style="text-align: center;">
            <h3>Union Square</h3>
            <p>Popular NYC location</p>
          </div>
        `
      }
    }
  ]);

  const [geofences, setGeofences] = useState<GeofenceData[]>([
    {
      id: 1,
      coordinates: [17.918524, 79.444832],
      radius: 100,
      description: "Radar HQ Geofence",
      tag: "office"
    }
  ]);

  // Get user's current location
  const getCurrentLocation = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          const coords: [number, number] = [longitude, latitude];
          setUserLocation(coords);
          
          if (mapRef.current) {
            mapRef.current.flyTo({ center: coords, zoom: 14 });
            
            // Remove existing user location marker
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.remove();
            }
            
            // Add new user location marker
            const userMarker = Radar.ui
              .marker({ 
                text: "Your Location",
                marker: CUSTOM_RADAR_MAP,
                color: "#007cbf"
              })
              .setLngLat(coords)
              .addTo(mapRef.current);
            
            userLocationMarkerRef.current = userMarker;
          }
        },
        (error: GeolocationPositionError) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Add a new marker
  const addMarker = (coordinates: [number, number], text: string, popupHtml?: string): void => {
    const newMarker: MarkerData = {
      id: Date.now(),
      coordinates,
      text,
      popup: {
        html: popupHtml || `
          <div style="text-align: center;">
            <h3>${text}</h3>
            <p>Custom marker</p>
          </div>
        `
      }
    };
    
    setMarkers(prev => [...prev, newMarker]);
  };

  // Remove a marker
  const removeMarker = (markerId: number): void => {
    setMarkers(prev => prev.filter(marker => marker.id !== markerId));
    
    // Remove from map
    const markerInstance = markersRef.current.find(m => m.id === markerId);
    if (markerInstance) {
      markerInstance.marker.remove();
      markersRef.current = markersRef.current.filter(m => m.id !== markerId);
    }
  };

  // Add a new geofence
  const addGeofence = (
    coordinates: [number, number], 
    radius: number = 100, 
    description: string = "New Geofence", 
    tag: string = "custom"
  ): void => {
    const newGeofence: GeofenceData = {
      id: Date.now(),
      coordinates,
      radius,
      description,
      tag
    };
    
    setGeofences(prev => [...prev, newGeofence]);
  };

  // Remove a geofence
  const removeGeofence = (geofenceId: number): void => {
    setGeofences(prev => prev.filter(geofence => geofence.id !== geofenceId));
    
    // Remove from map
    const geofenceInstance = geofencesRef.current.find(g => g.id === geofenceId);
    if (geofenceInstance && mapRef.current && mapLoaded) {
      try {
        if (mapRef.current.getLayer(geofenceInstance.layerId)) {
          mapRef.current.removeLayer(geofenceInstance.layerId);
        }
        if (mapRef.current.getSource(geofenceInstance.sourceId)) {
          mapRef.current.removeSource(geofenceInstance.sourceId);
        }
        geofencesRef.current = geofencesRef.current.filter(g => g.id !== geofenceId);
      } catch (error) {
        console.warn('Error removing geofence:', error);
      }
    }
  };

  // Create geofence on map click
  const handleMapClick = (e: any): void => {
    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    addGeofence(coords, 100, "Click Geofence", "click");
  };

  useEffect(() => {
    // Initialize Radar
    Radar.initialize(RADAR_KEY);

    // Create map
    const map = Radar.ui.map({
      container: "map",
      style: CUSTOM_RADAR_MAP,
      center: [-73.9911, 40.7342],
      zoom: 14,
    });
    mapRef.current = map;

    // Wait for map to load before adding geofences
    map.on('load', () => {
      setMapLoaded(true);
    });

    // Initialize autocomplete
    const autocomplete = Radar.ui.autocomplete({
      container: "autocomplete",
      width: "100%",
      placeholder: "Search for a location...",
      limit: 5,
      onSelection: (address: RadarAddress) => {
        if (address && address.geometry && address.geometry.coordinates) {
          const coords = address.geometry.coordinates;
          map.flyTo({ center: coords, zoom: 16 });
          
          // Optionally add a marker for the searched location
          addMarker(coords, address.formattedAddress, `
            <div style="text-align: center;">
              <h3>Search Result</h3>
              <p>${address.formattedAddress}</p>
            </div>
          `);
        }
      }
    });
    autocompleteRef.current = autocomplete;

    // Get user location on mount
    getCurrentLocation();

    // Add click handler for creating geofences
    map.on('click', handleMapClick);

    // Cleanup function
    return () => {
      autocompleteRef.current?.remove();
      markersRef.current.forEach(markerInstance => {
        markerInstance.marker.remove();
      });
      geofencesRef.current.forEach(geofenceInstance => {
        try {
          if (map.getLayer(geofenceInstance.layerId)) {
            map.removeLayer(geofenceInstance.layerId);
          }
          if (map.getSource(geofenceInstance.sourceId)) {
            map.removeSource(geofenceInstance.sourceId);
          }
        } catch (error) {
          console.warn('Error cleaning up geofence:', error);
        }
      });
    };
  }, []);

  // Update markers on map when markers state changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(markerInstance => {
      markerInstance.marker.remove();
    });
    markersRef.current = [];

    // Add all markers to map
    markers.forEach(markerData => {
      const marker = Radar.ui
        .marker({ 
          text: markerData.text,
          popup: markerData.popup
        })
        .setLngLat(markerData.coordinates)
        .addTo(mapRef.current);

      markersRef.current.push({
        id: markerData.id,
        marker
      });
    });
  }, [markers]);

  // Update geofences on map when geofences state changes and map is loaded
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing geofences
    geofencesRef.current.forEach(geofenceInstance => {
      try {
        if (mapRef.current.getLayer(geofenceInstance.layerId)) {
          mapRef.current.removeLayer(geofenceInstance.layerId);
        }
        if (mapRef.current.getSource(geofenceInstance.sourceId)) {
          mapRef.current.removeSource(geofenceInstance.sourceId);
        }
      } catch (error) {
        console.warn('Error removing geofence:', error);
      }
    });
    geofencesRef.current = [];

    // Add all geofences to map
    geofences.forEach(geofenceData => {
      const sourceId = `geofence-source-${geofenceData.id}`;
      const layerId = `geofence-layer-${geofenceData.id}`;

      try {
        // Create circle geometry
        const center = geofenceData.coordinates;
        const radius = geofenceData.radius;
        const points = 64;
        const coords: number[][] = [];

        for (let i = 0; i < points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = radius * Math.cos(angle) / 111320; // Convert meters to degrees longitude
          const dy = radius * Math.sin(angle) / 110540; // Convert meters to degrees latitude
          coords.push([center[0] + dx, center[1] + dy]);
        }
        coords.push(coords[0]); // Close the polygon

        // Add source
        mapRef.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coords]
            },
            properties: {
              description: geofenceData.description,
              tag: geofenceData.tag
            }
          }
        });

        // Add layer
        mapRef.current.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#007cbf',
            'fill-opacity': 0.2,
            'fill-outline-color': '#007cbf'
          }
        });

        // Add to refs for cleanup
        geofencesRef.current.push({
          id: geofenceData.id,
          sourceId,
          layerId
        });
      } catch (error) {
        console.error('Error adding geofence:', error);
      }
    });
  }, [geofences, mapLoaded]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Search and Controls Header */}
      <div style={{
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
        display: "flex",
        gap: "16px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {/* Autocomplete Search */}
        <div style={{ flex: "1", minWidth: "300px" }}>
          <div id="autocomplete" />
        </div>
        
        {/* Control Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={getCurrentLocation}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007cbf",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            📍 My Location
          </button>
          
          <button
            onClick={() => {
              const coords = userLocation || [-73.9911, 40.7342] as [number, number];
              addMarker(coords, "New Marker", `
                <div style="text-align: center;">
                  <h3>New Marker</h3>
                  <p>Added at current location</p>
                </div>
              `);
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            ➕ Add Marker
          </button>

          <button
            onClick={() => {
              const coords = userLocation || [-73.9911, 40.7342] as [number, number];
              addGeofence(coords, 100, "New Geofence", "manual");
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6f42c1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🔗 Add Geofence
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: "relative" }}>
        <div id="map" style={{ height: "100%" }} />
      </div>

      {/* Markers and Geofences List */}
      <div style={{
        maxHeight: "300px",
        overflowY: "auto",
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderTop: "1px solid #dee2e6"
      }}>
        <div style={{ display: "flex", gap: "32px" }}>
          {/* Markers Section */}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>
              Markers ({markers.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {markers.map(marker => (
                <div
                  key={marker.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6"
                  }}
                >
                  <div style={{ fontSize: "14px" }}>
                    <strong>{marker.text}</strong>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      {marker.coordinates[1].toFixed(4)}, {marker.coordinates[0].toFixed(4)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeMarker(marker.id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Geofences Section */}
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>
              Geofences ({geofences.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {geofences.map(geofence => (
                <div
                  key={geofence.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6"
                  }}
                >
                  <div style={{ fontSize: "14px" }}>
                    <strong>{geofence.description}</strong>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      Radius: {geofence.radius}m | Tag: {geofence.tag}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      {geofence.coordinates[1].toFixed(4)}, {geofence.coordinates[0].toFixed(4)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeGeofence(geofence.id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#e9ecef",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#6c757d"
        }}>
          <strong>Instructions:</strong> Click anywhere on the map to add a geofence at that location. 
          Use the buttons above to add markers and geofences at your current location.
        </div>
      </div>
    </div>
  );
};

export default RadarMap;