import { useState, useEffect } from "react";
import { TrackingParametersPanel } from "@/components/dashboard/WeatherParametersPanel";
import { VehicleStatusToggle } from "@/components/dashboard/PrecipitationToggle";
import { VehicleInfoPanel } from "@/components/dashboard/InterconnectedParams";
import { TrackingResultsPanel } from "@/components/dashboard/PredictionResults";
import { MapVisualization } from "@/components/dashboard/MapVisualization";
import { MapLayersPanel } from "@/components/dashboard/VisualizationLayers";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Navbar } from "@/components/layout/Navbar";
import { DraggablePanel } from "@/components/dashboard/DraggablePanel";

const Index = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Fullscreen map view
  if (isFullscreen) {
    return (
      <div className="h-screen w-screen bg-background">
        <MapVisualization 
          isFullscreen={true} 
          onToggleFullscreen={() => setIsFullscreen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      
      {/* Main Dashboard Container */}
      <div className="relative h-screen flex flex-col pt-14">
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-4 right-4 z-[101]">
          <ThemeToggle />
        </div>

        {/* Top Section */}
        <div className="flex-1 relative p-4 overflow-hidden">
          {/* Background Map */}
          <div className="absolute inset-0 z-0">
            <MapVisualization 
              isFullscreen={false}
              onToggleFullscreen={() => setIsFullscreen(true)}
            />
          </div>

          {/* Draggable Panels Container */}
          <div className="relative z-10 h-full w-full pointer-events-none">
            {/* Left Panel */}
            <DraggablePanel 
              storageKey="tracking-params" 
              initialPosition={{ x: 16, y: 8 }}
              className="pointer-events-auto max-w-xs"
            >
              <TrackingParametersPanel />
            </DraggablePanel>

            {/* Center Top - Vehicle Toggle */}
            <DraggablePanel 
              storageKey="vehicle-toggle" 
              initialPosition={{ x: 400, y: 8 }}
              className="pointer-events-auto"
            >
              <VehicleStatusToggle />
            </DraggablePanel>

            {/* Center - Vehicle Info */}
            <DraggablePanel 
              storageKey="vehicle-info" 
              initialPosition={{ x: 400, y: 140 }}
              className="pointer-events-auto"
            >
              <VehicleInfoPanel />
            </DraggablePanel>

            {/* Right Panel */}
            <DraggablePanel 
              storageKey="tracking-results" 
              initialPosition={{ x: 800, y: 48 }}
              className="pointer-events-auto max-w-xs"
            >
              <TrackingResultsPanel />
            </DraggablePanel>
          </div>
        </div>

        {/* Bottom Section - Map Layers */}
        <div className="relative z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
          <div className="bg-card/50 backdrop-blur-sm border-t border-border/30">
            <MapLayersPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;