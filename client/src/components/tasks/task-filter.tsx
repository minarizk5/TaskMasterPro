import { FC } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface TaskFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
  filterPriority: string;
  onPriorityChange: (priority: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const TaskFilter: FC<TaskFilterProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="bg-background dark:bg-gray-900 rounded-lg p-2 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center w-full">
        {/* Search Input - Full width on mobile, partial on desktop */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {/* Filter Controls - Horizontal layout even on mobile */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 w-full md:w-auto">
          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9 min-w-[120px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                  Pending
                </div>
              </SelectItem>
              <SelectItem value="in-progress">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  In Progress
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Completed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={onPriorityChange}>
            <SelectTrigger className="h-9 min-w-[120px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  High
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 min-w-[110px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;
