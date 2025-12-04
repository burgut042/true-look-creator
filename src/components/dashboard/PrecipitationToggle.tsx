import { useState } from "react";
import { Car, Truck, Bike, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

export const VehicleStatusToggle = () => {
  const [vehicleType, setVehicleType] = useState<"car" | "truck" | "bike">("car");
  const [status, setStatus] = useState<"online" | "idle" | "offline">("online");

  const handleTypeChange = (newType: "car" | "truck" | "bike") => {
    setVehicleType(newType);
    const labels = { car: "Avtomobil", truck: "Yuk mashinasi", bike: "Mototsikl" };
    toast.info(`${labels[newType]} tanlandi`);
  };

  const handleStatusChange = (newStatus: "online" | "idle" | "offline") => {
    setStatus(newStatus);
    const labels = { online: "Faol", idle: "Kutish", offline: "O'chiq" };
    toast.info(`Holat: ${labels[newStatus]}`);
  };

  return (
    <div className="glass-panel rounded-lg p-4 space-y-4">
      {/* Vehicle Type Toggle */}
      <div className="flex bg-muted/50 rounded-full p-1">
        <button
          onClick={() => handleTypeChange("car")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
            vehicleType === "car" 
              ? "bg-secondary text-foreground shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Car className={`w-4 h-4 ${vehicleType === "car" ? "text-primary" : ""}`} />
          Avto
        </button>
        <button
          onClick={() => handleTypeChange("truck")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
            vehicleType === "truck" 
              ? "bg-secondary text-foreground shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className={`w-4 h-4 ${vehicleType === "truck" ? "text-primary" : ""}`} />
          Yuk
        </button>
        <button
          onClick={() => handleTypeChange("bike")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
            vehicleType === "bike" 
              ? "bg-secondary text-foreground shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bike className={`w-4 h-4 ${vehicleType === "bike" ? "text-primary" : ""}`} />
          Moto
        </button>
      </div>

      {/* Status Options */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "online", label: "Faol", desc: "Harakatda", icon: Power, color: "text-green-400" },
          { key: "idle", label: "Kutish", desc: "To'xtab turgan", icon: Power, color: "text-yellow-400" },
          { key: "offline", label: "O'chiq", desc: "Signal yo'q", icon: PowerOff, color: "text-red-400" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleStatusChange(item.key as typeof status)}
              className={`p-3 rounded-lg border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                status === item.key
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div
                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                    status === item.key 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground"
                  }`}
                >
                  {status === item.key && (
                    <div className="w-1 h-1 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PrecipitationToggle = VehicleStatusToggle;