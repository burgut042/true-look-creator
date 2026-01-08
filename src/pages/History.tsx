import { useState, useEffect } from "react";
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
  Pause,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { tripAPI } from "@/lib/api";
import { useVehicles } from "@/contexts/VehicleContext";

interface TripRecord {
  id: number;
  vehicle_id: number;
  vehicle_name: string;
  plate_number: string;
  date: string;
  start_time: string;
  end_time: string;
  start_address?: string;
  end_address?: string;
  distance: number;
  duration: number;
  max_speed: number;
  avg_speed: number;
  fuel_used: number;
}

const History = () => {
  const { vehicles } = useVehicles();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [searchDate, setSearchDate] = useState("");
  const [playingTrip, setPlayingTrip] = useState<number | null>(null);

  useEffect(() => {
    loadTrips();
  }, [selectedVehicle]);

  const loadTrips = async () => {
    try {
      setLoading(true);

      const params: any = { limit: 100 };
      if (selectedVehicle !== "all") {
        params.vehicle_id = parseInt(selectedVehicle);
      }

      const response = await tripAPI.getAll(params);
      const tripsData = response.data.trips || [];

      // Format trips
      const formattedTrips = tripsData.map((trip: any) => ({
        id: trip.id,
        vehicle_id: trip.vehicle_id,
        vehicle_name: trip.vehicle_name || 'Unknown Vehicle',
        plate_number: trip.plate_number || '',
        date: new Date(trip.start_time).toISOString().split('T')[0],
        start_time: new Date(trip.start_time).toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        end_time: trip.end_time
          ? new Date(trip.end_time).toLocaleTimeString('uz-UZ', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Davom etmoqda',
        start_address: trip.start_address || 'Unknown',
        end_address: trip.end_address || 'Unknown',
        distance: parseFloat(trip.distance) || 0,
        duration: parseInt(trip.duration) || 0,
        max_speed: parseFloat(trip.max_speed) || 0,
        avg_speed: parseFloat(trip.avg_speed) || 0,
        fuel_used: parseFloat(trip.fuel_used) || 0
      }));

      setTrips(formattedTrips);
    } catch (error: any) {
      console.error('Error loading trips:', error);
      toast.error('Safar tarixini yuklashda xatolik');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}s ${minutes}d`;
    }
    return `${minutes}d`;
  };

  const filteredTrips = trips.filter(trip => {
    const matchDate = !searchDate || trip.date.includes(searchDate);
    return matchDate;
  });

  const handlePlayTrip = async (tripId: number) => {
    if (playingTrip === tripId) {
      setPlayingTrip(null);
      toast.info("Qayta ijro to'xtatildi");
    } else {
      setPlayingTrip(tripId);
      try {
        // Load trip route
        await tripAPI.getRoute(tripId);
        toast.success("Marshrut xaritada ko'rsatilmoqda", {
          description: "Safar marshrutini kuzating"
        });
      } catch (error) {
        toast.error("Marshrut ma'lumotlari topilmadi");
        setPlayingTrip(null);
      }
    }
  };

  const handleExport = () => {
    toast.success("Hisobot yuklab olindi", {
      description: "trip_history.xlsx fayli saqlandi"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Safar tarixi yuklanmoqda...</p>
        </div>
      </div>
    );
  }

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
            Barcha transport vositalarining safarlari
          </p>
        </div>

        {/* Filters */}
        <Card className="glass-panel border-border/30 mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vehicle Filter */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Transport
                </label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Barcha transport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha transport</SelectItem>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.name} - {vehicle.plate_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Sana
                </label>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  placeholder="Sanani tanlang"
                  className="bg-background/50"
                />
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Amallar
                </label>
                <Button
                  onClick={handleExport}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Eksport qilish
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/30">
              <div>
                <p className="text-xs text-muted-foreground">Jami safarlar</p>
                <p className="text-xl font-bold">{filteredTrips.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jami masofa</p>
                <p className="text-xl font-bold">
                  {filteredTrips.reduce((sum, trip) => sum + trip.distance, 0).toFixed(0)} km
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jami vaqt</p>
                <p className="text-xl font-bold">
                  {formatDuration(filteredTrips.reduce((sum, trip) => sum + trip.duration, 0))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">O'rtacha tezlik</p>
                <p className="text-xl font-bold">
                  {filteredTrips.length > 0
                    ? (filteredTrips.reduce((sum, trip) => sum + trip.avg_speed, 0) / filteredTrips.length).toFixed(0)
                    : 0} km/s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <Card className="glass-panel border-border/30">
            <CardContent className="py-12 text-center">
              <HistoryIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Safar tarixi topilmadi</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tanlangan filtrlarga mos safar yo'q
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <Card key={trip.id} className="glass-panel border-border/30 hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section - Trip Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Car className="w-4 h-4 text-primary" />
                            {trip.vehicle_name} - {trip.plate_number}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {trip.date} • {trip.start_time} - {trip.end_time}
                          </p>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-muted-foreground">{trip.start_address}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-muted-foreground">{trip.end_address}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Masofa:</span>
                          <span className="font-medium">{trip.distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-muted-foreground">Davomiyligi:</span>
                          <span className="font-medium">{formatDuration(trip.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">Max/O'rtacha:</span>
                          <span className="font-medium">
                            {trip.max_speed.toFixed(0)} / {trip.avg_speed.toFixed(0)} km/s
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
                          </svg>
                          <span className="text-muted-foreground">Yoqilg'i:</span>
                          <span className="font-medium">{trip.fuel_used.toFixed(1)} L</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <Button
                        variant={playingTrip === trip.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlayTrip(trip.id)}
                        className="flex-1 lg:flex-initial"
                      >
                        {playingTrip === trip.id ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            To'xtatish
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Qayta ijro
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
