import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setLoading(true);

      const response = await authAPI.login({
        username: formData.username,
        password: formData.password
      });

      // Save tokens to localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // Save user info
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      toast.success("Tizimga muvaffaqiyatli kirdingiz!", {
        description: `Xush kelibsiz, ${response.data.user?.username || 'Admin'}`
      });

      // Redirect to dashboard
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error("Kirish xatosi", {
        description: error.response?.data?.message || "Login yoki parol noto'g'ri"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            GPS Tracking System
          </h1>
          <p className="text-muted-foreground">
            Transportlarni kuzatish tizimi
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tizimga kirish</CardTitle>
            <CardDescription className="text-center">
              Login va parolingizni kiriting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Foydalanuvchi nomi</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-10"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Kirish
                  </>
                )}
              </Button>

              {/* Default Credentials Hint */}
              <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  <span className="font-medium text-foreground">Standart login:</span> admin
                  <br />
                  <span className="font-medium text-foreground">Standart parol:</span> admin123
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2024 GPS Tracking System. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
