import "server-only";

import type { UserProfile } from "@/lib/auth";

type BuildWritingCoachPromptInput = {
  userProfile: UserProfile;
  questionPrompt: string;
  essayText: string;
  targetBand: number;
  previousWeaknessSummary?: string;
};

const jsonContract = {
  coach_summary: "中文训练诊断总结",
  diagnostic_band: 6.0,
  target_band: 6.5,
  word_count: 285,
  biggest_gap: "Lexical Resource",
  priority_fix: "中文优先改进项",
  next_practice_suggestion: "中文下一次练习建议",
  criteria: {
    task_response: { score: 6.0, comment: "中文解释" },
    coherence_cohesion: { score: 6.0, comment: "中文解释" },
    lexical_resource: { score: 5.5, comment: "中文解释" },
    grammar_range_accuracy: { score: 6.0, comment: "中文解释" },
  },
  weakness_tags: [
    {
      category: "Lexical Resource",
      tag: "vague expression",
      severity: "high",
      explanation: "中文解释",
      evidence: "必须来自用户原文",
    },
  ],
  improvement_preview: {
    original_essay: "用户原文全文",
    red_sentences: [
      {
        original: "必须来自用户原文",
        ai_answer: "英文修正句",
        issue_type: "grammar error",
        category: "Grammar Range & Accuracy",
        explanation: "中文解释",
      },
    ],
    yellow_sentences: [
      {
        original: "必须来自用户原文",
        ai_improvement: "英文改进句",
        issue_type: "vague expression",
        category: "Lexical Resource",
        why_it_works: "中文解释",
        practice_tip: "中文练习提示",
      },
    ],
    criteria_advice: [
      {
        category: "Task Response",
        evaluation: "中文评价",
        evidence: "必须来自用户原文",
        next_step: "中文下一步",
      },
    ],
  },
  reflection_questions: ["中文反思问题 1", "中文反思问题 2"],
  training_plan: [
    {
      title: "中文训练标题",
      description: "中文训练说明",
      estimated_minutes: 10,
      focus_area: "Lexical Resource",
    },
  ],
  coach_memory: {
    weakness_pattern: "中文弱项模式",
    suggested_strategy: "中文策略",
  },
  disclaimer: "This is AI-generated training feedback, not an official IELTS score.",
};

export function buildWritingCoachPrompt({
  userProfile,
  questionPrompt,
  essayText,
  targetBand,
  previousWeaknessSummary,
}: BuildWritingCoachPromptInput) {
  const systemPrompt = [
    "你是 IELTS Writing Growth Coach 的服务端批改模型。",
    "你的角色是雅思写作私人教练，不是官方 IELTS 考官，也不是泛用作文检查器。",
    "只支持 IELTS Writing Task 2，只分析用户提交的英文作文。",
    "不要整篇代写，不要生成完整范文，不要改变用户原始立场。",
    "只能在红黄句中提供句子级英文修正或改进，用中文解释原因。",
    "必须使用 IELTS Writing Task 2 四项标准：Task Response, Coherence & Cohesion, Lexical Resource, Grammar Range & Accuracy。",
    "每个关键问题必须绑定用户原文中的 evidence；红黄句 original 必须来自用户原文。",
    "输出必须是严格 JSON。不要 Markdown，不要代码块，不要解释性前缀。",
  ].join("\n");

  const userPrompt = [
    "请根据以下信息生成 Writing Coach Report。",
    "",
    "用户画像：",
    `- 目标分：${targetBand.toFixed(1)}`,
    `- 当前水平：${userProfile.current_level}`,
    `- 考试日期：${userProfile.exam_date ?? "未填写"}`,
    `- 学习目标：${userProfile.main_goal}`,
    `- 历史弱项摘要：${previousWeaknessSummary || "暂无"}`,
    "",
    "Task 2 题目：",
    questionPrompt,
    "",
    "用户作文：",
    essayText,
    "",
    "评分与反馈要求：",
    "- diagnostic_band 必须是 0-9 之间的 0.5 间隔训练诊断分，不是官方分数。",
    "- criteria 四项都必须给分和中文解释。",
    "- weakness_tags 至少 1 个，severity 只能是 low、medium、high。",
    "- red_sentences 用于准确性问题；yellow_sentences 用于提分空间。",
    "- criteria_advice 必须覆盖四个 IELTS 维度。",
    "- reflection_questions 输出 2-3 个中文问题。",
    "- training_plan 必须刚好 3 个任务。",
    "- disclaimer 必须包含非官方 IELTS 分数说明。",
    "",
    "严格按此 JSON 形状返回，不要增加其他字段：",
    JSON.stringify(jsonContract, null, 2),
  ].join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}
