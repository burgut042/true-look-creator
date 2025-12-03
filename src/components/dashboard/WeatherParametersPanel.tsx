import { Settings2, X, Thermometer, Wind, Sun, Cloud, MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const WeatherParametersPanel = () => {
  return (
    <div className="glass-panel rounded-lg p-4 w-72 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Weather conditions parameters</span>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Location</label>
        <Select defaultValue="select">
          <SelectTrigger className="w-full bg-muted/50 border-border/50 text-sm">
            <MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select or type your location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="select">Select or type your location</SelectItem>
            <SelectItem value="san-jose">San Jose</SelectItem>
            <SelectItem value="san-francisco">San Francisco</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Selected Temperature */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Selected Temperature</label>
        <div className="grid grid-cols-2 gap-2">
          <Select defaultValue="min">
            <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
              <Thermometer className="w-3 h-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Min (°F)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="min">Min (°F)</SelectItem>
              <SelectItem value="32">32°F</SelectItem>
              <SelectItem value="40">40°F</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="max">
            <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
              <Thermometer className="w-3 h-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Max (°F)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="max">Max (°F)</SelectItem>
              <SelectItem value="80">80°F</SelectItem>
              <SelectItem value="90">90°F</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Wind Speed */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Wind Speed (mph)</label>
        <div className="space-y-1">
          <Slider defaultValue={[25]} max={200} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5</span>
            <span>201+</span>
          </div>
        </div>
      </div>

      {/* Sunlight Intensity */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Sunlight Intensity</label>
        <div className="space-y-1">
          <Slider defaultValue={[400]} max={1000} step={10} className="w-full" />
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
          <Select defaultValue="min">
            <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
              <Wind className="w-3 h-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="min">Min (μg/m³)</SelectItem>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="max">
            <SelectTrigger className="bg-muted/50 border-border/50 text-sm">
              <Thermometer className="w-3 h-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="max">Max (μg/m³)</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Simulate applied parameters preview</label>
        <div className="flex items-center gap-2 mb-2">
          <Switch defaultChecked className="data-[state=checked]:bg-primary" />
          <span className="text-xs">Apply selected data</span>
        </div>
        <div className="relative bg-secondary/50 rounded-lg h-32 overflow-hidden">
          <div className="absolute inset-0 gradient-map opacity-60" />
          <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-primary/50 glow-marker" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full bg-primary/30 glow-primary flex items-center justify-center">
              <Sun className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Save Button */}
      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        <span className="mr-2">✓</span> Save Settings
      </Button>
    </div>
  );
};
