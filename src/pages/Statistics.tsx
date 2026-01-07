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
  Activity
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

const weeklyData = [
  { name: "Dush", distance: 245, fuel: 32 },
  { name: "Sesh", distance: 312, fuel: 41 },
  { name: "Chor", distance: 198, fuel: 26 },
  { name: "Pay", distance: 287, fuel: 38 },
  { name: "Jum", distance: 356, fuel: 47 },
  { name: "Shan", distance: 142, fuel: 19 },
  { name: "Yak", distance: 89, fuel: 12 },
];

const vehicleUsage = [
  { name: "Toyota Camry", value: 35, color: "#22d3ee" },
  { name: "Chevrolet Lacetti", value: 28, color: "#8b5cf6" },
  { name: "Isuzu NPR", value: 22, color: "#22c55e" },
  { name: "Boshqalar", value: 15, color: "#f59e0b" },
];

const speedData = [
  { time: "06:00", speed: 45 },
  { time: "08:00", speed: 62 },
  { time: "10:00", speed: 78 },
  { time: "12:00", speed: 55 },
  { time: "14:00", speed: 68 },
  { time: "16:00", speed: 82 },
  { time: "18:00", speed: 71 },
  { time: "20:00", speed: 48 },
  { time: "22:00", speed: 35 },
];

const Statistics = () => {
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
                  <p className="text-2xl font-bold">1,629 km</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>+12% o'tgan haftaga nisbatan</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Yoqilg'i sarfi</p>
                  <p className="text-2xl font-bold">215 L</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Fuel className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-red-500">
                <TrendingDown className="w-3 h-3" />
                <span>-5% o'tgan haftaga nisbatan</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Faol transport</p>
                  <p className="text-2xl font-bold">8 / 12</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>4 ta kutish rejimida</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">O'rtacha tezlik</p>
                  <p className="text-2xl font-bold">58 km/s</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-violet-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span>+3% o'tgan haftaga nisbatan</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Distance Chart */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base">Haftalik masofa va yoqilg'i</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Statistics;
