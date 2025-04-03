import { users, tasks, taskCategories, type User, type InsertUser, type Task, type InsertTask, type TaskCategory, type InsertTaskCategory, TaskStatus } from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { db } from "./db";
import { eq, gte, lte, and, sql } from "drizzle-orm";

// Create Postgres store for sessions
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getUserTasks(userId: number): Promise<Task[]>;
  updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByDate(userId: number, date: Date): Promise<Task[]>;
  getTasksByStatus(userId: number, status: string): Promise<Task[]>;
  getTasksByPriority(userId: number, priority: string): Promise<Task[]>;
  
  // Task categories
  createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory>;
  getTaskCategories(userId: number): Promise<TaskCategory[]>;
  
  // Analytics data
  getTaskCompletionStats(userId: number): Promise<{ completed: number, inProgress: number, pending: number }>;
  getTasksByCategory(userId: number): Promise<{ category: string, count: number }[]>;
  getWeeklyActivity(userId: number): Promise<{ day: string, count: number }[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL
      },
      createTableIfMissing: true,
    });
    
    // Initialize the database with the default task categories
    this.seedCategoriesIfNeeded();
  }

  private async seedCategoriesIfNeeded() {
    try {
      // Check if we have already seeded the default categories
      const defaultCategories = await db.select().from(taskCategories).where(eq(taskCategories.userId, 0));
      
      if (defaultCategories.length === 0) {
        // Seed default categories
        await db.insert(taskCategories).values([
          { name: 'Work', color: '#0070F3', userId: 0 },
          { name: 'Personal', color: '#FF0080', userId: 0 },
          { name: 'Learning', color: '#7928CA', userId: 0 },
          { name: 'Health', color: '#50C878', userId: 0 }
        ]);
      }
    } catch (error) {
      console.error("Error seeding default categories:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
        
      // Copy default categories for this user
      const defaultCategories = await db
        .select()
        .from(taskCategories)
        .where(eq(taskCategories.userId, 0));
        
      // Generate unique names for user's categories to avoid unique constraint violations
      for (const category of defaultCategories) {
        try {
          await db.insert(taskCategories).values({
            name: `${category.name}-${user.id}`, // Make category name unique per user
            color: category.color,
            userId: user.id
          });
        } catch (err) {
          console.error(`Failed to create category ${category.name} for user ${user.id}:`, err);
          // Continue with other categories even if one fails
        }
      }
      
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    try {
      const now = new Date();
      // Create a copy to avoid mutating the original
      const taskCopy = { ...task };
      
      // Handle date validation and conversion
      if (taskCopy.dueDate !== undefined && taskCopy.dueDate !== null) {
        try {
          if (typeof taskCopy.dueDate === 'string') {
            taskCopy.dueDate = new Date(taskCopy.dueDate);
          } else if (!(taskCopy.dueDate instanceof Date)) {
            try {
              taskCopy.dueDate = new Date(taskCopy.dueDate);
            } catch {
              taskCopy.dueDate = null;
            }
          }
          
          // Validate date
          if (taskCopy.dueDate !== null && isNaN(taskCopy.dueDate.getTime())) {
            taskCopy.dueDate = null;
          }
        } catch (error) {
          console.error("Error converting dueDate in createTask:", error);
          taskCopy.dueDate = null;
        }
      }
      
      const [newTask] = await db
        .insert(tasks)
        .values({
          ...taskCopy,
          updatedAt: now
        })
        .returning();
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async getTask(id: number): Promise<Task | undefined> {
    try {
      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id));
      return task;
    } catch (error) {
      console.error("Error fetching task:", error);
      return undefined;
    }
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    try {
      const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId));
      return userTasks;
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      return [];
    }
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    try {
      // Make a copy so we don't mutate the original
      const taskDataCopy = { ...taskData };
      
      // Handle dueDate conversion - ensure it's a proper Date object if present
      if (taskDataCopy.dueDate !== undefined && taskDataCopy.dueDate !== null) {
        try {
          if (typeof taskDataCopy.dueDate === 'string') {
            taskDataCopy.dueDate = new Date(taskDataCopy.dueDate);
          } else if (!(taskDataCopy.dueDate instanceof Date)) {
            // If it's not a Date and not a string, attempt to convert or set to null
            try {
              taskDataCopy.dueDate = new Date(taskDataCopy.dueDate);
            } catch {
              taskDataCopy.dueDate = null;
            }
          }
          
          // Validate the date (will throw if invalid)
          if (taskDataCopy.dueDate !== null && isNaN(taskDataCopy.dueDate.getTime())) {
            taskDataCopy.dueDate = null;
          }
        } catch (error) {
          console.error("Error converting dueDate:", error);
          taskDataCopy.dueDate = null; // Set to null if invalid
        }
      }
      
      const [updatedTask] = await db
        .update(tasks)
        .set({
          ...taskDataCopy,
          updatedAt: new Date()
        })
        .where(eq(tasks.id, id))
        .returning();
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      return undefined;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      await db.delete(tasks).where(eq(tasks.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      return false;
    }
  }

  async getTasksByDate(userId: number, date: Date): Promise<Task[]> {
    try {
      // Validate the date
      let validDate: Date;
      try {
        if (typeof date === 'string') {
          validDate = new Date(date);
        } else if (!(date instanceof Date)) {
          validDate = new Date();
        } else {
          validDate = date;
        }
        
        if (isNaN(validDate.getTime())) {
          validDate = new Date(); // Default to current date if invalid
        }
      } catch (error) {
        console.error("Error validating date in getTasksByDate:", error);
        validDate = new Date(); // Default to current date if any error
      }
      
      const startOfDay = new Date(validDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(validDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const tasksByDate = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            gte(tasks.dueDate, startOfDay),
            lte(tasks.dueDate, endOfDay)
          )
        );
      return tasksByDate;
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      return [];
    }
  }

  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    try {
      const tasksByStatus = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.status, status)
          )
        );
      return tasksByStatus;
    } catch (error) {
      console.error("Error fetching tasks by status:", error);
      return [];
    }
  }

  async getTasksByPriority(userId: number, priority: string): Promise<Task[]> {
    try {
      const tasksByPriority = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.priority, priority)
          )
        );
      return tasksByPriority;
    } catch (error) {
      console.error("Error fetching tasks by priority:", error);
      return [];
    }
  }

  // Task categories
  async createTaskCategory(category: InsertTaskCategory): Promise<TaskCategory> {
    try {
      const [newCategory] = await db
        .insert(taskCategories)
        .values(category)
        .returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating task category:", error);
      throw error;
    }
  }

  async getTaskCategories(userId: number): Promise<TaskCategory[]> {
    try {
      const categories = await db
        .select()
        .from(taskCategories)
        .where(eq(taskCategories.userId, userId));
      return categories;
    } catch (error) {
      console.error("Error fetching task categories:", error);
      return [];
    }
  }

  // Analytics data
  async getTaskCompletionStats(userId: number): Promise<{ completed: number, inProgress: number, pending: number }> {
    try {
      const completedTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.status, TaskStatus.COMPLETED)
          )
        );
        
      const inProgressTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.status, TaskStatus.IN_PROGRESS)
          )
        );
        
      const pendingTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.status, TaskStatus.PENDING)
          )
        );
      
      return {
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length
      };
    } catch (error) {
      console.error("Error fetching task completion stats:", error);
      return { completed: 0, inProgress: 0, pending: 0 };
    }
  }

  async getTasksByCategory(userId: number): Promise<{ category: string, count: number }[]> {
    try {
      const result = await db.execute(sql`
        SELECT category, COUNT(*) as count
        FROM tasks
        WHERE user_id = ${userId}
        GROUP BY category
      `);
      
      return result.rows.map(row => ({
        category: row.category || 'Uncategorized',
        count: parseInt(row.count, 10)
      }));
    } catch (error) {
      console.error("Error fetching tasks by category:", error);
      return [];
    }
  }

  async getWeeklyActivity(userId: number): Promise<{ day: string, count: number }[]> {
    try {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result = await db.execute(sql`
        SELECT EXTRACT(DOW FROM created_at) as day_of_week, COUNT(*) as count
        FROM tasks
        WHERE user_id = ${userId}
        GROUP BY day_of_week
        ORDER BY day_of_week
      `);
      
      // Initialize all days with zero
      const daysCounts = new Map<string, number>();
      days.forEach(day => daysCounts.set(day, 0));
      
      // Update counts from DB result
      result.rows.forEach(row => {
        const dayIndex = parseInt(row.day_of_week, 10);
        const dayName = days[dayIndex];
        daysCounts.set(dayName, parseInt(row.count, 10));
      });
      
      return days.map(day => ({
        day,
        count: daysCounts.get(day) || 0
      }));
    } catch (error) {
      console.error("Error fetching weekly activity:", error);
      return days.map(day => ({ day, count: 0 }));
    }
  }
}

export const storage = new DatabaseStorage();
