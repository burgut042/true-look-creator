import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, Fuel, Clock, MapPin, Gauge } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

export const VehicleInfoPanel = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-panel rounded-lg max-w-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Transport ma'lumotlari</h3>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Faol</span>
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
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => toast.info("Joriy tezlik: 67 km/s")}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Gauge className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Tezlik</div>
                  <div className="text-sm font-medium">67 km/s</div>
                </div>
              </button>
              <button 
                onClick={() => toast.info("Yoqilg'i: 45 litr qoldi")}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Fuel className="w-4 h-4 text-yellow-400" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Yoqilg'i</div>
                  <div className="text-sm font-medium">45 L</div>
                </div>
              </button>
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => toast.info("Haydovchi: Akmal Karimov")}
                className="flex items-center gap-1.5 text-xs bg-muted/30 px-2 py-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                Haydovchi: Akmal K.
              </button>
              <button 
                onClick={() => toast.info("Bosib o'tilgan masofa: 234 km")}
                className="flex items-center gap-1.5 text-xs bg-muted/30 px-2 py-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-chart-2" />
                Masofa: 234 km
              </button>
            </div>

            {/* Trip Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Toshkent → Samarqand</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Taxminiy yetib borish: 2 soat 15 daqiqa</span>
              </div>
            </div>

            {/* Alert */}
            <div className="flex gap-2 p-3 bg-chart-4/10 rounded-lg border border-chart-4/30">
              <AlertCircle className="w-4 h-4 text-chart-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/90">
                Ogohlantirish: Tezlik limiti oshirildi (80 km/s dan 95 km/s ga). Jizzax viloyati, 14:32.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const InterconnectedParams = VehicleInfoPanel;