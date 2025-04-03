import { FC } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "./button";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full bg-primary/90 hover:bg-primary text-white hover:text-white border-primary/20 ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};