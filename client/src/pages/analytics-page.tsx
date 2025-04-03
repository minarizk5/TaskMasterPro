import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import ChartCard from "@/components/analytics/chart-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type CompletionStats = {
  completed: number;
  inProgress: number;
  pending: number;
};

type CategoryStats = {
  category: string;
  count: number;
};

type WeeklyStats = {
  day: string;
  count: number;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("month");

  // Fetch analytics data
  const { data: completionStats, isLoading: isLoadingCompletion } = useQuery<CompletionStats>({
    queryKey: ["/api/analytics/completion"],
  });

  const { data: categoryStats, isLoading: isLoadingCategories } = useQuery<CategoryStats[]>({
    queryKey: ["/api/analytics/categories"],
  });

  const { data: weeklyStats, isLoading: isLoadingWeekly } = useQuery<WeeklyStats[]>({
    queryKey: ["/api/analytics/weekly"],
  });

  // Calculate productivity score (example formula)
  const productivityScore = () => {
    if (!completionStats) return 0;
    
    const total = completionStats.completed + completionStats.inProgress + completionStats.pending;
    if (total === 0) return 0;
    
    return Math.round((completionStats.completed / total) * 100);
  };

  // Colors for the charts
  const colors = {
    completed: "#10b981", // green
    inProgress: "#f59e0b", // yellow
    pending: "#ef4444", // red
    primary: "#0070F3", // primary blue
    secondary: "#FF0080", // pink
    accent: "#7928CA", // purple
    green: "#50C878", // green
  };

  // Colors for the category pie chart
  const categoryColors = [colors.primary, colors.secondary, colors.accent, colors.green];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="inline-flex shadow-sm rounded-md">
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              onClick={() => setTimeRange("week")}
              className="rounded-l-md"
            >
              Week
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              onClick={() => setTimeRange("month")}
              className="rounded-none"
            >
              Month
            </Button>
            <Button
              variant={timeRange === "year" ? "default" : "outline"}
              onClick={() => setTimeRange("year")}
              className="rounded-r-md"
            >
              Year
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Productivity Score */}
          <ChartCard title="Productivity Score" isLoading={isLoadingCompletion}>
            <div className="flex items-center">
              <div className="w-24 h-24 mr-4 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E9ECEF"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0070F3"
                    strokeWidth="3"
                    strokeDasharray={`${productivityScore()}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{productivityScore()}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your productivity is{" "}
                  <span className="text-green-500">
                    {productivityScore() > 70 ? "high" : "average"}
                  </span>{" "}
                  this {timeRange}.
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                  <span>On track</span>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Task Completion */}
          <ChartCard title="Task Completion" isLoading={isLoadingCompletion}>
            <div className="space-y-3">
              {completionStats && (
                <>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">
                        {completionStats.completed} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            completionStats.completed +
                              completionStats.inProgress +
                              completionStats.pending ===
                            0
                              ? 0
                              : (completionStats.completed /
                                  (completionStats.completed +
                                    completionStats.inProgress +
                                    completionStats.pending)) *
                                100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">In Progress</span>
                      <span className="text-sm font-medium">
                        {completionStats.inProgress} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${
                            completionStats.completed +
                              completionStats.inProgress +
                              completionStats.pending ===
                            0
                              ? 0
                              : (completionStats.inProgress /
                                  (completionStats.completed +
                                    completionStats.inProgress +
                                    completionStats.pending)) *
                                100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-medium">
                        {completionStats.pending} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${
                            completionStats.completed +
                              completionStats.inProgress +
                              completionStats.pending ===
                            0
                              ? 0
                              : (completionStats.pending /
                                  (completionStats.completed +
                                    completionStats.inProgress +
                                    completionStats.pending)) *
                                100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ChartCard>

          {/* Weekly Activity */}
          <ChartCard
            title="Weekly Activity"
            isLoading={isLoadingWeekly}
            className="md:col-span-2"
          >
            <div className="h-64">
              {weeklyStats && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyStats}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={colors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          {/* Most Productive Time */}
          <ChartCard title="Most Productive Time" isLoading={false}>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <div className="text-sm">
                  You complete most tasks between{" "}
                  <span className="font-medium">9 AM - 11 AM</span>
                </div>
              </div>
              <div className="w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="h-full bg-gray-200 dark:bg-gray-600"
                    style={{ width: "15%" }}
                  ></div>
                  <div
                    className="h-full bg-primary"
                    style={{ width: "25%" }}
                  ></div>
                  <div
                    className="h-full bg-gray-200 dark:bg-gray-600"
                    style={{ width: "30%" }}
                  ></div>
                  <div
                    className="h-full bg-secondary"
                    style={{ width: "20%" }}
                  ></div>
                  <div
                    className="h-full bg-gray-200 dark:bg-gray-600"
                    style={{ width: "10%" }}
                  ></div>
                </div>
              </div>
              <div className="text-xs flex justify-between text-gray-500 dark:text-gray-400">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>12 AM</span>
              </div>
            </div>
          </ChartCard>

          {/* Task Categories */}
          <ChartCard title="Task Categories" isLoading={isLoadingCategories}>
            {categoryStats && categoryStats.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="count"
                      nameKey="category"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={categoryColors[index % categoryColors.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                No category data available
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </MainLayout>
  );
}
