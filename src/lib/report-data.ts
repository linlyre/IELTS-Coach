import "server-only";

import { writingReport as demoWritingReport } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

type CriterionJson = {
  score: number;
  comment: string;
};

type CriteriaJson = {
  task_response?: CriterionJson;
  coherence_cohesion?: CriterionJson;
  lexical_resource?: CriterionJson;
  grammar_range_accuracy?: CriterionJson;
};

type EssayRow = {
  id: string;
  prompt: string;
  essay_text: string;
  task_type: string;
  word_count: number;
  created_at: string;
};

type ReportRow = {
  id: string;
  essay_id: string;
  status: "pending" | "completed" | "failed";
  coach_summary: string | null;
  diagnostic_band: number | null;
  target_band: number | null;
  word_count: number | null;
  biggest_gap: string | null;
  priority_fix: string | null;
  next_practice_suggestion: string | null;
  criteria: CriteriaJson | null;
  error_message: string | null;
  created_at: string;
  essays: EssayRow | EssayRow[] | null;
};

type WeaknessTagRow = {
  tag: string;
};

type PreviewItemRow = {
  item_type: "red_sentence" | "yellow_sentence" | "criteria_advice";
  sort_order: number;
  original_text: string | null;
  ai_response: string | null;
  issue: string | null;
  category: string | null;
  explanation: string | null;
  why_it_works: string | null;
  practice_tip: string | null;
  evaluation: string | null;
  evidence: string | null;
  next_step: string | null;
};

type ReflectionRow = {
  id: string;
  completed: boolean;
  note: string | null;
  questions: string[] | null;
};

type DrillRow = {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  focus_area: string;
  status: "pending" | "completed";
};

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function splitEssayIntoParagraphs(essayText: string) {
  return essayText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getEssay(row: ReportRow) {
  const essay = Array.isArray(row.essays) ? row.essays[0] : row.essays;

  if (!essay) {
    throw new Error("Report essay is missing");
  }

  return essay;
}

function mapCriteria(criteria: CriteriaJson | null) {
  return [
    {
      key: "TR",
      name: "任务回应",
      english: "Task Response",
      score: criteria?.task_response?.score ?? 0,
      comment: criteria?.task_response?.comment ?? "",
    },
    {
      key: "CC",
      name: "连贯与衔接",
      english: "Coherence & Cohesion",
      score: criteria?.coherence_cohesion?.score ?? 0,
      comment: criteria?.coherence_cohesion?.comment ?? "",
    },
    {
      key: "LR",
      name: "词汇资源",
      english: "Lexical Resource",
      score: criteria?.lexical_resource?.score ?? 0,
      comment: criteria?.lexical_resource?.comment ?? "",
    },
    {
      key: "GRA",
      name: "语法丰富度与准确性",
      english: "Grammar Range & Accuracy",
      score: criteria?.grammar_range_accuracy?.score ?? 0,
      comment: criteria?.grammar_range_accuracy?.comment ?? "",
    },
  ];
}

function mapDrillStatus(status: DrillRow["status"]) {
  return status === "completed" ? "已完成" : "未开始";
}

export async function getWritingReportView(reportId: string) {
  if (reportId === "demo") {
    return {
      ...demoWritingReport,
      errorMessage: null,
      isDemo: true,
      reflectionCompleted: false,
      reflectionNote: "",
      reflectionNoteId: null,
      reportId: "demo",
      status: "completed" as const,
      trainingPlan: demoWritingReport.trainingPlan.map((task, index) => ({
        ...task,
        id: `demo-drill-${index}`,
      })),
    };
  }

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("writing_reports")
    .select(
      [
        "id",
        "essay_id",
        "status",
        "coach_summary",
        "diagnostic_band",
        "target_band",
        "word_count",
        "biggest_gap",
        "priority_fix",
        "next_practice_suggestion",
        "criteria",
        "error_message",
        "created_at",
        "essays(id,prompt,essay_text,task_type,word_count,created_at)",
      ].join(","),
    )
    .eq("id", reportId)
    .maybeSingle();

  if (!report) {
    return null;
  }

  const reportRow = report as unknown as ReportRow;
  const essay = getEssay(reportRow);

  const [
    { data: weaknessTags },
    { data: previewItems },
    { data: reflection },
    { data: drillTasks },
  ] = await Promise.all([
    supabase.from("weakness_tags").select("tag").eq("report_id", reportId),
    supabase
      .from("improvement_preview_items")
      .select(
        "item_type,sort_order,original_text,ai_response,issue,category,explanation,why_it_works,practice_tip,evaluation,evidence,next_step",
      )
      .eq("report_id", reportId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("reflection_notes")
      .select("id,questions,note,completed")
      .eq("report_id", reportId)
      .maybeSingle(),
    supabase
      .from("drill_tasks")
      .select("id,title,description,estimated_minutes,focus_area,status")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true }),
  ]);

  const items = (previewItems ?? []) as PreviewItemRow[];
  const reflectionRow = reflection as ReflectionRow | null;
  const redSentences = items
    .filter((item) => item.item_type === "red_sentence")
    .map((item) => ({
      aiAnswer: item.ai_response ?? "",
      category: item.category ?? "",
      explanation: item.explanation ?? "",
      issue: item.issue ?? "",
      original: item.original_text ?? "",
    }));
  const yellowSentences = items
    .filter((item) => item.item_type === "yellow_sentence")
    .map((item) => ({
      aiImprovement: item.ai_response ?? "",
      category: item.category ?? "",
      issue: item.issue ?? "",
      original: item.original_text ?? "",
      practiceTip: item.practice_tip ?? "",
      whyItWorks: item.why_it_works ?? "",
    }));

  return {
    biggestGap: reportRow.biggest_gap ?? "报告生成失败",
    coachSummary: reportRow.coach_summary ?? "",
    createdAt: formatCreatedAt(reportRow.created_at),
    criteria: mapCriteria(reportRow.criteria),
    diagnosticBand: reportRow.diagnostic_band ?? "-",
    errorMessage: reportRow.error_message,
    essayId: essay.id,
    improvementPreview: {
      criteriaAdvice: items
        .filter((item) => item.item_type === "criteria_advice")
        .map((item) => ({
          category: item.category ?? "",
          english: item.category ?? "",
          evaluation: item.evaluation ?? "",
          evidence: item.evidence ?? "",
          nextStep: item.next_step ?? "",
        })),
      redSentences,
      yellowSentences,
    },
    isDemo: false,
    nextPracticeSuggestion: reportRow.next_practice_suggestion ?? "",
    originalEssay: splitEssayIntoParagraphs(essay.essay_text),
    priorityFix: reportRow.priority_fix ?? "",
    reflectionCompleted: reflectionRow?.completed ?? false,
    reflectionNote: reflectionRow?.note ?? "",
    reflectionNoteId: reflectionRow?.id ?? null,
    reflectionQuestions: (reflectionRow?.questions ?? []) as string[],
    reportId: reportRow.id,
    sentenceCoachingLab: yellowSentences.map((item) => ({
      improved: item.aiImprovement,
      issue: item.issue,
      original: item.original,
    })),
    status: reportRow.status,
    targetBand: reportRow.target_band ?? "-",
    taskTitle: essay.prompt,
    taskType: "Task 2 学术类",
    trainingPlan: ((drillTasks ?? []) as DrillRow[]).map((task) => ({
      description: task.description,
      estimatedMinutes: task.estimated_minutes,
      focusArea: task.focus_area,
      id: task.id,
      status: mapDrillStatus(task.status),
      title: task.title,
    })),
    weaknessTags: ((weaknessTags ?? []) as WeaknessTagRow[]).map((item) => item.tag),
    wordCount: reportRow.word_count ?? essay.word_count,
  };
}
