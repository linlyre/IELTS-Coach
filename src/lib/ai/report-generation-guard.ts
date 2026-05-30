import "server-only";

export class ReportRateLimitError extends Error {
  constructor(message = "Report generation rate limit exceeded") {
    super(message);
    this.name = "ReportRateLimitError";
  }
}

export class ReportQueueError extends Error {
  constructor(message = "Report generation queue is full") {
    super(message);
    this.name = "ReportQueueError";
  }
}

type QueueEntry = {
  resolve: () => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

const DEFAULT_MAX_CONCURRENCY = 2;
const DEFAULT_QUEUE_LIMIT = 20;
const DEFAULT_QUEUE_TIMEOUT_MS = 15_000;
const DEFAULT_USER_WINDOW_MS = 10 * 60_000;
const DEFAULT_USER_MAX_REQUESTS = 3;

const userWindows = new Map<string, number[]>();
const queue: QueueEntry[] = [];
let activeJobs = 0;

function getPositiveInteger(name: string, fallback: number) {
  const value = Number(process.env[name]);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function maxConcurrency() {
  return getPositiveInteger("REPORT_GENERATION_MAX_CONCURRENCY", DEFAULT_MAX_CONCURRENCY);
}

function queueLimit() {
  return getPositiveInteger("REPORT_GENERATION_QUEUE_LIMIT", DEFAULT_QUEUE_LIMIT);
}

function queueTimeoutMs() {
  return getPositiveInteger(
    "REPORT_GENERATION_QUEUE_TIMEOUT_MS",
    DEFAULT_QUEUE_TIMEOUT_MS,
  );
}

function userWindowMs() {
  return getPositiveInteger("REPORT_GENERATION_USER_WINDOW_MS", DEFAULT_USER_WINDOW_MS);
}

function userMaxRequests() {
  return getPositiveInteger(
    "REPORT_GENERATION_USER_MAX_REQUESTS",
    DEFAULT_USER_MAX_REQUESTS,
  );
}

function enforceUserRateLimit(userId: string) {
  const now = Date.now();
  const windowStart = now - userWindowMs();
  const recentRequests = (userWindows.get(userId) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recentRequests.length >= userMaxRequests()) {
    throw new ReportRateLimitError();
  }

  recentRequests.push(now);
  userWindows.set(userId, recentRequests);
}

function releaseQueueSlot() {
  activeJobs -= 1;
  const next = queue.shift();

  if (!next) {
    return;
  }

  activeJobs += 1;
  clearTimeout(next.timer);
  next.resolve();
}

async function acquireQueueSlot() {
  if (activeJobs < maxConcurrency()) {
    activeJobs += 1;
    return;
  }

  if (queue.length >= queueLimit()) {
    throw new ReportQueueError();
  }

  await new Promise<void>((resolve, reject) => {
    const entry: QueueEntry = {
      reject,
      resolve,
      timer: setTimeout(() => {
        const index = queue.indexOf(entry);

        if (index >= 0) {
          queue.splice(index, 1);
        }

        reject(new ReportQueueError("Report generation queue timed out"));
      }, queueTimeoutMs()),
    };

    queue.push(entry);
  });
}

export async function runReportGenerationWithGuard<T>({
  generate,
  userId,
}: {
  generate: () => Promise<T>;
  userId: string;
}) {
  enforceUserRateLimit(userId);
  await acquireQueueSlot();

  try {
    return await generate();
  } finally {
    releaseQueueSlot();
  }
}
