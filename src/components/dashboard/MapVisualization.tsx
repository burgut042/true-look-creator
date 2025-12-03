import { useState } from "react";
import { toast } from "sonner";

interface MarkerData {
  id: number;
  x: string;
  y: string;
  value: string;
  label: string;
}

const markers: MarkerData[] = [
  { id: 1, x: "30%", y: "25%", value: "4-9.5", label: "MASL" },
  { id: 2, x: "50%", y: "50%", value: "0-5.6", label: "MASL" },
  { id: 3, x: "70%", y: "45%", value: "1-6.7", label: "MASL" },
];

interface TimelineSelectorProps {
  selectedHour: string;
  onHourChange: (hour: string) => void;
}

const TimelineSelector = ({ selectedHour, onHourChange }: TimelineSelectorProps) => {
  const hours = [
    "12AM", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
    "12PM", "10AM", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 px-4">
      {hours.map((hour, i) => (
        <button
          key={i}
          onClick={() => {
            onHourChange(hour);
            toast.info(`Vaqt: ${hour}`);
          }}
          className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-lg transition-all ${
            selectedHour === hour
              ? "bg-primary text-primary-foreground"
              : hour === "12PM"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {hour}
        </button>
      ))}
    </div>
  );
};

const MapMarker = ({ 
  marker, 
  isSelected, 
  onClick 
}: { 
  marker: MarkerData; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: marker.x, top: marker.y }}
      onClick={onClick}
    >
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
        isSelected ? "animate-ping bg-primary/30" : ""
      }`} style={{ width: 48, height: 48, marginLeft: -24, marginTop: -24 }} />
      
      {/* Main marker */}
      <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        isSelected 
          ? "border-primary bg-primary/20 scale-110" 
          : "border-primary/50 bg-primary/10 hover:border-primary hover:bg-primary/20"
      }`}
      style={{ boxShadow: isSelected ? "0 0 20px rgba(34, 211, 238, 0.5)" : "0 0 10px rgba(34, 211, 238, 0.2)" }}
      >
        <div className="w-6 h-6 rounded-full bg-card/80 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full transition-colors ${isSelected ? "bg-primary" : "bg-primary/70"}`} />
        </div>
      </div>

      {/* Label */}
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs transition-all ${
        isSelected 
          ? "bg-primary text-primary-foreground scale-105" 
          : "bg-card/90 text-foreground border border-border/50 group-hover:border-primary/50"
      }`}>
        <span className="font-medium">{marker.value}</span>
        <span className="text-[10px] ml-1 opacity-80">{marker.label}</span>
        <span className="ml-1">▼</span>
      </div>
    </div>
  );
};

export const MapVisualization = () => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(2);
  const [selectedHour, setSelectedHour] = useState("10AM");

  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker.id);
    toast.success(`Marker tanlandi`, {
      description: `${marker.value} ${marker.label}`,
    });
  };

  return (
    <div className="relative flex-1 h-full min-h-[500px] rounded-lg overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,45%,12%)] via-[hsl(195,50%,15%)] to-[hsl(210,40%,10%)]">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(175 75% 45% / 0.3)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Simulated terrain - Mountains */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${10 + i * 8}%`,
                bottom: `${25 + (i % 4) * 8}%`,
                width: 0,
                height: 0,
                borderLeft: `${15 + (i % 3) * 10}px solid transparent`,
                borderRight: `${15 + (i % 3) * 10}px solid transparent`,
                borderBottom: `${30 + (i % 3) * 15}px solid hsl(175 75% 45% / ${0.15 + (i % 4) * 0.05})`,
                filter: "blur(1px)",
              }}
            />
          ))}
        </div>

        {/* Water body - Bay Area simulation */}
        <div className="absolute left-[35%] top-[35%] w-[40%] h-[35%] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute left-[40%] top-[40%] w-[30%] h-[25%] bg-primary/20 rounded-full blur-2xl" />
        
        {/* City dots */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 50}%`,
            }}
          />
        ))}

        {/* Roads simulation */}
        <div className="absolute left-[20%] top-[30%] w-[60%] h-[1px] bg-primary/20 rotate-12" />
        <div className="absolute left-[30%] top-[50%] w-[40%] h-[1px] bg-primary/20 -rotate-6" />
      </div>

      {/* Markers */}
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          marker={marker}
          isSelected={selectedMarker === marker.id}
          onClick={() => handleMarkerClick(marker)}
        />
      ))}

      {/* Scale indicator */}
      <div className="absolute right-4 top-1/4 flex flex-col items-end gap-1 text-[10px] text-muted-foreground bg-background/70 backdrop-blur-sm p-2 rounded border border-border/30">
        {["1:90", "1:80", "1:70", "1:60", "1:50", "1:40", "1:30", "1:20"].map((scale) => (
          <span key={scale}>{scale}</span>
        ))}
      </div>

      {/* Chevron indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Timeline */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-2">
        <TimelineSelector selectedHour={selectedHour} onHourChange={setSelectedHour} />
      </div>
    </div>
  );
};
