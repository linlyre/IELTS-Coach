import "server-only";

import type { UserProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type EssayStatus = "pending_reflection" | "in_progress" | "completed";
type ReportStatus = "pending" | "completed" | "failed";
type DrillStatus = "pending" | "completed";

type EssayRow = {
  id: string;
  prompt: string;
  topic_type: string | null;
  task_type: string;
  word_count: number;
  status: EssayStatus;
  created_at: string;
};

type ReportRow = {
  id: string;
  essay_id: string;
  status: ReportStatus;
  diagnostic_band: number | null;
  biggest_gap: string | null;
  criteria: CriteriaJson | null;
  created_at: string;
};

type ReflectionRow = {
  report_id: string;
  completed: boolean;
};

type DrillRow = {
  report_id: string;
  status: DrillStatus;
};

type WeaknessTagRow = {
  category: string;
  tag: string;
  severity: "low" | "medium" | "high";
};

type CriterionJson = {
  score: number;
  comment?: string;
};

type CriteriaJson = {
  task_response?: CriterionJson;
  coherence_cohesion?: CriterionJson;
  lexical_resource?: CriterionJson;
  grammar_range_accuracy?: CriterionJson;
};

const criteriaMeta = [
  {
    key: "task_response",
    name: "任务回应",
    english: "Task Response",
  },
  {
    key: "coherence_cohesion",
    name: "连贯与衔接",
    english: "Coherence & Cohesion",
  },
  {
    key: "lexical_resource",
    name: "词汇资源",
    english: "Lexical Resource",
  },
  {
    key: "grammar_range_accuracy",
    name: "语法丰富度与准确性",
    english: "Grammar Range & Accuracy",
  },
] as const;

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatTrendDate(value: string) {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate().toString().padStart(2, "0")}`;
}

function getDaysUntil(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  const today = new Date();
  const target = new Date(`${dateValue}T00:00:00`);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diff = target.getTime() - todayStart.getTime();

  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function getReportByEssay(reports: ReportRow[]) {
  const map = new Map<string, ReportRow>();

  for (const report of reports) {
    map.set(report.essay_id, report);
  }

  return map;
}

function groupByReportId<T extends { report_id: string }>(rows: T[]) {
  const map = new Map<string, T[]>();

  for (const row of rows) {
    map.set(row.report_id, [...(map.get(row.report_id) ?? []), row]);
  }

  return map;
}

function mapTaskType(taskType: string) {
  return taskType === "task_2" ? "Task 2" : taskType;
}

function getEssayDisplayTitle(essay: EssayRow) {
  return essay.topic_type?.trim() || (essay.task_type === "task_2" ? "Task 2 写作练习" : "写作练习");
}

function getReflectionStatus({
  drills,
  reflection,
}: {
  drills: DrillRow[];
  reflection?: ReflectionRow;
}) {
  if (!reflection?.completed) {
    return "待反思";
  }

  if (drills.length > 0 && drills.every((drill) => drill.status === "completed")) {
    return "已完成";
  }

  return "进行中";
}

function getStatusFromReflection(reflectionStatus: string): EssayStatus {
  if (reflectionStatus === "已完成") {
    return "completed";
  }

  if (reflectionStatus === "进行中") {
    return "in_progress";
  }

  return "pending_reflection";
}

function getCriteriaScore(criteria: CriteriaJson | null, key: keyof CriteriaJson) {
  return criteria?.[key]?.score ?? null;
}

function getCriteriaAverage(reports: ReportRow[], targetBand: number) {
  return criteriaMeta.map((item) => {
    const scores = reports
      .map((report) => getCriteriaScore(report.criteria, item.key))
      .filter((score): score is number => typeof score === "number");
    const average =
      scores.length > 0
        ? Number(
            (
              scores.reduce((total, score) => total + score, 0) / scores.length
            ).toFixed(1),
          )
        : 0;

    return {
      name: item.name,
      score: average,
      target: targetBand,
    };
  });
}

function getWeaknessInsight({
  criteriaAverage,
  weaknessTags,
}: {
  criteriaAverage: { name: string; score: number }[];
  weaknessTags: WeaknessTagRow[];
}) {
  const weakestCriterion = criteriaAverage
    .filter((item) => item.score > 0)
    .sort((a, b) => a.score - b.score)[0];
  const tagCounts = new Map<string, number>();

  for (const tag of weaknessTags) {
    tagCounts.set(tag.tag, (tagCounts.get(tag.tag) ?? 0) + 1);
  }

  const topTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  if (!weakestCriterion && !topTag) {
    return {
      currentBiggestGap: "暂无数据",
      insight: "提交并完成第一篇 Task 2 作文后，这里会显示你的主要短板。",
    };
  }

  return {
    currentBiggestGap: topTag ?? weakestCriterion?.name ?? "暂无数据",
    insight: topTag
      ? `${topTag} 是近期出现频率最高的弱项，建议先用句子级练习稳定修正。`
      : `${weakestCriterion?.name} 是当前均分最低的维度，下一篇作文优先围绕这一项复训。`,
  };
}

function getWeeklySuggestions({
  currentBiggestGap,
  daysUntilExam,
}: {
  currentBiggestGap: string;
  daysUntilExam: number | null;
}) {
  const cadence =
    daysUntilExam !== null && daysUntilExam <= 30
      ? "完成 2 篇限时 Task 2"
      : "完成 1 篇完整 Task 2";

  return [
    {
      title: cadence,
      description: "保持 40 分钟写作节奏，提交后完成反思。",
    },
    {
      title: `专项修正：${currentBiggestGap}`,
      description: "从最近报告中挑 3 个问题句，重写并对照 AI 改进版本。",
    },
    {
      title: "完成本周 Drill",
      description: "优先把未完成的训练任务标记完成，让训练闭环进入成长看板。",
    },
  ];
}

async function fetchLearningRows(userId: string) {
  const supabase = await createClient();
  const [{ data: essays }, { data: reports }, { data: reflections }, { data: drills }] =
    await Promise.all([
      supabase
        .from("essays")
        .select("id,prompt,topic_type,task_type,word_count,status,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("writing_reports")
        .select("id,essay_id,status,diagnostic_band,biggest_gap,criteria,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("reflection_notes")
        .select("report_id,completed")
        .eq("user_id", userId),
      supabase.from("drill_tasks").select("report_id,status").eq("user_id", userId),
    ]);

  return {
    drills: (drills ?? []) as DrillRow[],
    essays: (essays ?? []) as unknown as EssayRow[],
    reflections: (reflections ?? []) as ReflectionRow[],
    reports: (reports ?? []) as unknown as ReportRow[],
  };
}

export async function getEssayLibraryData({
  search,
  status,
  userId,
}: {
  search?: string;
  status?: string;
  userId: string;
}) {
  const { drills, essays, reflections, reports } = await fetchLearningRows(userId);
  const reportByEssay = getReportByEssay(reports);
  const drillsByReport = groupByReportId(drills);
  const reflectionByReport = new Map(
    reflections.map((reflection) => [reflection.report_id, reflection]),
  );

  const allRecords = essays.map((essay) => {
    const report = reportByEssay.get(essay.id);
    const reportDrills = report ? (drillsByReport.get(report.id) ?? []) : [];
    const reflection = report ? reflectionByReport.get(report.id) : undefined;
    const reflectionStatus = getReflectionStatus({
      drills: reportDrills,
      reflection,
    });
    const derivedStatus = report ? getStatusFromReflection(reflectionStatus) : essay.status;
    const completedDrills = reportDrills.filter(
      (drill) => drill.status === "completed",
    ).length;

    return {
      biggestGap:
        report?.status === "failed"
          ? "报告生成失败"
          : (report?.biggest_gap ?? "待生成"),
      createdAt: formatCreatedAt(essay.created_at),
      diagnosticBand:
        report?.status === "failed" ? "失败" : (report?.diagnostic_band ?? "-"),
      drillCompleted: completedDrills,
      drillTotal: reportDrills.length,
      id: essay.id,
      prompt: essay.prompt,
      reflectionStatus,
      reportId: report?.id ?? null,
      status: derivedStatus,
      title: getEssayDisplayTitle(essay),
      taskType: mapTaskType(essay.task_type),
      wordCount: essay.word_count,
    };
  });

  const progress = {
    completed: allRecords.filter((essay) => essay.status === "completed").length,
    inProgress: allRecords.filter((essay) => essay.status === "in_progress").length,
    pendingReflection: allRecords.filter(
      (essay) => essay.status === "pending_reflection",
    ).length,
    total: allRecords.length,
  };
  const normalizedSearch = search?.trim().toLowerCase();
  const normalizedStatus =
    status === "pending_reflection" || status === "in_progress" || status === "completed"
      ? status
      : "all";
  const filteredRecords = allRecords.filter((essay) => {
    const matchesStatus =
      normalizedStatus === "all" || essay.status === normalizedStatus;
    const matchesSearch =
      !normalizedSearch ||
      essay.prompt.toLowerCase().includes(normalizedSearch) ||
      essay.title.toLowerCase().includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });
  const completedReports = reports
    .filter(
      (report) =>
        report.status === "completed" && typeof report.diagnostic_band === "number",
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const improvementDelta =
    completedReports.length >= 2
      ? Number(
          (
            (completedReports.at(-1)?.diagnostic_band ?? 0) -
            (completedReports[0]?.diagnostic_band ?? 0)
          ).toFixed(1),
        )
      : 0;

  return {
    bandTrend: completedReports.slice(-4).map((report) => ({
      band: report.diagnostic_band ?? 0,
      date: formatTrendDate(report.created_at),
    })),
    filters: {
      search: search ?? "",
      status: normalizedStatus,
    },
    focusDescription:
      allRecords.length > 0
        ? "继续围绕最近报告的最大短板完成反思和复训。"
        : "提交第一篇 Task 2 作文后，这里会形成你的专注方向。",
    focusTitle: "Task 2 - 写作训练闭环",
    improvementDelta,
    progress,
    records: filteredRecords,
  };
}

export async function getDashboardData({
  profile,
  userId,
}: {
  profile: UserProfile;
  userId: string;
}) {
  const { drills, essays, reports } = await fetchLearningRows(userId);
  const supabase = await createClient();
  const completedReports = reports
    .filter(
      (report) =>
        report.status === "completed" && typeof report.diagnostic_band === "number",
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const reportIds = completedReports.map((report) => report.id);
  const { data: weaknessTags } =
    reportIds.length > 0
      ? await supabase
          .from("weakness_tags")
          .select("category,tag,severity")
          .in("report_id", reportIds)
      : { data: [] };
  const criteriaAverage = getCriteriaAverage(
    completedReports,
    Number(profile.target_band),
  );
  const weaknessInsight = getWeaknessInsight({
    criteriaAverage,
    weaknessTags: (weaknessTags ?? []) as WeaknessTagRow[],
  });
  const latestReport = completedReports.at(-1);
  const firstReport = completedReports[0];
  const completedDrills = drills.filter((drill) => drill.status === "completed").length;
  const drillCompletionRate =
    drills.length > 0 ? Math.round((completedDrills / drills.length) * 100) : 0;
  const daysUntilExam = getDaysUntil(profile.exam_date);
  const bandTrend = completedReports.slice(-8).map((report) => ({
    band: report.diagnostic_band ?? 0,
    date: formatTrendDate(report.created_at),
  }));
  const recentReportsByEssay = getReportByEssay(reports);
  const recentEssays = essays.slice(0, 5).map((essay) => {
    const report = recentReportsByEssay.get(essay.id);

    return {
      createdAt: formatCreatedAt(essay.created_at),
      diagnosticBand:
        report?.status === "failed" ? "失败" : (report?.diagnostic_band ?? "-"),
      id: essay.id,
      prompt: essay.prompt,
      reportId: report?.id ?? null,
      title: getEssayDisplayTitle(essay),
      taskType: mapTaskType(essay.task_type),
    };
  });
  const currentBand = latestReport?.diagnostic_band ?? null;
  const bandDelta =
    latestReport && firstReport
      ? Number(
          ((latestReport.diagnostic_band ?? 0) - (firstReport.diagnostic_band ?? 0)).toFixed(
            1,
          ),
        )
      : 0;

  return {
    bandTrend,
    criteriaAverage,
    currentBiggestGap: latestReport?.biggest_gap ?? weaknessInsight.currentBiggestGap,
    currentBand,
    drillCompletionRate,
    examCountdown: {
      days: daysUntilExam,
      targetDate: profile.exam_date ?? "未设置",
    },
    metricCards: [
      {
        detail:
          completedReports.length >= 2
            ? `较第一篇 ${bandDelta >= 0 ? "+" : ""}${bandDelta}`
            : "完成报告后显示趋势",
        key: "currentBand",
        title: "当前诊断分",
        value: currentBand === null ? "-" : currentBand.toFixed(1),
      },
      {
        detail: `完成 ${completedDrills} / ${drills.length} 次训练`,
        key: "drillCompletion",
        title: "训练完成率",
        value: `${drillCompletionRate}%`,
      },
      {
        detail: `当前共有 ${essays.length} 篇 Task 2`,
        key: "totalEssays",
        title: "累计作文数",
        value: String(essays.length),
      },
      {
        detail:
          latestReport?.biggest_gap ?? weaknessInsight.insight,
        key: "biggestGap",
        title: "当前最大短板",
        value: latestReport?.biggest_gap ?? weaknessInsight.currentBiggestGap,
      },
    ],
    recentEssays,
    trendInsight:
      completedReports.length >= 2
        ? `最近 ${completedReports.length} 篇成功报告从 ${firstReport?.diagnostic_band?.toFixed(1)} 到 ${latestReport?.diagnostic_band?.toFixed(1)}，继续观察波动。`
        : "完成至少 2 篇成功报告后，这里会显示分数趋势洞察。",
    weaknessInsight: weaknessInsight.insight,
    weeklySuggestions: getWeeklySuggestions({
      currentBiggestGap: latestReport?.biggest_gap ?? weaknessInsight.currentBiggestGap,
      daysUntilExam,
    }),
  };
}
