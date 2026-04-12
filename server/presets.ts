import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getUserPresets, getPresetById, createPreset, updatePreset, deletePreset } from "./db";

export const presetsRouter = router({
  /**
   * Get all presets for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const presets = await getUserPresets(ctx.user.id);
    return presets.map((preset) => ({
      ...preset,
      settings: preset.settings ? JSON.parse(preset.settings) : {},
    }));
  }),

  /**
   * Get a specific preset by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const preset = await getPresetById(input.id);
      if (!preset || preset.userId !== ctx.user.id) {
        throw new Error("Preset not found");
      }
      return {
        ...preset,
        settings: preset.settings ? JSON.parse(preset.settings) : {},
      };
    }),

  /**
   * Create a new preset from current editor settings
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        settings: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createPreset(
        ctx.user.id,
        input.name,
        input.settings,
        input.category,
        input.description
      );
      return result;
    }),

  /**
   * Update an existing preset
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        settings: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const preset = await getPresetById(input.id);
      if (!preset || preset.userId !== ctx.user.id) {
        throw new Error("Preset not found");
      }

      const updates: any = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.settings !== undefined) updates.settings = JSON.stringify(input.settings);

      return updatePreset(input.id, updates);
    }),

  /**
   * Delete a preset
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const preset = await getPresetById(input.id);
      if (!preset || preset.userId !== ctx.user.id) {
        throw new Error("Preset not found");
      }
      return deletePreset(input.id);
    }),

  /**
   * Apply a preset (returns the settings)
   */
  applyPreset: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const preset = await getPresetById(input.id);
      if (!preset || preset.userId !== ctx.user.id) {
        throw new Error("Preset not found");
      }
      return {
        ...preset,
        settings: preset.settings ? JSON.parse(preset.settings) : {},
      };
    }),
});
