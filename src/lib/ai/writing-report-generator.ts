import "server-only";

import type { UserProfile } from "@/lib/auth";
import { createMimoChatCompletion } from "@/lib/ai/mimo-client";
import { buildWritingCoachPrompt } from "@/lib/ai/writing-coach-prompt";
import {
  parseWritingReportJson,
  type WritingReportJson,
} from "@/lib/ai/writing-report-schema";

export class WritingReportParseError extends Error {
  constructor(message = "Writing report JSON could not be parsed") {
    super(message);
    this.name = "WritingReportParseError";
  }
}

export async function generateWritingReport({
  userProfile,
  questionPrompt,
  essayText,
  targetBand,
  previousWeaknessSummary,
}: {
  userProfile: UserProfile;
  questionPrompt: string;
  essayText: string;
  targetBand: number;
  previousWeaknessSummary?: string;
}): Promise<WritingReportJson> {
  const { systemPrompt, userPrompt } = buildWritingCoachPrompt({
    userProfile,
    questionPrompt,
    essayText,
    targetBand,
    previousWeaknessSummary,
  });

  const rawContent = await createMimoChatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  try {
    return parseWritingReportJson(rawContent);
  } catch (error) {
    throw new WritingReportParseError(
      error instanceof Error ? error.message : undefined,
    );
  }
}
