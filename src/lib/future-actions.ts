export const futureActions = {
  login: "连接 Supabase Auth；成功后根据 onboarding 状态进入 /onboarding、/write 或 /dashboard。",
  signup: "连接 Supabase Auth；注册成功后进入 /onboarding 设置训练画像。",
  startPractice: "登录后进入 /write；未登录用户先进入 /auth/login。",
  submitEssay: "创建 essay 记录，并调用 AI 报告生成流程；成功后进入 /report/[id]。",
  viewPreview: "进入 /report/[id]/preview 查看标红句、标黄句和四维具体建议。",
  startTraining: "聚焦本报告生成的 3 个 drill_tasks，开始专项复训闭环。",
  markDrillDone: "更新 drill_tasks 的训练任务状态为 completed。",
  saveReflection: "写入或更新 reflection_notes 中的用户反思笔记。",
  saveProfile: "更新 user_profiles 中的目标分、当前水平、考试日期和学习目标。",
  logout: "调用 Supabase Auth 登出，并返回未登录状态。",
  loadPrompt: "从 sample_prompts 读取示例 Task 2 题目并填入表单。",
  loadSampleEssay: "从 demo seed data 读取低质量样例作文并填入表单。",
  viewReport: "打开该作文对应的 Writing Coach Report。",
  deleteEssay: "删除作文及其报告、弱项标签、提升预览、反思和训练任务。",
  filterEssays: "基于作文状态、反思状态和训练完成度筛选作文档案。",
} as const;

export type FutureActionKey = keyof typeof futureActions;

export function futureActionProps(action: FutureActionKey) {
  return {
    "data-future-action": futureActions[action],
    title: futureActions[action],
  };
}
