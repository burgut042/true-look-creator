import { useState } from "react";
import { Settings2, X, Thermometer, Wind, Sun, MapPin, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

export const WeatherParametersPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [windSpeed, setWindSpeed] = useState([25]);
  const [sunlightIntensity, setSunlightIntensity] = useState([400]);
  const [applySelected, setApplySelected] = useState(true);
  const [location, setLocation] = useState("select");

  const handleSave = () => {
    toast.success("Sozlamalar saqlandi!", {
      description: `Shamol: ${windSpeed[0]} mph, Quyosh: ${sunlightIntensity[0]} W/m²`,
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-panel rounded-lg w-72 overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Weather conditions parameters</span>
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
            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full bg-muted/50 border-border/50 text-sm">
                  <MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select or type your location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select or type your location</SelectItem>
                  <SelectItem value="san-jose">San Jose</SelectItem>
                  <SelectItem value="san-francisco">San Francisco</SelectItem>
                  <SelectItem value="oakland">Oakland</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Temperature */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Selected Temperature</label>
              <div className="grid grid-cols-2 gap-2">
                <Select defaultValue="32">
                  <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
                    <Thermometer className="w-3 h-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Min (°F)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="32">32°F</SelectItem>
                    <SelectItem value="40">40°F</SelectItem>
                    <SelectItem value="50">50°F</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="80">
                  <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
                    <Thermometer className="w-3 h-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Max (°F)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80">80°F</SelectItem>
                    <SelectItem value="90">90°F</SelectItem>
                    <SelectItem value="100">100°F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Wind Speed (mph): {windSpeed[0]}</label>
              <div className="space-y-1">
                <Slider 
                  value={windSpeed} 
                  onValueChange={setWindSpeed}
                  max={200} 
                  step={1} 
                  className="w-full" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5</span>
                  <span>201+</span>
                </div>
              </div>
            </div>

            {/* Sunlight Intensity */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Sunlight Intensity: {sunlightIntensity[0]} W/m²</label>
              <div className="space-y-1">
                <Slider 
                  value={sunlightIntensity} 
                  onValueChange={setSunlightIntensity}
                  max={1000} 
                  step={10} 
                  className="w-full" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>1,000 W/m²</span>
                </div>
              </div>
            </div>

            {/* Air Quality Index */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Air Quality Index (μg/m³)</label>
              <div className="grid grid-cols-2 gap-2">
                <Select defaultValue="0">
                  <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
                    <Wind className="w-3 h-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 μg/m³</SelectItem>
                    <SelectItem value="50">50 μg/m³</SelectItem>
                    <SelectItem value="100">100 μg/m³</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="200">
                  <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
                    <Thermometer className="w-3 h-3 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="200">200 μg/m³</SelectItem>
                    <SelectItem value="300">300 μg/m³</SelectItem>
                    <SelectItem value="500">500 μg/m³</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Simulate applied parameters preview</label>
              <div className="flex items-center gap-2 mb-2">
                <Switch 
                  checked={applySelected}
                  onCheckedChange={setApplySelected}
                  className="data-[state=checked]:bg-primary" 
                />
                <span className="text-xs">Apply selected data</span>
              </div>
              <div className={`relative bg-secondary/50 rounded-lg h-32 overflow-hidden transition-opacity ${applySelected ? "opacity-100" : "opacity-50"}`}>
                <div className="absolute inset-0 gradient-map opacity-60" />
                <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-primary/50 glow-marker animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 rounded-full bg-primary/30 glow-primary flex items-center justify-center">
                    <Sun className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Check className="w-4 h-4 mr-2" /> Save Settings
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
