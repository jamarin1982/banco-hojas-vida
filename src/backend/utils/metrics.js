const metrics = {
  startedAt: new Date().toISOString(),
  requestsTotal: 0,
  byStatusClass: {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0,
    other: 0,
  },
};

function statusClass(status) {
  if (status >= 200 && status < 300) return "2xx";
  if (status >= 300 && status < 400) return "3xx";
  if (status >= 400 && status < 500) return "4xx";
  if (status >= 500 && status < 600) return "5xx";
  return "other";
}

export function trackRequest(statusCode) {
  metrics.requestsTotal += 1;
  const key = statusClass(statusCode);
  metrics.byStatusClass[key] += 1;
}

export function getMetricsSnapshot() {
  return {
    startedAt: metrics.startedAt,
    requestsTotal: metrics.requestsTotal,
    byStatusClass: { ...metrics.byStatusClass },
    uptimeSec: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}
