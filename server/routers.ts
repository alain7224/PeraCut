import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectScenes,
  createScene,
  updateScene,
  deleteScene,
} from "./db";
import { imageGenerationRouter } from "./imageGeneration";
import { presetsRouter } from "./presets";
import {
  validateMasterKey,
  registerUser,
  getUserByEmail,
  getUserByUsername,
  notifyRegistration,
} from "./auth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    validateMasterKey: publicProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ input }) => {
        const isValid = validateMasterKey(input.key);
        return { success: isValid, message: isValid ? 'Llave válida' : 'Llave inválida' };
      }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email('Email inválido'),
        name: z.string().min(2, 'Nombre muy corto'),
        lastName: z.string().min(2, 'Apellido muy corto'),
        username: z.string().min(4, 'Username debe tener al menos 4 caracteres'),
        age: z.number().optional(),
        country: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const userId = await registerUser(input);
          void notifyRegistration(input);
          return { success: true, userId, message: 'Usuario registrado exitosamente' };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al registrar usuario';
          return { success: false, message };
        }
      }),
    checkEmailAvailable: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const user = await getUserByEmail(input.email);
        return { available: !user };
      }),
    checkUsernameAvailable: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        const user = await getUserByUsername(input.username);
        return { available: !user };
      }),
  }),

  projects: router({
    list: protectedProcedure.query(({ ctx }) => {
      return getUserProjects(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return getProjectById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.enum(["photo", "video"]),
          description: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return createProject(ctx.user.id, input.name, input.type, input.description);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          data: z.string().optional(),
          thumbnail: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return updateProject(input.id, {
          name: input.name,
          description: input.description,
          data: input.data,
          thumbnail: input.thumbnail,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return deleteProject(input.id);
      }),
  }),

  scenes: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => {
        return getProjectScenes(input.projectId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          order: z.number(),
          duration: z.number(),
          mediaType: z.enum(["image", "video"]),
          mediaUrl: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return createScene(
          input.projectId,
          input.order,
          input.duration,
          input.mediaType,
          input.mediaUrl
        );
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          duration: z.number().optional(),
          mediaUrl: z.string().optional(),
          data: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return updateScene(input.id, {
          duration: input.duration,
          mediaUrl: input.mediaUrl,
          data: input.data,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return deleteScene(input.id);
      }),
  }),

  imageGeneration: router(imageGenerationRouter),
  presets: presetsRouter,
});

export type AppRouter = typeof appRouter;
