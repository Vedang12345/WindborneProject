import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ConsolidatedBalloonData, BalloonData } from "@shared/schema";
import AppHeader from "@/components/app-header";
import Sidebar from "@/components/sidebar";
import MapContainer from "@/components/map-container";
import BalloonModal from "@/components/balloon-modal";

export default function Dashboard() {
  const [selectedBalloon, setSelectedBalloon] = useState<BalloonData | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);

  // Fetch balloon data
  const { data: balloonData, isLoading, error, refetch } = useQuery<ConsolidatedBalloonData>({
    queryKey: ['/api/balloons'],
    refetchInterval: autoRefresh ? 5 * 60 * 1000 : false, // 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
  });

  // Filter balloons based on time filter
  const filteredBalloons = balloonData?.balloons.filter(balloon => {
    switch (timeFilter) {
      case 'current':
        return balloon.hoursAgo === 0;
      case 'recent':
        return balloon.hoursAgo <= 6;
      case 'all':
      default:
        return true;
    }
  }) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleBalloonClick = (balloon: BalloonData) => {
    setSelectedBalloon(balloon);
  };

  const handleCloseModal = () => {
    setSelectedBalloon(null);
  };

  return (
    <div className="h-screen bg-neutral-50 flex flex-col">
      <AppHeader 
        isConnected={!error}
        lastUpdated={balloonData?.lastUpdated}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        onRefresh={handleRefresh}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          balloonData={balloonData}
          isLoading={isLoading}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          showWeatherOverlay={showWeatherOverlay}
          onWeatherOverlayChange={setShowWeatherOverlay}
        />
        
        <MapContainer
          balloons={filteredBalloons}
          isLoading={isLoading}
          error={error}
          showWeatherOverlay={showWeatherOverlay}
          onBalloonClick={handleBalloonClick}
        />
      </div>

      {selectedBalloon && (
        <BalloonModal
          balloon={selectedBalloon}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
