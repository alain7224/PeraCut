/**
 * Procedimientos tRPC para autenticación
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { validateMasterKey, registerUser, getUserByEmail, getUserByUsername } from '../auth';

export const authRouter = router({
  /**
   * Validar llave maestra
   */
  validateMasterKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const isValid = validateMasterKey(input.key);
      if (isValid) {
        return { success: true, message: 'Llave maestra válida' };
      }
      return { success: false, message: 'Llave maestra inválida' };
    }),

  /**
   * Registrar nuevo usuario
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email('Email inválido'),
        name: z.string().min(2, 'Nombre muy corto'),
        lastName: z.string().min(2, 'Apellido muy corto'),
        username: z.string().min(5, 'Username debe tener al menos 5 caracteres'),
        country: z.string().optional(),
        ageRange: z.enum(['18-24', '25-34', '35-49', '50+']),
        consentAge: z.boolean().refine((v) => v === true, 'Debes confirmar que tienes 18 años o más'),
        consentMarketing: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const userId = await registerUser(input);

        return {
          success: true,
          userId,
          message: 'Usuario registrado exitosamente',
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al registrar usuario';
        return {
          success: false,
          message,
        };
      }
    }),

  /**
   * Verificar disponibilidad de email
   */
  checkEmailAvailable: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const user = await getUserByEmail(input.email);
      return { available: !user };
    }),

  /**
   * Verificar disponibilidad de username
   */
  checkUsernameAvailable: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const user = await getUserByUsername(input.username);
      return { available: !user };
    }),
});
