import { TrackingParametersPanel } from "@/components/dashboard/WeatherParametersPanel";
import { VehicleStatusToggle } from "@/components/dashboard/PrecipitationToggle";
import { VehicleInfoPanel } from "@/components/dashboard/InterconnectedParams";
import { TrackingResultsPanel } from "@/components/dashboard/PredictionResults";
import { MapVisualization } from "@/components/dashboard/MapVisualization";
import { MapLayersPanel } from "@/components/dashboard/VisualizationLayers";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Main Dashboard Container */}
      <div className="relative h-screen flex flex-col">
        {/* Top Section */}
        <div className="flex-1 relative p-4 overflow-hidden">
          {/* Background Map */}
          <div className="absolute inset-0 z-0">
            <MapVisualization />
          </div>

          {/* Overlay Panels */}
          <div className="relative z-10 flex justify-between items-start h-full pointer-events-none">
            {/* Left Panel */}
            <div className="flex flex-col gap-4 pointer-events-auto">
              <TrackingParametersPanel />
            </div>

            {/* Center Top Panels */}
            <div className="flex flex-col items-center gap-4 pt-0 pointer-events-auto">
              <VehicleStatusToggle />
              <VehicleInfoPanel />
            </div>

            {/* Right Panel */}
            <div className="flex flex-col gap-4 pointer-events-auto">
              <TrackingResultsPanel />
            </div>
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