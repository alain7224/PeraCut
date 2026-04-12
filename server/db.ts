import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, InsertProject, scenes, InsertScene, presets, InsertPreset } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Project queries
 */
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy((p) => p.createdAt);
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(userId: number, name: string, type: 'photo' | 'video', description?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(projects).values({
    userId,
    name,
    type,
    description,
  });
  return result;
}

export async function updateProject(projectId: number, updates: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(projects).set(updates).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(projects).where(eq(projects.id, projectId));
}

/**
 * Scene queries
 */
export async function getProjectScenes(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scenes).where(eq(scenes.projectId, projectId)).orderBy((s) => s.order);
}

export async function createScene(projectId: number, order: number, duration: number, mediaType: 'image' | 'video', mediaUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(scenes).values({
    projectId,
    order,
    duration,
    mediaType,
    mediaUrl,
  });
}

export async function updateScene(sceneId: number, updates: Partial<InsertScene>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(scenes).set(updates).where(eq(scenes.id, sceneId));
}

export async function deleteScene(sceneId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(scenes).where(eq(scenes.id, sceneId));
}

/**
 * Preset queries
 */
export async function getUserPresets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(presets).where(eq(presets.userId, userId)).orderBy((p) => p.createdAt);
}

export async function getPresetById(presetId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(presets).where(eq(presets.id, presetId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPreset(userId: number, name: string, settings: any, category?: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(presets).values({
    userId,
    name,
    settings: JSON.stringify(settings),
    category: category || 'custom',
    description,
  });
  return result;
}

export async function updatePreset(presetId: number, updates: Partial<InsertPreset>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(presets).set(updates).where(eq(presets.id, presetId));
}

export async function deletePreset(presetId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(presets).where(eq(presets.id, presetId));
}
