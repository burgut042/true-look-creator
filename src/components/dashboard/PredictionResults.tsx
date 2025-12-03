import { useState } from "react";
import { X, Plus, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

const locations = [
  { id: "downtown", name: "Downtown San Jose's" },
  { id: "north", name: "North San Jose" },
  { id: "south", name: "South San Jose" },
  { id: "west", name: "West Valley" },
];

export const PredictionResults = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("downtown");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [weatherTags, setWeatherTags] = useState([
    "Heavy Rain 7.7 - 50 mm/hr.",
    "Sunlight 50 W/m²",
    "Temperature 51°F",
  ]);

  const removeTag = (index: number) => {
    setWeatherTags(prev => prev.filter((_, i) => i !== index));
    toast.info("Shart olib tashlandi");
  };

  const addFactor = () => {
    toast.success("Yangi omil qo'shildi", {
      description: "Humidity: 75%",
    });
    setWeatherTags(prev => [...prev, "Humidity 75%"]);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-panel rounded-lg w-72 overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <h3 className="font-medium text-sm">Simulate prediction results</h3>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Location</label>
              <div className="relative">
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border border-border/50 text-sm hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{locations.find(l => l.id === selectedLocation)?.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showLocationDropdown ? "rotate-180" : ""}`} />
                </button>

                {showLocationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocation(loc.id);
                          setShowLocationDropdown(false);
                          toast.info(`Joylashuv: ${loc.name}`);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${
                          selectedLocation === loc.id ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${selectedLocation === loc.id ? "bg-primary" : "bg-muted-foreground"}`} />
                        {loc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Weather Conditions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Weather conditions</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {weatherTags.map((tag, index) => (
                  <span
                    key={index}
                    className="group px-3 py-1.5 bg-muted/50 rounded-lg text-xs border border-border/50 flex items-center gap-2 hover:bg-muted/70 transition-colors"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Add Factor */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-sm border-border/50 hover:bg-muted/50"
                onClick={addFactor}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add factor
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-border/50 hover:bg-muted/50"
                onClick={() => toast.info("Sozlamalar")}
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Factor Effect by Region - Interactive */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Factor effect by region</label>
                <button className="text-muted-foreground hover:text-foreground">⋮</button>
              </div>

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

                {/* Animated data point */}
                <div className="absolute top-1/3 right-1/4 animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-chart-4 glow-marker" />
                </div>

                {/* Interactive labels */}
                <button className="absolute top-6 right-4 text-[10px] text-muted-foreground hover:text-primary transition-colors">50mm</button>
                <button className="absolute right-8 top-1/3 text-[10px] text-primary hover:text-primary/80 transition-colors">EL 6</button>
                <button className="absolute right-6 bottom-1/3 text-[10px] text-primary hover:text-primary/80 transition-colors">EL 5</button>
                <span className="absolute bottom-1/3 right-12 text-[10px]">45 mm</span>

                {/* Info Box */}
                <div className="absolute bottom-1/4 right-1/4 bg-card/90 backdrop-blur rounded px-2 py-1 text-[10px] border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="text-muted-foreground">Landscape</div>
                  <div>Avg <span className="text-red-400">5.4m</span> ▼</div>
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
