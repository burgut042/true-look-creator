import { AlertCircle } from "lucide-react";

export const InterconnectedParams = () => {
  return (
    <div className="glass-panel rounded-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Interconnected parameters</h3>
        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">2</span>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-chart-4" />
          Low landscape
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-chart-2" />
          Rainfall: 220 mm/day
        </span>
      </div>

      {/* Alert */}
      <div className="flex gap-2 p-3 bg-chart-4/10 rounded-lg border border-chart-4/30">
        <AlertCircle className="w-4 h-4 text-chart-4 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/90">
          Simulations indicate significant flood risk in 2025 driven by persistent rainfall and low-altitude regions.
        </p>
      </div>
    </div>
  );
};
