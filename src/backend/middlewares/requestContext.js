import { randomUUID } from "crypto";
import { logger } from "../utils/logger.js";
import { trackRequest } from "../utils/metrics.js";

const SLOW_REQUEST_THRESHOLD_MS = Number(process.env.SLOW_REQUEST_THRESHOLD_MS || 1000);

export function requestContext(req, res, next) {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const start = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const roundedDuration = Number(durationMs.toFixed(2));
    const meta = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: roundedDuration,
    };

    trackRequest(res.statusCode);

    if (res.statusCode >= 500) {
      logger.error("HTTP request failed", meta);
      return;
    }

    if (roundedDuration > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn("HTTP slow request", meta);
      return;
    }

    logger.info("HTTP request completed", meta);
  });

  next();
}
