import { useState, useEffect } from "react";
import { Settings2, Car, Info, BarChart2, PanelLeft, Eye, EyeOff } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const PANELS_STORAGE_KEY = "visible-panels";

export interface PanelVisibility {
  trackingParams: boolean;
  vehicleToggle: boolean;
  vehicleInfo: boolean;
  trackingResults: boolean;
}

const defaultPanels: PanelVisibility = {
  trackingParams: false,
  vehicleToggle: false,
  vehicleInfo: false,
  trackingResults: false,
};

export const usePanelVisibility = () => {
  const [panels, setPanels] = useState<PanelVisibility>(() => {
    const saved = localStorage.getItem(PANELS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultPanels;
  });

  useEffect(() => {
    localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(panels));
  }, [panels]);

  const togglePanel = (key: keyof PanelVisibility) => {
    setPanels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showAll = () => setPanels(defaultPanels);
  const hideAll = () => setPanels({
    trackingParams: false,
    vehicleToggle: false,
    vehicleInfo: false,
    trackingResults: false,
  });

  return { panels, togglePanel, showAll, hideAll };
};

interface HeaderProps {
  panels: PanelVisibility;
  onTogglePanel: (key: keyof PanelVisibility) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export const Header = ({ panels, onTogglePanel, onShowAll, onHideAll }: HeaderProps) => {
  const panelItems = [
    { key: "trackingParams" as const, label: "Kuzatuv sozlamalari", icon: Settings2 },
    { key: "vehicleToggle" as const, label: "Transport holati", icon: Car },
    { key: "vehicleInfo" as const, label: "Transport ma'lumotlari", icon: Info },
    { key: "trackingResults" as const, label: "Kuzatuv natijalari", icon: BarChart2 },
  ];

  const visibleCount = Object.values(panels).filter(Boolean).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] glass-panel border-b border-border/30 h-14">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left - Sidebar Trigger */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>

        {/* Right - Panel Controls & Theme */}
        <div className="flex items-center gap-2">
          {/* Panel Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PanelLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Panellar</span>
                <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                  {visibleCount}/4
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ko'rinadigan panellar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {panelItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuCheckboxItem
                    key={item.key}
                    checked={panels[item.key]}
                    onCheckedChange={() => onTogglePanel(item.key)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
              
              <DropdownMenuSeparator />
              
              <div className="flex gap-1 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={onShowAll}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Barchasi
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={onHideAll}
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  Yashirish
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
