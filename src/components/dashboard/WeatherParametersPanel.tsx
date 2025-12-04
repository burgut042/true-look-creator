import { useState } from "react";
import { Settings2, X, Navigation, Gauge, Battery, MapPin, ChevronDown, ChevronUp, Check, Car, Truck, Bike } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

const vehicles = [
  { id: "v1", name: "Toyota Camry - 01A123BC", type: "car" },
  { id: "v2", name: "Chevrolet Lacetti - 01B456CD", type: "car" },
  { id: "v3", name: "Isuzu NPR - 01C789EF", type: "truck" },
  { id: "v4", name: "Honda CB500 - 01D012GH", type: "bike" },
];

export const TrackingParametersPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [updateInterval, setUpdateInterval] = useState([10]);
  const [speedLimit, setSpeedLimit] = useState([80]);
  const [showRoute, setShowRoute] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState("v1");

  const handleSave = () => {
    toast.success("Sozlamalar saqlandi!", {
      description: `Yangilanish: ${updateInterval[0]}s, Tezlik limiti: ${speedLimit[0]} km/s`,
    });
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "truck": return Truck;
      case "bike": return Bike;
      default: return Car;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-panel rounded-lg w-72 overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Kuzatuv sozlamalari</span>
            </div>
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
              <label className="text-xs text-muted-foreground">Transport vositasi</label>
              <Select value={selectedVehicle} onValueChange={(v) => {
                setSelectedVehicle(v);
                const vehicle = vehicles.find(ve => ve.id === v);
                toast.info(`Tanlandi: ${vehicle?.name}`);
              }}>
                <SelectTrigger className="w-full bg-muted/50 border-border/50 text-sm">
                  <Car className="w-3 h-3 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Transportni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => {
                    const Icon = getVehicleIcon(v.type);
                    return (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3" />
                          {v.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Battery className="w-3 h-3" />
                  Batareya
                </div>
                <span className="text-sm font-medium text-green-400">87%</span>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Navigation className="w-3 h-3" />
                  Signal
                </div>
                <span className="text-sm font-medium text-primary">Kuchli</span>
              </div>
            </div>

            {/* Update Interval */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Yangilanish oralig'i: {updateInterval[0]}s</label>
              <div className="space-y-1">
                <Slider 
                  value={updateInterval} 
                  onValueChange={setUpdateInterval}
                  min={1}
                  max={60} 
                  step={1} 
                  className="w-full" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>

            {/* Speed Limit */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Tezlik limiti: {speedLimit[0]} km/s</label>
              <div className="space-y-1">
                <Slider 
                  value={speedLimit} 
                  onValueChange={setSpeedLimit}
                  min={20}
                  max={200} 
                  step={5} 
                  className="w-full" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>20</span>
                  <span>200 km/s</span>
                </div>
              </div>
            </div>

            {/* Show Route Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">Marshrutni ko'rsatish</span>
                </div>
                <Switch 
                  checked={showRoute}
                  onCheckedChange={(checked) => {
                    setShowRoute(checked);
                    toast.info(checked ? "Marshrut yoqildi" : "Marshrut o'chirildi");
                  }}
                  className="data-[state=checked]:bg-primary" 
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Jonli ko'rinish</label>
              <div className="relative bg-secondary/50 rounded-lg h-32 overflow-hidden">
                <div className="absolute inset-0 gradient-map opacity-60" />
                <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-green-500 glow-marker animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 rounded-full bg-primary/30 glow-primary flex items-center justify-center animate-pulse">
                    <Car className="w-4 h-4 text-primary" />
                  </div>
                </div>
                {showRoute && (
                  <svg className="absolute inset-0 w-full h-full">
                    <path 
                      d="M 20 100 Q 60 80 100 90 T 180 60" 
                      fill="none" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="2" 
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                )}
                <div className="absolute bottom-2 right-2 text-[10px] bg-background/80 px-2 py-1 rounded">
                  <Gauge className="w-3 h-3 inline mr-1" />
                  45 km/s
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Check className="w-4 h-4 mr-2" /> Saqlash
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const WeatherParametersPanel = TrackingParametersPanel;