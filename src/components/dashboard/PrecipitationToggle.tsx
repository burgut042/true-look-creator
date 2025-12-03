import { useState } from "react";
import { CloudRain, Snowflake } from "lucide-react";

export const PrecipitationToggle = () => {
  const [type, setType] = useState<"rain" | "snow">("rain");
  const [intensity, setIntensity] = useState<"light" | "moderate" | "heavy">("heavy");

  return (
    <div className="glass-panel rounded-lg p-4 space-y-4">
      {/* Rain/Snow Toggle */}
      <div className="flex bg-muted/50 rounded-full p-1">
        <button
          onClick={() => setType("rain")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm transition-all ${
            type === "rain" ? "bg-secondary text-foreground" : "text-muted-foreground"
          }`}
        >
          <CloudRain className="w-4 h-4" />
          Rain
        </button>
        <button
          onClick={() => setType("snow")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm transition-all ${
            type === "snow" ? "bg-secondary text-foreground" : "text-muted-foreground"
          }`}
        >
          <Snowflake className="w-4 h-4" />
          Snow
        </button>
      </div>

      {/* Intensity Options */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "light", label: "Light", range: "0.1 - 2.5 mm/hr." },
          { key: "moderate", label: "Moderate", range: "2.6 - 7.6 mm/hr." },
          { key: "heavy", label: "Heavy", range: "7.7 - 50 mm/hr." },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setIntensity(item.key as typeof intensity)}
            className={`p-3 rounded-lg border text-left transition-all ${
              intensity === item.key
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-muted/30 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{item.label}</span>
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  intensity === item.key ? "border-primary bg-primary" : "border-muted-foreground"
                }`}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.range}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
