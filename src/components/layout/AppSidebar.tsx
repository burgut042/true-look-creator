import { Link, useLocation } from "react-router-dom";
import { Map, BarChart3, History, PlusCircle, Navigation } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Xarita", icon: Map },
  { path: "/statistics", label: "Statistika", icon: BarChart3 },
  { path: "/history", label: "Tarix", icon: History },
  { path: "/add-vehicle", label: "Obekt qo'shish", icon: PlusCircle },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b border-border/30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground">Elektron kuzatuv & GPS</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigatsiya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-2",
                          isActive && "text-primary"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
