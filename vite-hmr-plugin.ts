import type { Plugin, ViteDevServer } from "vite";

/**
 * Vite HMR Plugin - Detecta dinámicamente el host desde el navegador
 * Esto resuelve el problema de WebSocket fallando cuando el dominio es dinámico
 */
export function viteHmrPlugin(): Plugin {
  let server: ViteDevServer;

  return {
    name: "vite-hmr-dynamic",
    configResolved(config) {
      // No hacer nada en build
    },
    configureServer(viteServer: ViteDevServer) {
      server = viteServer;

      // Middleware para servir configuración HMR dinámicamente
      server.middlewares.use("/__vite-hmr-config", (req, res) => {
        const host = req.headers.host || "localhost:5173";
        const protocol = req.headers["x-forwarded-proto"] === "https" ? "wss" : "ws";

        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            protocol,
            host,
            port: 443,
            timeout: 30000,
          })
        );
      });

      return () => {
        // Hook post - no hacer nada
      };
    },
  };
}
