import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getAllLeadsFromFile, validateMasterKey } from "../auth";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Admin leads export — protected by master key via Authorization header or query param
  app.get("/api/admin/leads.csv", async (req, res) => {
    const key =
      (req.headers["x-admin-key"] as string | undefined) ||
      (req.query.key as string | undefined) ||
      "";

    if (!validateMasterKey(key)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      let rows: Array<Record<string, unknown>> = [];

      const db = await getDb();
      if (db) {
        rows = (await db.select().from(users)) as Array<Record<string, unknown>>;
      } else {
        rows = getAllLeadsFromFile() as unknown as Array<Record<string, unknown>>;
      }

      if (rows.length === 0) {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
        res.send("email,username,name,lastName,country,ageRange,consentAge,consentMarketing,createdAt\n");
        return;
      }

      const cols = ["email", "username", "name", "lastName", "country", "ageRange", "consentAge", "consentMarketing", "createdAt"];
      const escape = (v: unknown) => {
        const s = v === undefined || v === null ? "" : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };

      const lines = [
        cols.join(","),
        ...rows.map((r) => cols.map((c) => escape(r[c])).join(",")),
      ];

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
      res.send(lines.join("\r\n"));
    } catch (err) {
      console.error("[Admin] Error exporting leads:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
