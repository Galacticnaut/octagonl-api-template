import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getEnv } from "./config.js";
import { requireAuth } from "./middleware/auth.js";
import { requestLogger } from "./middleware/request-logger.js";
import healthRoutes from "./routes/health.js";
import exampleRoutes from "./routes/example.js";

export function createApp() {
  const env = getEnv();
  const app = express();

  // ── Global middleware ───────────────────────────────────────
  app.use(helmet());
  app.use(express.json({ limit: "5mb" }));

  // CORS – strict per-origin
  const allowedOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    }),
  );

  // Structured request logging
  app.use(requestLogger);

  // ── Health check (unauthenticated) ──────────────────────────
  app.use("/healthz", healthRoutes);

  // ── Authenticated API routes ────────────────────────────────
  const auth = requireAuth();

  // TODO: Replace with your actual routes
  app.use("/v1/example", auth, exampleRoutes);

  // ── 404 handler ─────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // ── Error handler ───────────────────────────────────────────
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (err.message.startsWith("CORS:")) {
        res.status(403).json({ error: err.message });
        return;
      }
      if (err instanceof SyntaxError && "body" in err) {
        res.status(400).json({ error: "Invalid JSON" });
        return;
      }
      console.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
