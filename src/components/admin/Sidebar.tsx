
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Bell,
  User,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "User Verification",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Event Verification",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    name: "Sales Tracking",
    href: "/admin/sales",
    icon: DollarSign,
  },
  {
    name: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Notifications & Logs",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: User,
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 bg-white border-r">
      <div className="p-6">
        <Link to="/admin" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">EventHub</span>
          <span className="text-sm font-medium">Admin</span>
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

export default Sidebar;
