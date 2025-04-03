import { FC } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  User,
  X,
} from "lucide-react";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

const MobileSidebar: FC<MobileSidebarProps> = ({ open, onClose }) => {
  const [location] = useLocation();

  // Navigation items
  const navItems = [
    {
      title: "Tasks",
      icon: <LayoutDashboard className="h-6 w-6 mr-3" />,
      path: "/",
    },
    {
      title: "Calendar",
      icon: <CalendarDays className="h-6 w-6 mr-3" />,
      path: "/calendar",
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-6 w-6 mr-3" />,
      path: "/analytics",
    },
    {
      title: "Profile",
      icon: <User className="h-6 w-6 mr-3" />,
      path: "/profile",
    },
  ];

  // If the sidebar is not open, don't render anything
  if (!open) {
    return null;
  }

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Sidebar content */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-background shadow-xl">
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-bold text-primary">TaskMasterPro</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center px-4 py-3 rounded-md cursor-pointer transition-colors",
                  location === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
