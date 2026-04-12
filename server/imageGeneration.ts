import { z } from "zod";
import { protectedProcedure } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";

/**
 * Procedimiento para generar imágenes con IA
 */
export const imageGenerationRouter = {
  generate: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(1000),
        style: z.enum(["realistic", "artistic", "cartoon", "sketch"]).optional(),
        width: z.number().int().min(256).max(1024).optional(),
        height: z.number().int().min(256).max(1024).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateImage({
          prompt: input.prompt,
        });

        return {
          success: true,
          url: result.url,
          prompt: input.prompt,
        };
      } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image");
      }
    }),

  editImage: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        prompt: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateImage({
          prompt: input.prompt,
          originalImages: [
            {
              url: input.imageUrl,
              mimeType: "image/jpeg",
            },
          ],
        });

        return {
          success: true,
          url: result.url,
          prompt: input.prompt,
        };
      } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image");
      }
    }),

  analyzeAndModify: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        userPrompt: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Analizar la imagen con IA para entender su contenido
        const analysisResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Eres un experto en análisis visual. Analiza la imagen y crea un prompt mejorado que respete el contexto visual original pero aplique los cambios solicitados.",
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: input.imageUrl,
                    detail: "high",
                  },
                },
                {
                  type: "text",
                  text: `Analiza esta imagen y aplica: "${input.userPrompt}". Responde en JSON con: imageAnalysis (descripción), mainElements (array), style (estilo visual), colors (paleta), enhancedPrompt (prompt detallado que combina análisis + modificación).`,
                },
              ],
            },
          ],
        });

        // Parsear la respuesta
        let analysis;
        try {
          const content = analysisResponse.choices[0]?.message.content;
          if (typeof content === "string") {
            analysis = JSON.parse(content);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (e) {
          console.error("Error parsing analysis:", e);
          throw new Error("Failed to analyze image");
        }

        // Generar la imagen modificada con el prompt mejorado
        const result = await generateImage({
          prompt: analysis.enhancedPrompt,
          originalImages: [
            {
              url: input.imageUrl,
              mimeType: "image/jpeg",
            },
          ],
        });

        return {
          success: true,
          url: result.url,
          analysis: {
            imageAnalysis: analysis.imageAnalysis,
            mainElements: analysis.mainElements,
            style: analysis.style,
            colors: analysis.colors,
          },
          enhancedPrompt: analysis.enhancedPrompt,
          userPrompt: input.userPrompt,
        };
      } catch (error) {
        console.error("Error analyzing and modifying image:", error);
        throw new Error("Failed to analyze and modify image");
      }
    }),
};
