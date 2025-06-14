import { Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw } from "lucide-react";

interface AppHeaderProps {
  isConnected: boolean;
  lastUpdated?: string;
  autoRefresh: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
  onRefresh: () => void;
}

export default function AppHeader({
  isConnected,
  lastUpdated,
  autoRefresh,
  onAutoRefreshChange,
  onRefresh
}: AppHeaderProps) {
  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return "Never";
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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Satellite className="text-primary text-xl" />
              <h1 className="text-xl font-semibold text-gray-900">Global Balloon Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 hidden sm:inline">
                {isConnected ? 'Live Data Connected' : 'Connection Error'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={onAutoRefreshChange}
                />
                <label 
                  htmlFor="auto-refresh"
                  className="text-sm text-gray-600 hidden sm:inline cursor-pointer"
                >
                  Auto-refresh (5min)
                </label>
              </div>
            </div>
            
            <Button 
              onClick={onRefresh}
              className="flex items-center space-x-2 bg-primary hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <div className="text-xs text-gray-500 hidden md:block">
              Last updated: <span className="font-mono">{formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
