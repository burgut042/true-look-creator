import { Link, useLocation, useNavigate } from "react-router-dom";
import { Map, BarChart3, History, PlusCircle, Navigation, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

const navItems = [
  { path: "/", label: "Xarita", icon: Map },
  { path: "/statistics", label: "Statistika", icon: BarChart3 },
  { path: "/history", label: "Tarix", icon: History },
  { path: "/add-vehicle", label: "Obekt qo'shish", icon: PlusCircle },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get username from localStorage
  const userStr = localStorage.getItem('user');
  const username = userStr ? JSON.parse(userStr).username : 'Admin';

  const handleLogout = async () => {
    try {
      // Try to call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear tokens and user data regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      toast.success("Tizimdan chiqdingiz", {
        description: "Xayr, ko'rishguncha!"
      });

      // Redirect to login
      navigate('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass-panel border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">GPS Tracker</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* User Info and Logout */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/30">
              <div className="hidden md:flex items-center gap-2 px-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{username}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
                title="Chiqish"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Chiqish</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
