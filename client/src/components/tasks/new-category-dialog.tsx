import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertTaskCategory } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface NewCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onCategoryCreated: () => void;
}

// Category form schema
const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().regex(/^#([0-9A-F]{6})$/i, "Must be a valid hex color code")
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const NewCategoryDialog: FC<NewCategoryDialogProps> = ({
  open,
  onClose,
  onCategoryCreated,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  // Random color generator
  const getRandomColor = () => {
    return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };
  
  // Create form with default values
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      color: getRandomColor(),
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const payload: Partial<InsertTaskCategory> = {
        ...data,
        userId: user?.id,
      };
      const res = await apiRequest("POST", "/api/categories", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      form.reset({
        name: "",
        color: getRandomColor(),
      });
      onCategoryCreated();
      toast({
        title: "Category created",
        description: "Your new category has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: CategoryFormValues) => {
    setIsCreating(true);
    try {
      createCategoryMutation.mutate(data);
    } catch (error) {
      console.error("Error submitting category form:", error);
      toast({
        title: "Form submission error",
        description: "There was an error processing your category data.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Create a new category for organizing your tasks.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Color</FormLabel>
                  <div className="flex space-x-2 items-center">
                    <Input
                      type="color"
                      {...field}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input 
                      {...field} 
                      placeholder="#RRGGBB" 
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue("color", getRandomColor())}
                    >
                      Random
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createCategoryMutation.isPending || isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending || isCreating}
              >
                {createCategoryMutation.isPending
                  ? "Creating..."
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCategoryDialog;