import { WeatherParametersPanel } from "@/components/dashboard/WeatherParametersPanel";
import { PrecipitationToggle } from "@/components/dashboard/PrecipitationToggle";
import { InterconnectedParams } from "@/components/dashboard/InterconnectedParams";
import { PredictionResults } from "@/components/dashboard/PredictionResults";
import { MapVisualization } from "@/components/dashboard/MapVisualization";
import { VisualizationLayers } from "@/components/dashboard/VisualizationLayers";

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
          <div className="relative z-10 flex justify-between items-start h-full">
            {/* Left Panel */}
            <div className="flex flex-col gap-4">
              <WeatherParametersPanel />
            </div>

            {/* Center Top Panels */}
            <div className="flex flex-col items-center gap-4 pt-0">
              <PrecipitationToggle />
              <InterconnectedParams />
            </div>

            {/* Right Panel */}
            <div className="flex flex-col gap-4">
              <PredictionResults />
            </div>
          </div>
        </div>

        {/* Bottom Section - Visualization Layers */}
        <div className="relative z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-8">
          <div className="bg-card/50 backdrop-blur-sm border-t border-border/30">
            <VisualizationLayers />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
