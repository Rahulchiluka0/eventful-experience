
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, Calendar, DollarSign, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/stall-manager",
    icon: LayoutDashboard,
  },
  {
    name: "My Stalls",
    href: "/stall-manager/stalls",
    icon: Store,
  },
  {
    name: "Bookings",
    href: "/stall-manager/bookings",
    icon: Calendar,
  },
  {
    name: "Earnings",
    href: "/stall-manager/earnings",
    icon: DollarSign,
  },
  {
    name: "Settings",
    href: "/stall-manager/settings",
    icon: Settings,
  },
];

const StallManagerSidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 bg-white border-r">
      <div className="p-6">
        <Link to="/stall-manager" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">EventHub</span>
          <span className="text-sm font-medium">Stall Manager</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default StallManagerSidebar;
