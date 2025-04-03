import { pgTable, text, serial, integer, boolean, timestamp, customType } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  birthday: text("birthday"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  taskCategories: many(taskCategories)
}));

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    name: true,
    email: true,
    avatar: true,
    birthday: true,
  });

// Task status enum
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
} as const;

// Task priority enum
export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default(TaskStatus.PENDING),
  priority: text("priority").notNull().default(TaskPriority.MEDIUM),
  userId: integer("user_id").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id]
  })
}));

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    dueDate: z.date().optional().or(z.string().optional()),
    status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]),
    priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  });

// Task category schema for analytics
export const taskCategories = pgTable("task_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  userId: integer("user_id").notNull(),
  color: text("color").notNull(),
});

export const taskCategoriesRelations = relations(taskCategories, ({ one }) => ({
  user: one(users, {
    fields: [taskCategories.userId],
    references: [users.id]
  })
}));

export const insertTaskCategorySchema = createInsertSchema(taskCategories)
  .omit({ id: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskCategory = typeof taskCategories.$inferSelect;
export type InsertTaskCategory = z.infer<typeof insertTaskCategorySchema>;
