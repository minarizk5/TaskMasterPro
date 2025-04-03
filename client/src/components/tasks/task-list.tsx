import { FC } from "react";
import TaskItem from "./task-item";
import { Task } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  onTasksUpdated: () => void;
}

const TaskList: FC<TaskListProps> = ({ 
  tasks, 
  isLoading, 
  isError, 
  onTasksUpdated
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-md mt-1" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-[180px] rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[320px] rounded-md" />
                    <Skeleton className="h-4 w-[280px] rounded-md" />
                    <Skeleton className="h-4 w-[200px] rounded-md" />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading your tasks. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (tasks.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-md p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="rounded-full bg-primary/10 p-4 mb-6 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            Your task list is empty. Get started by creating your first task to 
            begin organizing your work efficiently.
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show tasks
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onTaskUpdated={onTasksUpdated} 
        />
      ))}
    </div>
  );
};

export default TaskList;
