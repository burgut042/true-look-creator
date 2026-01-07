import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  History as HistoryIcon, 
  Car, 
  MapPin, 
  Clock, 
  Calendar,
  Search,
  Download,
  ChevronRight,
  Play,
  Pause
} from "lucide-react";
import { toast } from "sonner";

interface TripRecord {
  id: number;
  vehicle: string;
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: string;
  maxSpeed: number;
  avgSpeed: number;
  fuelUsed: number;
}

const tripHistory: TripRecord[] = [
  {
    id: 1,
    vehicle: "Toyota Camry - 01A123BC",
    date: "2024-01-15",
    startTime: "08:30",
    endTime: "10:45",
    startLocation: "Toshkent, Chilonzor",
    endLocation: "Samarqand, Registon",
    distance: 286,
    duration: "2s 15d",
    maxSpeed: 120,
    avgSpeed: 85,
    fuelUsed: 24,
  },
  {
    id: 2,
    vehicle: "Chevrolet Lacetti - 01B456CD",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "09:45",
    startLocation: "Toshkent, Yunusobod",
    endLocation: "Toshkent, Sergeli",
    distance: 18,
    duration: "45d",
    maxSpeed: 65,
    avgSpeed: 42,
    fuelUsed: 2,
  },
  {
    id: 3,
    vehicle: "Isuzu NPR - 01C789EF",
    date: "2024-01-14",
    startTime: "06:00",
    endTime: "14:30",
    startLocation: "Toshkent, Sergeli",
    endLocation: "Buxoro, Markaz",
    distance: 458,
    duration: "8s 30d",
    maxSpeed: 90,
    avgSpeed: 54,
    fuelUsed: 65,
  },
  {
    id: 4,
    vehicle: "Toyota Camry - 01A123BC",
    date: "2024-01-14",
    startTime: "14:00",
    endTime: "16:20",
    startLocation: "Samarqand, Registon",
    endLocation: "Toshkent, Chilonzor",
    distance: 286,
    duration: "2s 20d",
    maxSpeed: 115,
    avgSpeed: 82,
    fuelUsed: 25,
  },
  {
    id: 5,
    vehicle: "Chevrolet Lacetti - 01B456CD",
    date: "2024-01-13",
    startTime: "10:15",
    endTime: "11:00",
    startLocation: "Toshkent, Mirzo Ulug'bek",
    endLocation: "Toshkent, Bektemir",
    distance: 22,
    duration: "45d",
    maxSpeed: 58,
    avgSpeed: 38,
    fuelUsed: 3,
  },
];

const History = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [searchDate, setSearchDate] = useState("");
  const [playingTrip, setPlayingTrip] = useState<number | null>(null);

  const filteredTrips = tripHistory.filter(trip => {
    const matchVehicle = selectedVehicle === "all" || trip.vehicle.includes(selectedVehicle);
    const matchDate = !searchDate || trip.date.includes(searchDate);
    return matchVehicle && matchDate;
  });

  const handlePlayTrip = (tripId: number) => {
    if (playingTrip === tripId) {
      setPlayingTrip(null);
      toast.info("Qayta ijro to'xtatildi");
    } else {
      setPlayingTrip(tripId);
      toast.success("Marshrut xaritada ko'rsatilmoqda", {
        description: "Safar marshrutini kuzating"
      });
    }
  };

  const handleExport = () => {
    toast.success("Hisobot yuklab olindi", {
      description: "trip_history.xlsx fayli saqlandi"
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-[101]">
        <ThemeToggle />
      </div>

      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-primary" />
            Safar tarixi
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Barcha transport vositalarining safar yozuvlari
          </p>
        </div>

        {/* Filters */}
        <Card className="glass-panel border-border/30 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-muted-foreground mb-1 block">Transport</label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha transport</SelectItem>
                    <SelectItem value="Toyota">Toyota Camry</SelectItem>
                    <SelectItem value="Chevrolet">Chevrolet Lacetti</SelectItem>
                    <SelectItem value="Isuzu">Isuzu NPR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-muted-foreground mb-1 block">Sana</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={() => {
                  setSelectedVehicle("all");
                  setSearchDate("");
                  toast.info("Filtrlar tozalandi");
                }}>
                  Tozalash
                </Button>
                <Button onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Eksport
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip List */}
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <Card 
              key={trip.id} 
              className={`glass-panel border-border/30 transition-all ${
                playingTrip === trip.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Left: Vehicle & Time Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{trip.vehicle}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {trip.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {trip.startTime} - {trip.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={playingTrip === trip.id ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handlePlayTrip(trip.id)}
                    >
                      {playingTrip === trip.id ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          To'xtatish
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Qayta ijro
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Route */}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">{trip.startLocation}</span>
                  </div>
                  <div className="flex-shrink-0 px-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">{trip.endLocation}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-border/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Masofa</p>
                    <p className="font-semibold">{trip.distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Davomiylik</p>
                    <p className="font-semibold">{trip.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max tezlik</p>
                    <p className="font-semibold">{trip.maxSpeed} km/s</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">O'rt. tezlik</p>
                    <p className="font-semibold">{trip.avgSpeed} km/s</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Yoqilg'i</p>
                    <p className="font-semibold">{trip.fuelUsed} L</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTrips.length === 0 && (
            <Card className="glass-panel border-border/30">
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Hech qanday safar topilmadi</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
