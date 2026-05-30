import { z } from "zod";

function coerceNumber(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const parsed = Number(value.trim());

  return Number.isFinite(parsed) ? parsed : value;
}

function extractJsonObject(rawContent: string) {
  const withoutFence = rawContent
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return withoutFence.slice(firstBrace, lastBrace + 1);
  }

  return withoutFence;
}

const numberSchema = z.preprocess(coerceNumber, z.number());
const bandScoreSchema = z.preprocess(
  coerceNumber,
  z
    .number()
    .min(0)
    .max(9)
    .refine((value) => Number.isInteger(value * 2), {
      message: "Score must use 0.5 increments",
    }),
);
const nonEmptyStringSchema = z.string().trim().min(1);

const criterionSchema = z
  .object({
    score: bandScoreSchema,
    comment: nonEmptyStringSchema,
  })
  .strict();

export const writingReportSchema = z
  .object({
    coach_summary: nonEmptyStringSchema,
    diagnostic_band: bandScoreSchema,
    target_band: numberSchema.refine((value) => [6, 6.5, 7, 7.5].includes(value), {
      message: "target_band must be one of 6.0, 6.5, 7.0, 7.5",
    }),
    word_count: z.preprocess(coerceNumber, z.number().int().min(0)),
    biggest_gap: nonEmptyStringSchema,
    priority_fix: nonEmptyStringSchema,
    next_practice_suggestion: nonEmptyStringSchema,
    criteria: z
      .object({
        task_response: criterionSchema,
        coherence_cohesion: criterionSchema,
        lexical_resource: criterionSchema,
        grammar_range_accuracy: criterionSchema,
      })
      .strict(),
    weakness_tags: z
      .array(
        z
          .object({
            category: nonEmptyStringSchema,
            tag: nonEmptyStringSchema,
            severity: z.enum(["low", "medium", "high"]),
            explanation: nonEmptyStringSchema,
            evidence: nonEmptyStringSchema,
          })
          .strict(),
      )
      .min(1),
    improvement_preview: z
      .object({
        original_essay: nonEmptyStringSchema,
        red_sentences: z.array(
          z
            .object({
              original: nonEmptyStringSchema,
              ai_answer: nonEmptyStringSchema,
              issue_type: nonEmptyStringSchema,
              category: nonEmptyStringSchema,
              explanation: nonEmptyStringSchema,
            })
            .strict(),
        ),
        yellow_sentences: z.array(
          z
            .object({
              original: nonEmptyStringSchema,
              ai_improvement: nonEmptyStringSchema,
              issue_type: nonEmptyStringSchema,
              category: nonEmptyStringSchema,
              why_it_works: nonEmptyStringSchema,
              practice_tip: nonEmptyStringSchema,
            })
            .strict(),
        ),
        criteria_advice: z
          .array(
            z
              .object({
                category: nonEmptyStringSchema,
                evaluation: nonEmptyStringSchema,
                evidence: nonEmptyStringSchema,
                next_step: nonEmptyStringSchema,
              })
              .strict(),
          )
          .min(4),
      })
      .strict(),
    reflection_questions: z.array(nonEmptyStringSchema).min(2).max(3),
    training_plan: z
      .array(
        z
          .object({
            title: nonEmptyStringSchema,
            description: nonEmptyStringSchema,
            estimated_minutes: z.preprocess(coerceNumber, z.number().int().min(1)),
            focus_area: nonEmptyStringSchema,
          })
          .strict(),
      )
      .length(3),
    coach_memory: z
      .object({
        weakness_pattern: nonEmptyStringSchema,
        suggested_strategy: nonEmptyStringSchema,
      })
      .strict(),
    disclaimer: nonEmptyStringSchema,
  })
  .strict();

export type WritingReportJson = z.infer<typeof writingReportSchema>;

export function parseWritingReportJson(rawContent: string) {
  const parsed = JSON.parse(extractJsonObject(rawContent));
  return writingReportSchema.parse(parsed);
}
