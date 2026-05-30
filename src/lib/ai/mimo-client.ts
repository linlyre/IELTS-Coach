import "server-only";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_MIMO_TIMEOUT_MS = 120_000;
const DEFAULT_MIMO_MAX_RETRIES = 2;
const DEFAULT_MIMO_RETRY_BASE_DELAY_MS = 800;

function getMimoEndpoint() {
  const baseUrl = process.env.MIMO_API_BASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("MIMO_API_BASE_URL is not configured");
  }

  if (baseUrl.endsWith("/chat/completions")) {
    return baseUrl;
  }

  return `${baseUrl}/chat/completions`;
}

function getMimoTimeoutMs() {
  const value = Number(process.env.MIMO_TIMEOUT_MS);

  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MIMO_TIMEOUT_MS;
}

function getMimoMaxRetries() {
  const value = Number(process.env.MIMO_MAX_RETRIES);

  return Number.isInteger(value) && value >= 0 ? value : DEFAULT_MIMO_MAX_RETRIES;
}

function getMimoRetryBaseDelayMs() {
  const value = Number(process.env.MIMO_RETRY_BASE_DELAY_MS);

  return Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_MIMO_RETRY_BASE_DELAY_MS;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function getRetryDelayMs(response: Response, attempt: number) {
  const retryAfter = response.headers.get("retry-after");

  if (retryAfter) {
    const retryAfterSeconds = Number(retryAfter);

    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
      return retryAfterSeconds * 1000;
    }
  }

  return getMimoRetryBaseDelayMs() * 2 ** attempt;
}

async function fetchMimoCompletion({
  apiKey,
  messages,
  model,
}: {
  apiKey: string;
  messages: ChatMessage[];
  model: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getMimoTimeoutMs());

  try {
    return await fetch(getMimoEndpoint(), {
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("MiMo API request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function createMimoChatCompletion(messages: ChatMessage[]) {
  const apiKey = process.env.MIMO_API_KEY;
  const model = process.env.MIMO_MODEL_NAME;

  if (!apiKey) {
    throw new Error("MIMO_API_KEY is not configured");
  }

  if (!model) {
    throw new Error("MIMO_MODEL_NAME is not configured");
  }

  const maxRetries = getMimoMaxRetries();

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    let response: Response;

    try {
      response = await fetchMimoCompletion({
        apiKey,
        messages,
        model,
      });
    } catch (error) {
      if (attempt < maxRetries) {
        await sleep(getMimoRetryBaseDelayMs() * 2 ** attempt);
        continue;
      }

      throw error;
    }

    const payload = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

    if (!response.ok) {
      if (attempt < maxRetries && isRetriableStatus(response.status)) {
        await sleep(getRetryDelayMs(response, attempt));
        continue;
      }

      throw new Error(payload.error?.message ?? "MiMo API request failed");
    }

    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("MiMo API returned an empty message");
    }

    return content;
  }

  throw new Error("MiMo API request failed");
}
