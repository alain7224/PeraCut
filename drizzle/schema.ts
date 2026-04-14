import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  lastName: text("lastName"),
  email: varchar("email", { length: 320 }).unique(),
  username: varchar("username", { length: 64 }).unique(),
  age: int("age"),
  ageRange: varchar("ageRange", { length: 20 }),
  country: varchar("country", { length: 100 }),
  consentAge: tinyint("consentAge").default(0),
  consentMarketing: tinyint("consentMarketing").default(0),
  loginMethod: varchar("loginMethod", { length: 64 }),
  isMasterUser: tinyint("isMasterUser").default(0),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table to store photo and video projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["photo", "video"]).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"), // S3 URL to thumbnail
  data: text("data"), // JSON stringified project data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Scenes table for video projects (5-8 scenes per video)
 */
export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  order: int("order").notNull(),
  duration: int("duration").notNull(), // in milliseconds
  mediaUrl: text("mediaUrl"), // S3 URL to image/video
  mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(),
  data: text("data"), // JSON stringified scene data (effects, text, etc)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

/**
 * Presets table for saving filter and effect combinations
 */
export const presets = mysqlTable("presets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).default("custom"),
  settings: text("settings").notNull(),
  isDefault: int("isDefault").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Preset = typeof presets.$inferSelect;
export type InsertPreset = typeof presets.$inferInsert;