import { BalloonData, WeatherData } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Satellite, Download, Crosshair, Info } from "lucide-react";

interface BalloonModalProps {
  balloon: BalloonData;
  onClose: () => void;
}

export default function BalloonModal({ balloon, onClose }: BalloonModalProps) {
  // Fetch weather data for the balloon's location
  const { data: weatherData, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ['/api/weather', balloon.latitude, balloon.longitude],
    queryFn: async () => {
      const response = await fetch(`/api/weather?lat=${balloon.latitude}&lon=${balloon.longitude}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    },
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getAgeLabel = (hoursAgo: number) => {
    if (hoursAgo === 0) return "Current";
    if (hoursAgo === 1) return "1 hour ago";
    return `${hoursAgo} hours ago`;
  };

  const getStatusLabel = (hoursAgo: number) => {
    if (hoursAgo <= 1) return "Active";
    if (hoursAgo <= 6) return "Recent";
    return "Historical";
  };

  const getStatusColor = (hoursAgo: number) => {
    if (hoursAgo <= 1) return "text-green-600";
    if (hoursAgo <= 6) return "text-orange-600";
    return "text-blue-600";
  };

  const handleCenterOnBalloon = () => {
    // This would center the map on the balloon
    // For now, we'll just close the modal
    onClose();
  };

  const handleExportData = () => {
    // Export balloon data as JSON
    const dataToExport = {
      balloon,
      weather: weatherData,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balloon-${balloon.id}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-primary" />
            Balloon Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about balloon {balloon.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Balloon Identification */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Balloon ID:</span>
              <span className="font-mono text-gray-900">{balloon.id}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="text-sm text-gray-600">Data Age</div>
                  <div className="font-semibold text-gray-900">{getAgeLabel(balloon.hoursAgo)}</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`font-semibold ${getStatusColor(balloon.hoursAgo)}`}>
                    {getStatusLabel(balloon.hoursAgo)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Location Data */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Position Data</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-mono text-gray-900">{balloon.latitude.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-mono text-gray-900">{balloon.longitude.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Altitude:</span>
                <span className="font-mono text-gray-900">{balloon.altitude.toFixed(0)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-mono text-gray-900 text-xs">{formatTimestamp(balloon.timestamp)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Weather Context */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Weather Context</h4>
            {weatherLoading ? (
              <div className="text-sm text-gray-500">Loading weather data...</div>
            ) : weatherData ? (
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-3">
                    <div className="text-sm text-gray-600">Wind Speed</div>
                    <div className="font-semibold text-gray-900">{weatherData.windSpeed.toFixed(1)} m/s</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="text-sm text-gray-600">Temperature</div>
                    <div className="font-semibold text-gray-900">{weatherData.temperature.toFixed(1)}°C</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Weather data unavailable</div>
            )}
            
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-2">
                <div className="text-xs text-gray-600 flex items-center">
                  <Info className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0" />
                  Weather data sourced from Open-Meteo API to provide atmospheric context for balloon positioning and drift analysis.
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleCenterOnBalloon}
              className="flex-1 bg-primary hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Crosshair className="h-4 w-4" />
              <span>Center on Map</span>
            </Button>
            <Button 
              onClick={handleExportData}
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
