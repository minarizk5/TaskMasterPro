import { FC, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional(),
  avatar: z.string().optional(),
  birthday: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const EditProfileDialog: FC<EditProfileDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const { updateProfileMutation } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username,
      email: user.email || "",
      avatar: user.avatar || "",
      birthday: user.birthday || "",
    },
  });

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // This is a placeholder for file upload functionality
      // In a real implementation, you would upload the file to a server
      // and then update the avatarPreview state with the URL
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarPreview(reader.result);
          form.setValue("avatar", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <label
                    htmlFor="avatar-upload"
                    className="bg-primary text-white rounded-full p-1.5 cursor-pointer shadow-sm flex items-center justify-center"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthday</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
