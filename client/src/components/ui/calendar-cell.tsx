import { FC } from "react";
import { cn } from "@/lib/utils";
import { Task } from "@shared/schema";

interface CalendarCellProps {
  day: number | null;
  isToday?: boolean;
  isCurrentMonth: boolean;
  tasks: Task[];
  onClick?: () => void;
}

const CalendarCell: FC<CalendarCellProps> = ({
  day,
  isToday = false,
  isCurrentMonth,
  tasks,
  onClick,
}) => {
  if (!day) {
    return <div className="border border-gray-200 dark:border-gray-700 p-1 h-24 bg-gray-50 dark:bg-gray-800/20"></div>;
  }

  const hasTasks = tasks.length > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "border border-gray-200 dark:border-gray-700 p-1 h-24 transition-colors",
        isCurrentMonth ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500",
        isToday && "bg-blue-50 dark:bg-blue-900/20",
        "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
      )}
    >
      <div className="flex flex-col h-full">
        <span 
          className={cn(
            "text-center font-medium",
            isToday && "text-primary font-bold"
          )}
        >
          {day}
        </span>
        <div className="flex-grow mt-1 flex flex-col items-center gap-1 overflow-hidden">
          {hasTasks && (
            <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>
          )}
          {tasks.slice(0, 2).map((task) => (
            <div 
              key={task.id} 
              className="text-xs truncate w-full px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-center"
              title={task.title}
            >
              {task.title}
            </div>
          ))}
          {tasks.length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{tasks.length - 2} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarCell;
