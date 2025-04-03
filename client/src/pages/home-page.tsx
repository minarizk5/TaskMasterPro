import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import MainLayout from "@/layouts/main-layout";
import TaskList from "@/components/tasks/task-list";
import TaskFilter from "@/components/tasks/task-filter";
import NewTaskDialog from "@/components/tasks/new-task-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function HomePage() {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  
  // Fetch tasks
  const { data: tasks, isLoading, isError, refetch } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Filter and sort tasks
  const filteredTasks = tasks
    ? tasks
        .filter((task) => {
          // Filter by status
          if (filterStatus !== "all" && task.status !== filterStatus) {
            return false;
          }
          // Filter by priority
          if (filterPriority !== "all" && task.priority !== filterPriority) {
            return false;
          }
          // Filter by search query
          if (
            searchQuery &&
            !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // Sort by selected criteria
          if (sortBy === "dueDate") {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          } else if (sortBy === "priority") {
            const priorityMap: Record<string, number> = {
              high: 3,
              medium: 2,
              low: 1,
            };
            return (
              (priorityMap[b.priority as string] || 0) -
              (priorityMap[a.priority as string] || 0)
            );
          } else if (sortBy === "title") {
            return a.title.localeCompare(b.title);
          }
          return 0;
        })
    : [];

  const handleTaskCreated = () => {
    refetch();
    setIsNewTaskOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Your Tasks
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and organize your daily activities efficiently
            </p>
          </div>
          <Button
            onClick={() => setIsNewTaskOpen(true)}
            className="inline-flex items-center justify-center shadow-sm transition-all hover:shadow-md"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        </div>

        <TaskFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onPriorityChange={setFilterPriority}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="mt-6">
          {filteredTasks.length > 0 && !isLoading && (
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
              </h2>
              <div className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {sortBy === 'dueDate' ? 'Sorted by due date' : 
                 sortBy === 'priority' ? 'Sorted by priority' : 
                 'Sorted by title'}
              </div>
            </div>
          )}

          <TaskList
            tasks={filteredTasks}
            isLoading={isLoading}
            isError={isError}
            onTasksUpdated={refetch}
          />
        </div>

        <NewTaskDialog
          open={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
        
        {/* Mobile Add Task Floating Button */}
        <div className="lg:hidden fixed right-6 bottom-20 z-10">
          <Button
            onClick={() => setIsNewTaskOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-primary hover:bg-primary/90 p-0"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
