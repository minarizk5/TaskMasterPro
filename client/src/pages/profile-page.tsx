import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import EditProfileDialog from "@/components/profile/edit-profile-dialog";
import { PencilIcon, ShieldCheck } from "lucide-react";
import { Task, TaskStatus } from "@shared/schema";

export default function ProfilePage() {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Fetch tasks to calculate real stats
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Calculate actual user stats based on tasks data
  const calculateUserStats = () => {
    const completed = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const inProgress = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    
    // For demo purposes, we'll calculate a simple streak
    // In a real app, this would be based on daily task completion
    const daysStreak = Math.min(completed, 7);
    
    return { completed, inProgress, daysStreak };
  };
  
  const userStats = calculateUserStats();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "This feature is not yet implemented.",
      variant: "destructive",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button
            onClick={() => setEditProfileOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow">
                    <span className="text-4xl font-medium text-primary">
                      {user.name?.charAt(0) || user.username?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name || "Anonymous User"}</h2>
                <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                {user.email && (
                  <div className="mt-2 flex items-center text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{user.email}</span>
                  </div>
                )}
                <div className="mt-1 flex items-center text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">
                  {userStats.completed}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tasks Completed
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">
                  {userStats.inProgress}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tasks In Progress
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">
                  {userStats.daysStreak}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Days Streak
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Account Security</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can log out of your account or delete your account permanently from here. 
                Deleting your account will remove all your data from our servers.
              </p>
              
              <Separator />
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="justify-center"
                >
                  Log Out
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="justify-center"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        <EditProfileDialog
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          user={user}
        />
      </div>
    </MainLayout>
  );
}
