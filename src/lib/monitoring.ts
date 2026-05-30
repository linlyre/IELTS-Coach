import "server-only";

type ReportEventName =
  | "report_generation_completed"
  | "report_generation_failed"
  | "report_generation_rate_limited";

type ReportEventPayload = {
  durationMs?: number;
  reason?: "mimo" | "parse" | "queue" | "rate_limit" | "storage";
  reportId?: string;
  route: "api" | "regenerate" | "server_action";
};

function shouldEmitStructuredLogs() {
  return process.env.STRUCTURED_REPORT_LOGS === "true";
}

export function recordReportEvent(name: ReportEventName, payload: ReportEventPayload) {
  if (!shouldEmitStructuredLogs()) {
    return;
  }

  console.info(
    JSON.stringify({
      event: name,
      ...payload,
      timestamp: new Date().toISOString(),
    }),
  );
}
