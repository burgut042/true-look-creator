import { useState } from "react";
import { toast } from "sonner";
import { 
  TrendingUp, MapPin, Lightbulb, Link2, BarChart3, Car, 
  Circle, Waves, Ruler, Map, ArrowRight, Droplets, 
  Mountain, Building2, Zap 
} from "lucide-react";

const layers = [
  { id: "fly-line", name: "Fly Line", icon: TrendingUp },
  { id: "marker-points", name: "Marker points", icon: MapPin },
  { id: "parallel-light", name: "Parallel light layer", icon: Lightbulb, active: true },
  { id: "connection", name: "Connection", icon: Link2 },
  { id: "3d-trajectory", name: "3D trajectory", icon: BarChart3 },
  { id: "traffic", name: "Traffic", icon: Car },
  { id: "bubble-line", name: "Bubble line", icon: Circle },
  { id: "breathing-layer", name: "Breathing layer", icon: Waves },
  { id: "3d-width-line", name: "3D width line layer", icon: Ruler },
  { id: "regional-heatmap", name: "Regional heatmap", icon: Map },
  { id: "trajectory-line", name: "Trajectory line", icon: ArrowRight },
  { id: "water-body", name: "Water body", icon: Droplets },
  { id: "polygonal-mount", name: "Polygonal mount", icon: Mountain },
  { id: "building-markers", name: "Building markers", icon: Building2 },
  { id: "dynamic-content", name: "Dynamic content", icon: Zap },
];

export const VisualizationLayers = () => {
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["parallel-light"]);

  const toggleLayer = (id: string, name: string) => {
    setSelectedLayers((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        toast.info(`"${name}" qatlami o'chirildi`);
        return prev.filter((l) => l !== id);
      } else {
        toast.success(`"${name}" qatlami yoqildi`);
        return [...prev, id];
      }
    });
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isSelected = selectedLayers.includes(layer.id);
        
        return (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id, layer.name)}
            className={`relative flex flex-col items-center p-2 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isSelected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border/30 bg-muted/20 hover:bg-muted/40 hover:border-border/50"
            }`}
          >
            {/* Preview */}
            <div className={`w-full aspect-video mb-2 rounded flex items-center justify-center overflow-hidden transition-colors ${
              isSelected ? "bg-primary/20" : "bg-secondary/50"
            }`}>
              <Icon className={`w-6 h-6 transition-colors ${
                isSelected ? "text-primary" : "text-muted-foreground"
              }`} />
            </div>

            {/* Radio indicator */}
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? "border-primary bg-primary" : "border-muted-foreground"
              }`}>
                {isSelected && (
                  <div className="w-1 h-1 rounded-full bg-primary-foreground" />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                {layer.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
