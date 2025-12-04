import { useState } from "react";
import { X, Plus, Settings2, ChevronDown, ChevronUp, History, Route, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

const vehicles = [
  { id: "v1", name: "Toyota Camry - 01A123BC", status: "online" },
  { id: "v2", name: "Chevrolet Lacetti - 01B456CD", status: "idle" },
  { id: "v3", name: "Isuzu NPR - 01C789EF", status: "online" },
  { id: "v4", name: "Honda CB500 - 01D012GH", status: "offline" },
];

const tripHistory = [
  { time: "14:30", location: "Toshkent, Chilonzor", event: "Yo'lga chiqdi" },
  { time: "15:15", location: "Sirdaryo viloyati", event: "To'xtash" },
  { time: "15:45", location: "Jizzax viloyati", event: "Tezlik oshirildi" },
];

export const TrackingResultsPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState("v1");
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [trackingTags, setTrackingTags] = useState([
    "Tezlik: 67 km/s",
    "Yoqilg'i: 45 L",
    "Batareya: 87%",
  ]);

  const removeTag = (index: number) => {
    setTrackingTags(prev => prev.filter((_, i) => i !== index));
    toast.info("Ma'lumot olib tashlandi");
  };

  const addInfo = () => {
    toast.success("Yangi ma'lumot qo'shildi", {
      description: "Harorat: 24°C",
    });
    setTrackingTags(prev => [...prev, "Harorat: 24°C"]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "idle": return "bg-yellow-500";
      default: return "bg-red-500";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-panel rounded-lg w-72 overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <h3 className="font-medium text-sm">Kuzatuv natijalari</h3>
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
            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Transport</label>
              <div className="relative">
                <button
                  onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                  className="w-full flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border border-border/50 text-sm hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(vehicles.find(v => v.id === selectedVehicle)?.status || "offline")}`} />
                    <span className="truncate">{vehicles.find(v => v.id === selectedVehicle)?.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${showVehicleDropdown ? "rotate-180" : ""}`} />
                </button>

                {showVehicleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVehicle(v.id);
                          setShowVehicleDropdown(false);
                          toast.info(`Tanlandi: ${v.name}`);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${
                          selectedVehicle === v.id ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(v.status)}`} />
                        <span className="truncate">{v.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Data Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Joriy ma'lumotlar</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {trackingTags.map((tag, index) => (
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

            {/* Add Info Button */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-sm border-border/50 hover:bg-muted/50"
                onClick={addInfo}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ma'lumot qo'shish
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

            {/* Trip History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <History className="w-3 h-3" />
                  Safar tarixi
                </label>
                <button 
                  className="text-xs text-primary hover:underline"
                  onClick={() => toast.info("To'liq tarix ko'rilmoqda")}
                >
                  Barchasini ko'rish
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tripHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => toast.info(`${item.time} - ${item.event}`, { description: item.location })}
                    className="w-full flex items-start gap-2 p-2 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{item.event}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate block">{item.location}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Route Overview */}
            <div className="relative h-32 bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              {/* Route visualization */}
              <svg className="absolute inset-0 w-full h-full">
                <path 
                  d="M 20 100 C 40 60, 80 80, 100 50 S 140 30, 160 40 S 200 60, 220 30" 
                  fill="none" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="2" 
                  strokeDasharray="4,4"
                />
                <circle cx="20" cy="100" r="4" fill="hsl(var(--chart-2))" />
                <circle cx="100" cy="50" r="3" fill="hsl(var(--primary))" className="animate-pulse" />
                <circle cx="220" cy="30" r="4" fill="hsl(var(--chart-4))" />
              </svg>

              {/* Labels */}
              <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded">
                <MapPin className="w-3 h-3 inline mr-1 text-chart-2" />
                Toshkent
              </div>
              <div className="absolute top-2 right-2 text-[10px] bg-background/80 px-2 py-1 rounded">
                <Route className="w-3 h-3 inline mr-1 text-chart-4" />
                Samarqand
              </div>

              {/* Current position indicator */}
              <div className="absolute top-1/3 left-1/3 bg-primary/20 rounded-full p-1 animate-ping" />
              <div className="absolute top-1/3 left-1/3 bg-primary rounded-full w-3 h-3" />

              {/* Distance */}
              <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                234 km / 298 km
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const PredictionResults = TrackingResultsPanel;