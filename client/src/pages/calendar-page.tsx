import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";
import { Task } from "@shared/schema";
import MainLayout from "@/layouts/main-layout";
import CalendarCell from "@/components/ui/calendar-cell";
import NewTaskDialog from "@/components/tasks/new-task-dialog";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  // Fetch all tasks
  const { data: tasks, isLoading, refetch } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Navigate to previous month
  const prevMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };
  
  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Get days for the calendar grid
  const getDaysInMonth = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    
    const firstDayOfMonth = start.getDay();
    
    // Add empty days for the beginning of the month
    const daysWithEmptyStart = Array(firstDayOfMonth).fill(null).concat(days);
    
    // Ensure we have a complete grid (6 rows x 7 days)
    const totalCells = 42;
    const remainingCells = totalCells - daysWithEmptyStart.length;
    
    return daysWithEmptyStart.concat(Array(remainingCells > 0 ? remainingCells : 0).fill(null));
  };
  
  // Get tasks for a specific day
  const getTasksForDay = (day: Date | null) => {
    if (!day || !tasks) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      // Handle different date types (string, Date object, or ISO string)
      let taskDate: Date;
      try {
        if (typeof task.dueDate === 'string') {
          taskDate = parseISO(task.dueDate);
        } else if (task.dueDate instanceof Date) {
          taskDate = task.dueDate;
        } else {
          // Try to convert from timestamp or other format
          taskDate = new Date(task.dueDate);
        }
        
        // Validate that we have a valid date
        if (isNaN(taskDate.getTime())) {
          console.warn('Invalid date found:', task.dueDate);
          return false;
        }
        
        return (
          taskDate.getDate() === day.getDate() &&
          taskDate.getMonth() === day.getMonth() &&
          taskDate.getFullYear() === day.getFullYear()
        );
      } catch (error) {
        console.error('Error parsing date:', error);
        return false;
      }
    });
  };
  
  // Handle day selection
  const handleDayClick = (day: Date | null) => {
    if (day) {
      setSelectedDay(day);
    }
  };
  
  // Handle task creation
  const handleTaskCreated = () => {
    refetch();
    setIsNewTaskOpen(false);
  };
  
  // Get today's tasks for mobile view
  const todaysTasks = tasks ? getTasksForDay(new Date()) : [];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <Button
            onClick={() => setIsNewTaskOpen(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold mx-4">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={goToToday} className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Today</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-7 border-t border-gray-200 dark:border-gray-700">
            {/* Weekday headers */}
            {weekdays.map((day, index) => (
              <div 
                key={index} 
                className="py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {getDaysInMonth().map((day, index) => (
              <CalendarCell
                key={index}
                day={day ? day.getDate() : null}
                isToday={day ? isToday(day) : false}
                isCurrentMonth={day ? isSameMonth(day, selectedDate) : false}
                tasks={day ? getTasksForDay(day) : []}
                onClick={() => handleDayClick(day)}
              />
            ))}
          </div>
        </div>
        
        {/* Daily Task List Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">
            {selectedDay ? `Tasks for ${format(selectedDay, 'MMMM d, yyyy')}` : "Today's Tasks"}
          </h2>
          <div className="space-y-3">
            {(selectedDay ? getTasksForDay(selectedDay) : todaysTasks).length > 0 ? (
              (selectedDay ? getTasksForDay(selectedDay) : todaysTasks).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input 
                    type="checkbox" 
                    checked={task.status === 'completed'} 
                    onChange={() => {
                      // We'll implement this functionality in the task component
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary rounded"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {task.dueDate && (() => {
                        try {
                          return format(new Date(task.dueDate), 'h:mm a');
                        } catch (error) {
                          return '';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No tasks scheduled for this day.</p>
            )}
          </div>
        </div>
        
        <NewTaskDialog
          open={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
          onTaskCreated={handleTaskCreated}
          initialDate={selectedDay || undefined}
        />
      </div>
    </MainLayout>
  );
}
