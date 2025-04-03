import { FC } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  User,
} from "lucide-react";

const Sidebar: FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  // Navigation items
  const navItems = [
    {
      title: "Tasks",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
      path: "/",
    },
    {
      title: "Calendar",
      icon: <CalendarDays className="h-5 w-5 mr-3" />,
      path: "/calendar",
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
      path: "/analytics",
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5 mr-3" />,
      path: "/profile",
    },
  ];

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user) return "?";
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-background border-r pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-primary">TaskMasterPro</h1>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
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
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <Avatar>
                  {user?.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {user?.name || user?.username}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
