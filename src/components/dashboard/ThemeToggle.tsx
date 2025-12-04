import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check if already has dark class or default to dark
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light');
    }
    return true;
  });

  useEffect(() => {
    // Set dark mode by default on first load
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    toast.success(isDark ? "Kunduzgi rejim yoqildi" : "Tungi rejim yoqildi");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};
