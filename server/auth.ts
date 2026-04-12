/**
 * Sistema de autenticación con llave maestra para el creador
 * y registro normal para usuarios
 */

import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '../drizzle/schema';

export interface UserData {
  email: string;
  name: string;
  lastName: string;
  username: string;
  country?: string;
  ageRange: string;
  consentAge: boolean;
  consentMarketing: boolean;
}

// File-based fallback path for leads when DB is not available
const LEADS_FILE = path.resolve(process.cwd(), 'data', 'leads.json');

function ensureLeadsFile() {
  const dir = path.dirname(LEADS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readLeads(): UserData[] {
  try {
    ensureLeadsFile();
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(raw) as UserData[];
  } catch {
    return [];
  }
}

function appendLeadToFile(lead: UserData & { createdAt: string }) {
  const leads = readLeads() as Array<UserData & { createdAt: string }>;
  leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

export function getAllLeadsFromFile(): Array<UserData & { createdAt: string }> {
  return readLeads() as Array<UserData & { createdAt: string }>;
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
export async function registerUser(data: UserData): Promise<number | null> {
  // Validate username minimum length
  if (data.username.length < 5) {
    throw new Error('El nombre de usuario debe tener al menos 5 caracteres');
  }

  // Validate consentAge is true
  if (!data.consentAge) {
    throw new Error('Debes confirmar que tienes 18 años o más');
  }

  const db = await getDb();

  if (!db) {
    // File-based fallback: check for duplicates
    const existing = readLeads() as Array<UserData & { createdAt: string }>;
    if (existing.some((u) => u.email === data.email)) {
      throw new Error('El email ya está registrado');
    }
    if (existing.some((u) => u.username === data.username)) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    appendLeadToFile({ ...data, createdAt: new Date().toISOString() });
    console.info('[Auth] Lead saved to file (DB not configured):', data.email);
    return null;
  }

  // Validate that the email doesn't exist
  const existingByEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existingByEmail.length > 0) {
    throw new Error('El email ya está registrado');
  }

  // Validate that the username doesn't exist
  const existingByUsername = await db.select().from(users).where(eq(users.username, data.username)).limit(1);
  if (existingByUsername.length > 0) {
    throw new Error('El nombre de usuario ya está en uso');
  }

  // Create user
  await db.insert(users).values({
    email: data.email,
    name: data.name,
    lastName: data.lastName,
    country: data.country,
    ageRange: data.ageRange,
    consentAge: data.consentAge ? 1 : 0,
    consentMarketing: data.consentMarketing ? 1 : 0,
    username: data.username,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

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

