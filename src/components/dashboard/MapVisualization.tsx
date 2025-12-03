import { ChevronDown } from "lucide-react";

export const MapVisualization = () => {
  const markers = [
    { id: 1, x: "30%", y: "35%", value: "4-9.5", label: "MASL" },
    { id: 2, x: "45%", y: "55%", value: "0-5.6", label: "MASL", active: true },
    { id: 3, x: "65%", y: "50%", value: "1-6.7", label: "MASL" },
  ];

  const timelineHours = [
    "12 AM", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
    "12PM", "10AM", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"
  ];

  return (
    <div className="relative flex-1 h-full min-h-[500px]">
      {/* Map Background */}
      <div className="absolute inset-0 gradient-map rounded-lg overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Terrain visualization */}
        <div className="absolute inset-0">
          {/* Mountain triangles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 10}%`,
                bottom: `${30 + (i % 3) * 5}%`,
                width: 0,
                height: 0,
                borderLeft: "20px solid transparent",
                borderRight: "20px solid transparent",
                borderBottom: `40px solid hsl(var(--primary) / ${0.2 + (i % 3) * 0.1})`,
              }}
            />
          ))}
        </div>

        {/* Water body - stylized bay area */}
        <div className="absolute left-[35%] top-[40%] w-[35%] h-[30%] bg-chart-2/20 rounded-full blur-xl" />
        <div className="absolute left-[40%] top-[45%] w-[25%] h-[20%] bg-primary/30 rounded-full blur-lg" />

        {/* Markers */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: marker.x, top: marker.y }}
          >
            {/* Marker circle */}
            <div className={`relative ${marker.active ? "scale-110" : ""}`}>
              <div className={`w-12 h-12 rounded-full border-2 ${marker.active ? "border-primary bg-primary/20" : "border-primary/50 bg-primary/10"} flex items-center justify-center glow-marker`}>
                <div className="w-6 h-6 rounded-full bg-card/80 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </div>
              
              {/* Label */}
              <div className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs ${marker.active ? "bg-primary text-primary-foreground" : "bg-card/90 text-foreground"}`}>
                <span className="font-medium">{marker.value}</span>
                <span className="text-[10px] ml-1 opacity-80">{marker.label}</span>
                <span className="ml-1">▼</span>
              </div>
            </div>
          </div>
        ))}

        {/* Scale indicator */}
        <div className="absolute right-4 top-1/3 flex flex-col items-end gap-1 text-[10px] text-muted-foreground">
          <span>1:90</span>
          <span>1:80</span>
          <span>1:70</span>
          <span>1:60</span>
          <span>1:50</span>
          <span>1:40</span>
          <span>1:30</span>
          <span>1:20</span>
        </div>

        {/* Drag indicator */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
        </div>
      </div>

      {/* Timeline */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-background/80 to-transparent">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {timelineHours.map((hour, i) => (
            <button
              key={i}
              className={`px-2 py-1 text-xs whitespace-nowrap rounded transition-all ${
                hour === "10AM" 
                  ? "bg-primary text-primary-foreground" 
                  : hour === "12PM"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {hour}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
