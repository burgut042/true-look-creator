import { X, Plus, Settings2, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PredictionResults = () => {
  return (
    <div className="glass-panel rounded-lg p-4 w-72 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Simulate prediction results</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Location</label>
        <button className="w-full flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border border-border/50 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span>Downtown San Jose's</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Weather Conditions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Weather conditions</label>
          <button className="text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-muted/50 rounded-lg text-xs border border-border/50">
            Heavy Rain 7.7 - 50 mm/hr.
          </span>
          <span className="px-3 py-1.5 bg-muted/50 rounded-lg text-xs border border-border/50">
            Sunlight 50 W/m²
          </span>
          <span className="px-3 py-1.5 bg-muted/50 rounded-lg text-xs border border-border/50">
            Temperature 51°F
          </span>
        </div>
      </div>

      {/* Add Factor */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 text-sm border-border/50">
          <Plus className="w-4 h-4 mr-2" />
          Add factor
        </Button>
        <Button variant="outline" size="icon" className="border-border/50">
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Factor Effect by Region */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Factor effect by region</label>
          <button className="text-muted-foreground">⋮</button>
        </div>
        
        {/* Radar Chart Placeholder */}
        <div className="relative h-48 bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
          {/* Compass Points */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">N</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">S</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">W</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">E</span>

          {/* Radar Circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-dashed border-border/40" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-border/40" />
            <div className="absolute w-16 h-16 rounded-full border border-dashed border-border/40" />
          </div>

          {/* Data Point */}
          <div className="absolute top-1/3 right-1/4">
            <div className="w-3 h-3 rounded-full bg-chart-4 glow-marker" />
          </div>

          {/* Labels */}
          <div className="absolute top-6 right-4 text-[10px] text-muted-foreground">50mm</div>
          <div className="absolute right-8 top-1/3 text-[10px] text-primary">EL 6</div>
          <div className="absolute right-6 bottom-1/3 text-[10px] text-primary">EL 5</div>
          <div className="absolute bottom-1/3 right-12 text-[10px]">45 mm</div>

          {/* Info Box */}
          <div className="absolute bottom-1/4 right-1/4 bg-card/90 backdrop-blur rounded px-2 py-1 text-[10px] border border-border/50">
            <div className="text-muted-foreground">Landscape</div>
            <div>Avg <span className="text-chart-5">5.4m</span> ▼</div>
            <div>Risk <span className="text-chart-4">79%</span></div>
          </div>

          {/* Coordinates */}
          <div className="absolute bottom-8 left-4 text-[10px] text-muted-foreground">
            <div>37.335480,</div>
            <div>-121.893028</div>
          </div>
        </div>
      </div>
    </div>
  );
};
