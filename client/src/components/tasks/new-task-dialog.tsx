import { FC, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTaskSchema, TaskPriority, TaskStatus } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface NewTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  initialDate?: Date;
}

// Create a task form schema extending the insertTaskSchema
const taskFormSchema = insertTaskSchema.extend({
  // Use both date and string types for dueDate with validation
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const NewTaskDialog: FC<NewTaskDialogProps> = ({
  open,
  onClose,
  onTaskCreated,
  initialDate,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  // Create form with default values
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "", // Make sure description is never null
      dueDate: initialDate,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      userId: user?.id,
    },
  });

  // Set userId when user is available
  useEffect(() => {
    if (user) {
      form.setValue('userId', user.id);
    }
  }, [user, form]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      form.reset();
      onTaskCreated();
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    try {
      // Ensure we have a proper date object or null for dueDate
      const formattedData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      };
      createTaskMutation.mutate(formattedData);
    } catch (error) {
      console.error("Error submitting task form:", error);
      toast({
        title: "Form submission error",
        description: "There was an error processing your task data.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description (supports markdown)"
                      className="min-h-[100px] resize-y"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <DatePicker
                    date={field.value}
                    onDateChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Add Attachments</FormLabel>
              <div className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Drag files here or click to upload
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    (This feature is coming soon)
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createTaskMutation.isPending || isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending || isUploading}
              >
                {createTaskMutation.isPending
                  ? "Creating..."
                  : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskDialog;
