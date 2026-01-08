import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Car,
  Fuel,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { statsAPI } from "@/lib/api";
import { useVehicles } from "@/contexts/VehicleContext";
import { toast } from "sonner";

const Statistics = () => {
  const { vehicles } = useVehicles();
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [vehicleUsage, setVehicleUsage] = useState<any[]>([]);
  const [speedData, setSpeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate summary stats
  const totalDistance = weeklyStats.reduce((sum, day) => sum + (parseFloat(day.total_distance) || 0), 0);
  const totalTrips = weeklyStats.reduce((sum, day) => sum + (parseInt(day.trips_count) || 0), 0);
  const avgSpeed = weeklyStats.length > 0
    ? weeklyStats.reduce((sum, day) => sum + (parseFloat(day.avg_speed) || 0), 0) / weeklyStats.length
    : 0;

  // Count active vehicles
  const activeVehicles = vehicles.filter(v => v.status === 'online').length;
  const idleVehicles = vehicles.filter(v => v.status === 'idle').length;
  const totalVehicles = vehicles.length;

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // Load weekly stats
      const weeklyResponse = await statsAPI.getWeekly();
      const weeklyData = weeklyResponse.data.stats || [];

      // Format for charts
      const daysMap: any = {
        0: 'Yak', 1: 'Dush', 2: 'Sesh', 3: 'Chor',
        4: 'Pay', 5: 'Jum', 6: 'Shan'
      };

      const formattedWeekly = weeklyData.map((day: any) => {
        const date = new Date(day.stat_date);
        const dayName = daysMap[date.getDay()];
        return {
          name: dayName,
          distance: parseFloat(day.total_distance) || 0,
          fuel: (parseFloat(day.total_distance) || 0) * 0.13 // Estimate fuel (13L per 100km)
        };
      });
      setWeeklyStats(weeklyData);

      // Load vehicle usage
      const usageResponse = await statsAPI.getVehicleUsage();
      const usageData = usageResponse.data.usage || [];

      const colors = ['#22d3ee', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
      const totalDist = usageData.reduce((sum: number, v: any) => sum + parseFloat(v.total_distance || 0), 0);

      const formattedUsage = usageData.slice(0, 5).map((v: any, idx: number) => ({
        name: v.name || 'Unknown',
        value: totalDist > 0 ? Math.round((parseFloat(v.total_distance || 0) / totalDist) * 100) : 0,
        color: colors[idx % colors.length]
      }));

      // Add "Others" if more than 5 vehicles
      if (usageData.length > 5) {
        const othersPercent = 100 - formattedUsage.reduce((sum: number, item: any) => sum + item.value, 0);
        formattedUsage.push({
          name: 'Boshqalar',
          value: othersPercent > 0 ? othersPercent : 0,
          color: '#64748b'
        });
      }

      setVehicleUsage(formattedUsage);

      // Load speed data
      const speedResponse = await statsAPI.getSpeedData();
      const speedDataRaw = speedResponse.data.speedData || [];

      const formattedSpeed = speedDataRaw.map((item: any) => ({
        time: new Date(item.date).toLocaleDateString('uz-UZ', { weekday: 'short' }),
        speed: Math.round(parseFloat(item.avg_speed) || 0)
      }));
      setSpeedData(formattedSpeed);

      // Use weekly data for bar chart if available
      if (formattedWeekly.length > 0) {
        // Sort by day of week
        const sortedWeekly = [...formattedWeekly].sort((a, b) => {
          const order = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
          return order.indexOf(a.name) - order.indexOf(b.name);
        });
        // Use this for weekly chart instead of creating new array
        setWeeklyStats(sortedWeekly);
      }

    } catch (error: any) {
      console.error('Error loading statistics:', error);
      toast.error('Statistika yuklashda xatolik yuz berdi');

      // Set default empty data
      setWeeklyStats([]);
      setVehicleUsage([]);
      setSpeedData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Statistika yuklanmoqda...</p>
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
            <BarChart3 className="w-6 h-6 text-primary" />
            Statistika
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Transport vositalarining umumiy ko'rsatkichlari
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="glass-panel border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jami masofa</p>
                  <p className="text-2xl font-bold">{totalDistance.toFixed(0)} km</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>So'nggi 7 kun</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jami safar</p>
                  <p className="text-2xl font-bold">{totalTrips}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>So'nggi 7 kun</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Faol transport</p>
                  <p className="text-2xl font-bold">{activeVehicles} / {totalVehicles}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>{idleVehicles} ta kutish rejimida</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">O'rtacha tezlik</p>
                  <p className="text-2xl font-bold">{avgSpeed.toFixed(0)} km/s</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-violet-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>So'nggi 7 kun</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Distance Chart */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base">Haftalik masofa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {weeklyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="distance" name="Masofa (km)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fuel" name="Yoqilg'i (L)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Ma'lumot yo'q
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Usage Pie Chart */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base">Transport foydalanish ulushi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {vehicleUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vehicleUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vehicleUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground">Ma'lumot yo'q</div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {vehicleUsage.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Speed Chart */}
        <Card className="glass-panel border-border/30">
          <CardHeader>
            <CardTitle className="text-base">Kunlik tezlik ko'rsatkichlari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {speedData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={speedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value} km/s`, 'Tezlik']}
                    />
                    <Area
                      type="monotone"
                      dataKey="speed"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Statistics;
