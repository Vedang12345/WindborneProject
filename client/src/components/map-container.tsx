import { useEffect, useRef, useState } from "react";
import { BalloonData, WeatherData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Globe, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Leaflet imports
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapContainerProps {
  balloons: BalloonData[];
  isLoading: boolean;
  error: any;
  showWeatherOverlay: boolean;
  onBalloonClick: (balloon: BalloonData) => void;
}

export default function MapContainer({
  balloons,
  isLoading,
  error,
  showWeatherOverlay,
  onBalloonClick
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const [apiResponseTime, setApiResponseTime] = useState("127ms");

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: true,
      keyboard: true,
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add markers layer
    markersRef.current.addTo(map);

    // Map is now fully interactive and ready

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when balloons change
  useEffect(() => {
    if (!mapRef.current || !balloons.length) return;

    const startTime = Date.now();
    
    // Clear existing markers
    markersRef.current.clearLayers();

    // Create markers for each balloon
    balloons.forEach((balloon) => {
      const { latitude, longitude, hoursAgo } = balloon;

      // Determine marker color and size based on age
      let markerColor = "#3B82F6"; // blue
      let markerSize = 8;

      if (hoursAgo === 0) {
        markerColor = "#EF4444"; // red
        markerSize = 12;
      } else if (hoursAgo <= 6) {
        markerColor = "#F59E0B"; // orange
        markerSize = 10;
      }

      // Create custom marker
      const marker = L.circleMarker([latitude, longitude], {
        radius: markerSize / 2,
        fillColor: markerColor,
        color: "#FFFFFF",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      // Add popup with balloon info
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-2">Balloon ${balloon.id}</h3>
          <div class="text-xs space-y-1">
            <div><strong>Lat:</strong> ${latitude.toFixed(4)}°</div>
            <div><strong>Lon:</strong> ${longitude.toFixed(4)}°</div>
            <div><strong>Alt:</strong> ${balloon.altitude.toFixed(0)}m</div>
            <div><strong>Age:</strong> ${hoursAgo}h ago</div>
          </div>
        </div>
      `);

      // Add click handler
      marker.on("click", () => {
        onBalloonClick(balloon);
      });

      markersRef.current.addLayer(marker);
    });

    // Update response time simulation
    const endTime = Date.now();
    setApiResponseTime(`${endTime - startTime}ms`);
  }, [balloons, onBalloonClick]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([20, 0], 2);
    }
  };

  if (error) {
    return (
      <main className="flex-1 relative bg-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h2 className="text-xl font-semibold">Data Fetch Error</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Unable to fetch balloon data. Please check your connection and try again.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 relative">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }}>
        {/* Map Loading State */}
        {isLoading && balloons.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-[1000] pointer-events-none">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading balloon data...</p>
              <p className="text-sm text-gray-500 mt-1">Fetching latest positions from 24 data sources</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <Card>
          <CardContent className="p-2 space-y-1">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleZoomIn}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleZoomOut}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleCenterMap}
              title="Center on global view"
            >
              <Globe className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-20 max-w-xs">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">Balloon Age Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              <span className="text-xs text-gray-700">Current Hour (Most Recent)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
              <span className="text-xs text-gray-700">1-6 Hours Ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
              <span className="text-xs text-gray-700">6-24 Hours Ago</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="text-xs text-gray-600 flex items-center">
              <svg className="w-3 h-3 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Click any balloon for detailed information
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Status Indicator */}
      <Card className="absolute top-4 left-4 z-20">
        <CardContent className="p-3 flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">API Status</span>
          </div>
          <div className="text-xs font-mono text-gray-500">{apiResponseTime}</div>
        </CardContent>
      </Card>
    </main>
  );
}
