import { ConsolidatedBalloonData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  balloonData?: ConsolidatedBalloonData;
  isLoading: boolean;
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  showWeatherOverlay: boolean;
  onWeatherOverlayChange: (show: boolean) => void;
}

export default function Sidebar({
  balloonData,
  isLoading,
  timeFilter,
  onTimeFilterChange,
  showWeatherOverlay,
  onWeatherOverlayChange
}: SidebarProps) {
  const [hoursAgo, setHoursAgo] = useState([24]);

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'good': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatQualityLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'good': return 'Good';
      case 'partial': return 'Partial';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <aside className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Data Controls</h2>
      </div>
      
      {/* Balloon Statistics */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Active Balloons</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-primary">
                {isLoading ? "..." : (balloonData?.balloons.filter(b => b.hoursAgo === 0).length || 0)}
              </div>
              <div className="text-xs text-gray-600">Currently Active</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-secondary">
                {isLoading ? "..." : (balloonData?.totalCount || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">24h Data Points</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time Filter Controls */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Time Period Filter</h3>
        <RadioGroup value={timeFilter} onValueChange={onTimeFilterChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="current" id="current" />
            <Label htmlFor="current" className="flex items-center justify-between w-full">
              <span className="text-sm">Current Hour</span>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recent" id="recent" />
            <Label htmlFor="recent" className="flex items-center justify-between w-full">
              <span className="text-sm">Last 6 Hours</span>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="flex items-center justify-between w-full">
              <span className="text-sm">All 24 Hours</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-4">
          <Label className="block text-xs text-gray-600 mb-2">
            Hours Ago: {hoursAgo[0] === 24 ? "0-24" : `0-${hoursAgo[0]}`}
          </Label>
          <Slider
            value={hoursAgo}
            onValueChange={setHoursAgo}
            max={24}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Now</span>
            <span>24h ago</span>
          </div>
        </div>
      </div>

      {/* Weather Data Integration */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Weather Overlay</h3>
        <div className="space-y-3">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Wind Patterns</span>
                <Switch
                  checked={showWeatherOverlay}
                  onCheckedChange={onWeatherOverlayChange}
                />
              </div>
              <p className="text-xs text-gray-600">
                Open-Meteo wind data overlays help understand balloon drift patterns and atmospheric conditions affecting flight paths.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data Quality Status */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Data Quality</h3>
        <div className="space-y-2">
          {balloonData?.dataQuality && Object.entries(balloonData.dataQuality).map(([file, status]) => (
            <div key={file} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{file}</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${getQualityColor(status)}`}></div>
                <span className={`text-xs ${
                  status === 'healthy' || status === 'good' ? 'text-green-600' :
                  status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {formatQualityLabel(status)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <Card className="mt-4 bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <div className="text-xs text-gray-600 flex items-center">
              <Info className="h-4 w-4 text-blue-500 mr-1 flex-shrink-0" />
              Corrupted data files are automatically skipped. Error handling ensures continuous operation even with incomplete datasets.
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
