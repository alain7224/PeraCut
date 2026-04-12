/**
 * Sistema de autenticación con llave maestra para el creador
 * y registro normal para usuarios
 */

import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '../drizzle/schema';

export interface UserData {
  email: string;
  name: string;
  lastName: string;
  age?: number;
  country?: string;
  username: string;
}

/**
 * Validar llave maestra
 */
export function validateMasterKey(key: string): boolean {
  const masterKey = process.env.PERACUT_MASTER_KEY;
  if (!masterKey) {
    console.error('PERACUT_MASTER_KEY no está configurada');
    return false;
  }
  return key === masterKey;
}

/**
 * Registrar nuevo usuario
 */
export async function registerUser(data: UserData): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Validar que el email no exista
  const existingByEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existingByEmail.length > 0) {
    throw new Error('El email ya está registrado');
  }

  // Validar que el username no exista
  const existingByUsername = await db.select().from(users).where(eq(users.username, data.username)).limit(1);
  if (existingByUsername.length > 0) {
    throw new Error('El nombre de usuario ya está en uso');
  }

  // Validar que el username tenga al menos 4 caracteres
  if (data.username.length < 4) {
    throw new Error('El nombre de usuario debe tener al menos 4 caracteres');
  }

  // Crear usuario
  const result = await db.insert(users).values({
    email: data.email,
    name: data.name,
    lastName: data.lastName,
    age: data.age,
    country: data.country,
    username: data.username,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Obtener el ID del usuario insertado
  const newUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (newUser.length === 0) throw new Error('Error al crear usuario');
  
  return newUser[0].id;
}

/**
 * Obtener usuario por email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return undefined;
  }
}

/**
 * Obtener usuario por username
 */
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return undefined;
  }
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return undefined;
  }
}
