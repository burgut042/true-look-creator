import { useState } from "react";

const layers = [
  { id: "fly-line", name: "Fly Line", icon: "📈" },
  { id: "marker-points", name: "Marker points", icon: "📍" },
  { id: "parallel-light", name: "Parallel light layer", icon: "💡", active: true },
  { id: "connection", name: "Connection", icon: "🔗" },
  { id: "3d-trajectory", name: "3D trajectory", icon: "📊" },
  { id: "traffic", name: "Traffic", icon: "🚗" },
  { id: "bubble-line", name: "Bubble line", icon: "🫧" },
  { id: "breathing-layer", name: "Breathing layer", icon: "🌊" },
  { id: "3d-width-line", name: "3D width line layer", icon: "📐" },
  { id: "regional-heatmap", name: "Regional heatmap", icon: "🗺️" },
  { id: "trajectory-line", name: "Trajectory line", icon: "➡️" },
  { id: "water-body", name: "Water body", icon: "💧" },
  { id: "polygonal-mount", name: "Polygonal mount", icon: "⛰️" },
  { id: "building-markers", name: "Building markers", icon: "🏢" },
  { id: "dynamic-content", name: "Dynamic content", icon: "⚡" },
];

export const VisualizationLayers = () => {
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["parallel-light"]);

  const toggleLayer = (id: string) => {
    setSelectedLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-8 gap-2 p-2">
      {layers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => toggleLayer(layer.id)}
          className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${
            selectedLayers.includes(layer.id)
              ? "border-primary bg-primary/10"
              : "border-border/30 bg-muted/20 hover:bg-muted/40"
          }`}
        >
          {/* Preview */}
          <div className="w-full aspect-video mb-2 rounded bg-secondary/50 flex items-center justify-center overflow-hidden">
            <div className={`text-2xl opacity-60 ${selectedLayers.includes(layer.id) ? "text-primary" : ""}`}>
              {layer.icon}
            </div>
          </div>
          
          {/* Radio indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
              selectedLayers.includes(layer.id) ? "border-primary" : "border-muted-foreground"
            }`}>
              {selectedLayers.includes(layer.id) && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
              {layer.name}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
