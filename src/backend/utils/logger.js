const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const levels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function canLog(level) {
  const current = levels[LOG_LEVEL] ?? levels.info;
  const incoming = levels[level] ?? levels.info;
  return incoming >= current;
}

function emit(level, message, meta) {
  if (!canLog(level)) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
  };

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  const line = JSON.stringify(payload);
  if (level === "error" || level === "warn") {
    console.error(line);
    return;
  }
  console.log(line);
}

export const logger = {
  debug: (message, meta = {}) => emit("debug", message, meta),
  info: (message, meta = {}) => emit("info", message, meta),
  warn: (message, meta = {}) => emit("warn", message, meta),
  error: (message, meta = {}) => emit("error", message, meta),
};
