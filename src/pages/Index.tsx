import { useState, useEffect } from "react";
import { TrackingParametersPanel } from "@/components/dashboard/WeatherParametersPanel";
import { VehicleStatusToggle } from "@/components/dashboard/PrecipitationToggle";
import { VehicleInfoPanel } from "@/components/dashboard/InterconnectedParams";
import { TrackingResultsPanel } from "@/components/dashboard/PredictionResults";
import { MapVisualization } from "@/components/dashboard/MapVisualization";
import { MapLayersPanel } from "@/components/dashboard/VisualizationLayers";
import { DraggablePanel } from "@/components/dashboard/DraggablePanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header, usePanelVisibility } from "@/components/layout/Header";

const Index = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { panels, togglePanel, showAll, hideAll } = usePanelVisibility();

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <Header 
            panels={panels}
            onTogglePanel={togglePanel}
            onShowAll={showAll}
            onHideAll={hideAll}
          />

          {/* Main Dashboard Container */}
          <div className="relative flex-1 flex flex-col pt-14">
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
                {panels.trackingParams && (
                  <DraggablePanel 
                    storageKey="tracking-params" 
                    anchor="top-left"
                    offsetX={16}
                    offsetY={16}
                    className="pointer-events-auto max-w-xs"
                  >
                    <TrackingParametersPanel />
                  </DraggablePanel>
                )}

                {/* Center Top - Vehicle Toggle */}
                {panels.vehicleToggle && (
                  <DraggablePanel 
                    storageKey="vehicle-toggle" 
                    anchor="top-center"
                    offsetY={16}
                    className="pointer-events-auto"
                  >
                    <VehicleStatusToggle />
                  </DraggablePanel>
                )}

                {/* Center - Vehicle Info */}
                {panels.vehicleInfo && (
                  <DraggablePanel 
                    storageKey="vehicle-info" 
                    anchor="top-center"
                    offsetY={140}
                    className="pointer-events-auto"
                  >
                    <VehicleInfoPanel />
                  </DraggablePanel>
                )}

                {/* Right Panel */}
                {panels.trackingResults && (
                  <DraggablePanel 
                    storageKey="tracking-results" 
                    anchor="top-right"
                    offsetX={16}
                    offsetY={16}
                    className="pointer-events-auto max-w-xs"
                  >
                    <TrackingResultsPanel />
                  </DraggablePanel>
                )}
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
      </div>
    </SidebarProvider>
  );
};

export default Index;
