import { FC, useState } from "react";
import { format } from "date-fns";
import { Task, TaskStatus } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import Markdown from "@/components/ui/markdown";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Task;
  onTaskUpdated: () => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onTaskUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    priority: task.priority,
    status: task.status,
  });
  const { toast } = useToast();

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<Task>) => {
      const res = await apiRequest(
        "PUT",
        `/api/tasks/${task.id}`,
        updatedTask
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onTaskUpdated();
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onTaskUpdated();
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle task completion
  const toggleTaskCompletion = () => {
    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.PENDING
        : TaskStatus.COMPLETED;
    updateTaskMutation.mutate({ status: newStatus });
  };

  // Get priority badge class
  const getPriorityBadgeClass = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Handle edit form changes
  const handleEditChange = (field: string, value: any) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  // Handle edit form submission
  const handleEditSubmit = () => {
    try {
      // Format the data consistently to avoid issues with date serialization
      const formattedEditedTask = {
        ...editedTask,
        dueDate: editedTask.dueDate ? new Date(editedTask.dueDate) : undefined
      };
      updateTaskMutation.mutate(formattedEditedTask);
    } catch (error) {
      console.error("Error submitting edit form:", error);
      toast({
        title: "Form submission error",
        description: "There was an error processing your task data.",
        variant: "destructive",
      });
    }
  };

  // Handle delete confirmation
  const handleDelete = () => {
    deleteTaskMutation.mutate();
  };

  return (
    <>
      <div 
        className={cn(
          "task-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all",
          "border-l-4 shadow-sm hover:shadow-md",
          "transform hover:-translate-y-1 duration-200",
          task.priority === "high" ? "border-l-red-500" : 
          task.priority === "medium" ? "border-l-amber-500" : 
          "border-l-green-500"
        )}
      >
        <div className="px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Checkbox
                checked={task.status === TaskStatus.COMPLETED}
                onCheckedChange={toggleTaskCompletion}
                className={cn(
                  "mt-1 h-5 w-5 rounded-md transition-all",
                  task.status === TaskStatus.COMPLETED ? "opacity-100" : "opacity-80"
                )}
              />
              <div className="ml-3">
                <h3
                  className={cn(
                    "text-lg font-medium transition-all",
                    task.status === TaskStatus.COMPLETED 
                      ? "line-through opacity-60 text-gray-500" 
                      : "text-gray-900 dark:text-gray-50"
                  )}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <div 
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      task.status === TaskStatus.COMPLETED
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    <Markdown content={task.description} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  getPriorityBadgeClass()
                )}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {task.dueDate && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <div 
                className={cn(
                  "flex items-center rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-700",
                  new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED 
                    ? "text-red-500 dark:text-red-400" 
                    : "text-gray-600 dark:text-gray-300"
                )}
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {(() => {
                    try {
                      const dueDate = new Date(task.dueDate);
                      const today = new Date();
                      const tomorrow = new Date();
                      tomorrow.setDate(today.getDate() + 1);
                      
                      if (dueDate.toDateString() === today.toDateString()) {
                        return "Today";
                      } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                        return "Tomorrow";
                      } else {
                        return format(dueDate, "MMM d, yyyy");
                      }
                    } catch (error) {
                      console.error("Error formatting date:", error);
                      return "Invalid date";
                    }
                  })()}
                </span>
              </div>
              
              {task.status === TaskStatus.IN_PROGRESS && (
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full px-2.5 py-1">
                  In Progress
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => handleEditChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedTask.description || ""}
                onChange={(e) =>
                  handleEditChange("description", e.target.value)
                }
                placeholder="Supports markdown formatting"
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <DatePicker
                  date={
                    editedTask.dueDate
                      ? new Date(editedTask.dueDate)
                      : undefined
                  }
                  onDateChange={(date) => handleEditChange("dueDate", date)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editedTask.priority}
                  onValueChange={(value) => handleEditChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) => handleEditChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={updateTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskItem;
