import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  PlusCircle, 
  Car, 
  Truck, 
  Bike,
  User,
  Phone,
  MapPin,
  Fuel,
  Settings,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

const AddVehicle = () => {
  const [vehicleType, setVehicleType] = useState("car");
  const [formData, setFormData] = useState({
    name: "",
    plateNumber: "",
    model: "",
    year: "",
    color: "",
    fuelType: "benzin",
    driverName: "",
    driverPhone: "",
    notes: "",
    enableGeofence: true,
    enableSpeedAlert: true,
    maxSpeed: "100",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.plateNumber) {
      toast.error("Majburiy maydonlarni to'ldiring", {
        description: "Transport nomi va raqami kiritilishi shart"
      });
      return;
    }

    toast.success("Transport muvaffaqiyatli qo'shildi!", {
      description: `${formData.name} (${formData.plateNumber}) tizimga qo'shildi`
    });

    // Reset form
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      plateNumber: "",
      model: "",
      year: "",
      color: "",
      fuelType: "benzin",
      driverName: "",
      driverPhone: "",
      notes: "",
      enableGeofence: true,
      enableSpeedAlert: true,
      maxSpeed: "100",
    });
    setVehicleType("car");
    toast.info("Forma tozalandi");
  };

  const getVehicleIcon = () => {
    switch (vehicleType) {
      case "truck": return <Truck className="w-6 h-6" />;
      case "motorcycle": return <Bike className="w-6 h-6" />;
      default: return <Car className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-[101]">
        <ThemeToggle />
      </div>

      <main className="pt-20 pb-8 px-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-primary" />
            Yangi transport qo'shish
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kuzatuv tizimiga yangi transport vositasini qo'shing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Type */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {getVehicleIcon()}
                Transport turi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: "car", label: "Avtomobil", icon: Car },
                  { type: "truck", label: "Yuk mashina", icon: Truck },
                  { type: "motorcycle", label: "Mototsikl", icon: Bike },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleType(type)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      vehicleType === type
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${vehicleType === type ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${vehicleType === type ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Asosiy ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Transport nomi *</Label>
                  <Input
                    id="name"
                    placeholder="Masalan: Toyota Camry"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Davlat raqami *</Label>
                  <Input
                    id="plateNumber"
                    placeholder="01A123BC"
                    value={formData.plateNumber}
                    onChange={(e) => handleInputChange("plateNumber", e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="Camry 50"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Ishlab chiqarilgan yil</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2020"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Rangi</Label>
                  <Input
                    id="color"
                    placeholder="Oq"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Yoqilg'i turi</Label>
                <Select value={formData.fuelType} onValueChange={(v) => handleInputChange("fuelType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benzin">Benzin</SelectItem>
                    <SelectItem value="dizel">Dizel</SelectItem>
                    <SelectItem value="gaz">Gaz (Metan)</SelectItem>
                    <SelectItem value="elektr">Elektr</SelectItem>
                    <SelectItem value="gibrid">Gibrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Driver Info */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Haydovchi ma'lumotlari
              </CardTitle>
              <CardDescription>Ixtiyoriy - keyinroq ham qo'shish mumkin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Haydovchi ismi</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="driverName"
                      placeholder="Ism Familiya"
                      value={formData.driverName}
                      onChange={(e) => handleInputChange("driverName", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Telefon raqami</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="driverPhone"
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={formData.driverPhone}
                      onChange={(e) => handleInputChange("driverPhone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Settings */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Kuzatuv sozlamalari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Geo-chegara ogohlantirishlari</p>
                  <p className="text-sm text-muted-foreground">Transport belgilangan hududdan chiqqanda xabar berish</p>
                </div>
                <Switch
                  checked={formData.enableGeofence}
                  onCheckedChange={(v) => handleInputChange("enableGeofence", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tezlik ogohlantirishlari</p>
                  <p className="text-sm text-muted-foreground">Belgilangan tezlikdan oshganda xabar berish</p>
                </div>
                <Switch
                  checked={formData.enableSpeedAlert}
                  onCheckedChange={(v) => handleInputChange("enableSpeedAlert", v)}
                />
              </div>

              {formData.enableSpeedAlert && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="maxSpeed">Maksimal tezlik chegarasi (km/s)</Label>
                  <Input
                    id="maxSpeed"
                    type="number"
                    value={formData.maxSpeed}
                    onChange={(e) => handleInputChange("maxSpeed", e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="glass-panel border-border/30">
            <CardHeader>
              <CardTitle className="text-base">Qo'shimcha izohlar</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Transport haqida qo'shimcha ma'lumotlar..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Tozalash
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Saqlash
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddVehicle;
