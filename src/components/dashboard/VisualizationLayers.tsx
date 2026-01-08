import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  TrendingUp, MapPin, Navigation, Link2, BarChart3, Car, 
  Circle, Radio, Ruler, Map, Route, Fuel, 
  Building2, Zap, Clock
} from "lucide-react";

const layers = [
  { id: "route-line", name: "Marshrut chizig'i", icon: Route },
  { id: "marker-points", name: "Belgilar", icon: MapPin },
  { id: "live-tracking", name: "Jonli kuzatuv", icon: Navigation, active: true },
  { id: "connection", name: "Ulanish", icon: Link2 },
  { id: "speed-chart", name: "Tezlik grafigi", icon: BarChart3 },
  { id: "traffic", name: "Tirbandlik", icon: Car },
  { id: "geofence", name: "Geo-chegara", icon: Circle },
  { id: "signal-zone", name: "Signal zonasi", icon: Radio },
  { id: "distance", name: "Masofa o'lchov", icon: Ruler },
  { id: "heatmap", name: "Issiqlik xaritasi", icon: Map },
  { id: "trip-history", name: "Safar tarixi", icon: TrendingUp },
  { id: "fuel-stations", name: "Yoqilg'i shoxobchalari", icon: Fuel },
  { id: "poi-markers", name: "Muhim joylar", icon: Building2 },
  { id: "alerts", name: "Ogohlantirishlar", icon: Zap },
  { id: "time-analysis", name: "Vaqt tahlili", icon: Clock },
];

export const MapLayersPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["live-tracking"]);

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20 transition-colors border-b border-border/30">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Xarita qatlamlari</span>
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
              {selectedLayers.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-3">
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export const VisualizationLayers = MapLayersPanel;