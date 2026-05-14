import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import candidatosRoutes from "./routes/candidatos.js";
import vacantesRoutes from "./routes/vacantes.js";
import { assertDatabaseConnection } from "./db.js";
import { requestContext } from "./middlewares/requestContext.js";
import { logger } from "./utils/logger.js";
import { getMetricsSnapshot } from "./utils/metrics.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use(requestContext);

app.use("/uploads", express.static("uploads"));

async function buildReadinessPayload(requestId) {
  await assertDatabaseConnection();
  return {
    status: "ok",
    service: "backend",
    check: "ready",
    db: "up",
    requestId,
    uptimeSec: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

app.get("/health/live", (req, res) => {
  return res.json({
    status: "ok",
    service: "backend",
    check: "live",
    requestId: req.requestId,
    uptimeSec: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", async (req, res, next) => {
  try {
    return res.json(await buildReadinessPayload(req.requestId));
  } catch (error) {
    error.status = 503;
    return next(error);
  }
});

app.get("/health", async (req, res, next) => {
  try {
    return res.json(await buildReadinessPayload(req.requestId));
  } catch (error) {
    error.status = 503;
    return next(error);
  }
});

app.get("/internal/metrics", (req, res) => {
  return res.json({
    service: "backend",
    requestId: req.requestId,
    ...getMetricsSnapshot(),
  });
});

// RUTAS
app.use("/api/auth", authRoutes);
app.use("/api/candidatos", candidatosRoutes);
app.use("/api/vacantes", vacantesRoutes);

app.use((err, req, res, NEXT) => {
  void NEXT;
  logger.error("Unhandled backend error", {
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    status: err.status || 500,
    detail: err.message,
  });
  const status = err.status || 500;
  const message = status >= 500 ? "Error interno del servidor" : err.message;
  res.status(status).json({ error: message });
});

async function startServer() {
  try {
    await assertDatabaseConnection();
    logger.info("Conexion a MySQL verificada");
    app.listen(port, () => {
      logger.info("API corriendo", { port });
    });
  } catch (error) {
    logger.error("No se pudo conectar a MySQL", { detail: error.message });
    process.exit(1);
  }
}

startServer();


