import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const InterconnectedParams = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-panel rounded-lg max-w-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Interconnected parameters</h3>
              <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">2</span>
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
          <div className="p-4 pt-0 space-y-3">
            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs bg-muted/30 px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-chart-4" />
                Low landscape
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-muted/30 px-2 py-1 rounded-full">
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
