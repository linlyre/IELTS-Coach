export const userProfile = {
  targetBand: 7.0,
  targetBandLabel: "7.0",
  currentLevel: "6.0",
  examDate: "2026-07-24",
  mainGoal: "稳定冲击 7.0",
};

export const navItems = [
  { href: "/essays", label: "作文档案" },
  { href: "/report/demo", label: "教练报告" },
  { href: "/dashboard", label: "成长看板" },
];

export const landingPageContent = {
  capabilities: [
    {
      title: "结构化诊断",
      text: "从 IELTS 四个评分维度定位主要短板。",
    },
    {
      title: "句子级反馈",
      text: "逐句指出问题，并给出更自然的英文改写。",
    },
    {
      title: "长期成长追踪",
      text: "记录每次练习，观察分数、短板和复训完成度。",
    },
  ],
  coachFlow: ["Submit", "Coach Report", "Reflect", "Drill", "Track"],
  previewCards: ["Essay Structure", "Priority Fix", "Sentence Lab", "Growth Dashboard"],
};

export const writingTips = [
  "审清题目所有要求，明确写作目的。",
  "使用具体例子和数据支持你的观点。",
  "结构清晰：引言、主体段、结论。",
  "注意词汇多样性、连贯性与语法准确性。",
];

export const samplePrompts = [
  {
    id: "transport",
    title: "公共交通",
    category: "环境 / 交通",
    prompt:
      "Some people think governments should invest more in public transportation rather than building new roads. Discuss both views and give your opinion.",
  },
  {
    id: "cities",
    title: "城市拥挤",
    category: "城市 / 社会",
    prompt:
      "Many cities are becoming increasingly crowded. What problems does this cause, and what solutions can be taken?",
  },
  {
    id: "online-learning",
    title: "在线学习",
    category: "教育 / 科技",
    prompt:
      "Some people believe that online learning is more effective than traditional classroom learning. To what extent do you agree or disagree?",
  },
];

export const sampleEssay = {
  title: "Technology and daily life",
  category: "科技 / 社会",
  prompt:
    "Some people believe that technology has more advantages than disadvantages. To what extent do you agree or disagree?",
  text: [
    "Nowadays, technology is developing very fast and it influences almost every part of people's lives. Many people think that technology has more advantages than disadvantages. I agree with this opinion because technology makes our life easier and more comfortable.",
    "Firstly, technology helps people work and study more efficiently. For example, students can use online courses to learn knowledge from different countries, and workers can finish many tasks at home. This saves time and gives people more choices. However, some people says technology make people lazy because they depend on machines too much.",
    "Secondly, technology also improves communication. People can talk with friends and family even if they live far away. However, there are some problems that technology brings. For example, people may spend too much time on social media and ignore real relationships.",
    "In conclusion, I believe technology brings more benefits than problems. If people use it carefully, it can improve study, work and daily life.",
  ].join("\n\n"),
};

export const essayRecords = [
  {
    id: "demo",
    prompt: "远程办公对职场的影响",
    taskType: "Task 2",
    createdAt: "2026-05-28 10:34",
    diagnosticBand: 6.5,
    biggestGap: "论证深度",
    drillCompleted: 2,
    drillTotal: 3,
    reflectionStatus: "进行中",
    status: "in_progress",
  },
  {
    id: "public-transport",
    prompt: "政府应优先投资公共交通",
    taskType: "Task 2",
    createdAt: "2026-05-22 09:20",
    diagnosticBand: 6.0,
    biggestGap: "词汇多样性",
    drillCompleted: 3,
    drillTotal: 3,
    reflectionStatus: "已完成",
    status: "completed",
  },
  {
    id: "study-abroad",
    prompt: "学生出国留学的利与弊",
    taskType: "Task 2",
    createdAt: "2026-05-16 14:15",
    diagnosticBand: 5.5,
    biggestGap: "语法准确性",
    drillCompleted: 1,
    drillTotal: 3,
    reflectionStatus: "待反思",
    status: "pending_reflection",
  },
  {
    id: "technology-education",
    prompt: "科技在教育中的作用",
    taskType: "Task 2",
    createdAt: "2026-05-09 11:05",
    diagnosticBand: 6.5,
    biggestGap: "论证深度",
    drillCompleted: 3,
    drillTotal: 3,
    reflectionStatus: "已完成",
    status: "completed",
  },
  {
    id: "arts-tax",
    prompt: "艺术资助是否值得纳税人支持",
    taskType: "Task 2",
    createdAt: "2026-05-02 16:45",
    diagnosticBand: 5.5,
    biggestGap: "任务回应",
    drillCompleted: 2,
    drillTotal: 3,
    reflectionStatus: "待反思",
    status: "pending_reflection",
  },
];

export const writingReport = {
  essayId: "demo",
  taskType: "Task 2 学术类",
  taskTitle: "科技发展利大于弊",
  createdAt: "2026-05-28 10:34",
  originalEssay: [
    "Nowadays, technology is developing very fast and it influences almost every part of people's lives. Many people think that technology has more advantages than disadvantages. I agree with this opinion because technology makes our life easier and more comfortable.",
    "Firstly, technology helps people work and study more efficiently. For example, students can use online courses to learn knowledge from different countries, and workers can finish many tasks at home. This saves time and gives people more choices. However, some people says technology make people lazy because they depend on machines too much.",
    "Secondly, technology also improves communication. People can talk with friends and family even if they live far away. However, there are some problems that technology brings. For example, people may spend too much time on social media and ignore real relationships.",
    "In conclusion, I believe technology brings more benefits than problems. If people use it carefully, it can improve study, work and daily life.",
  ],
  coachSummary:
    "你的文章结构清晰，能够回应题目要求，但主体段论证仍偏泛，语法准确性和句子多样性是下一轮训练的重点。",
  diagnosticBand: 6.5,
  targetBand: 7.0,
  wordCount: 286,
  biggestGap: "语法准确性",
  priorityFix: "先减少主谓一致与时态错误，再增加复合句的稳定使用。",
  nextPracticeSuggestion: "下一篇作文优先训练 body paragraph 的解释深度和句式准确性。",
  criteria: [
    {
      key: "TR",
      name: "任务回应",
      english: "Task Response",
      score: 6.5,
      comment: "较好回应题目，但部分观点展开仍缺少具体解释。",
    },
    {
      key: "CC",
      name: "连贯与衔接",
      english: "Coherence & Cohesion",
      score: 6.0,
      comment: "段落结构清楚，衔接词使用合理，但少量连接略机械。",
    },
    {
      key: "LR",
      name: "词汇资源",
      english: "Lexical Resource",
      score: 6.5,
      comment: "词汇范围较广，搭配基本准确，但仍有表达不够地道之处。",
    },
    {
      key: "GRA",
      name: "语法丰富度与准确性",
      english: "Grammar Range & Accuracy",
      score: 6.0,
      comment: "尝试使用复杂句，但语法错误会影响部分句子的清晰度。",
    },
  ],
  weaknessTags: ["主谓一致", "时态错误", "冠词使用", "复杂句结构", "词汇搭配准确度"],
  improvementPreview: {
    redSentences: [
      {
        original:
          "However, some people says technology make people lazy because they depend on machines too much.",
        aiAnswer:
          "However, some people say technology makes people lazy because they depend on machines too much.",
        issue: "主谓一致错误",
        category: "Grammar Range & Accuracy",
        explanation:
          "some people 是复数主语，应使用 say；technology 是单数主语，应使用 makes。",
      },
      {
        original:
          "This saves time and gives people more choices.",
        aiAnswer:
          "This saves time and gives people more choices.",
        issue: "指代略泛",
        category: "Coherence & Cohesion",
        explanation:
          "This 的指代可以成立，但前句信息较多，下一步可改成 a clearer subject 来提升衔接清晰度。",
      },
    ],
    yellowSentences: [
      {
        original:
          "Many people think that technology has more advantages than disadvantages.",
        aiImprovement:
          "Many people believe that technology offers more benefits than drawbacks.",
        issue: "表达更自然",
        category: "Lexical Resource",
        whyItWorks:
          "believe、offers benefits、drawbacks 比 think、has advantages/disadvantages 更自然，也更接近学术写作表达。",
        practiceTip:
          "下次遇到 advantages and disadvantages，可以练习替换为 benefits, drawbacks, upsides, limitations。",
      },
      {
        original: "Technology makes our life easier and more comfortable.",
        aiImprovement:
          "Technology makes our lives easier and allows people to work, study and communicate more conveniently.",
        issue: "观点展开不足",
        category: "Task Response",
        whyItWorks:
          "改进句不仅修正 life/lives 的搭配，也补充了 work、study、communicate 三个具体方面，让观点更有解释力。",
        practiceTip:
          "主题句后可以立刻补充 2-3 个具体场景，避免只停留在 broad claim。",
      },
      {
        original: "However, there are some problems that technology brings.",
        aiImprovement:
          "However, technology also creates problems such as distraction, reduced face-to-face communication and overdependence on digital tools.",
        issue: "内容过泛",
        category: "Task Response",
        whyItWorks:
          "改进句直接列出具体问题，比 some problems 更明确，能帮助主体段继续展开。",
        practiceTip:
          "写让步段时，不要只说 there are problems，要点出具体问题类型。",
      },
    ],
    criteriaAdvice: [
      {
        category: "任务回应",
        english: "Task Response",
        evaluation:
          "立场清楚，也能覆盖正反两面，但主体段的解释仍偏概括。",
        evidence:
          "Technology makes our life easier and more comfortable.",
        nextStep:
          "每个主体段至少补充一个具体场景，例如 online learning、remote work 或 social media overuse。",
      },
      {
        category: "连贯与衔接",
        english: "Coherence & Cohesion",
        evaluation:
          "段落顺序清晰，但部分连接句依赖 this、however，推进方式略单一。",
        evidence: "This saves time and gives people more choices.",
        nextStep:
          "把模糊指代改成清晰主语，例如 This flexibility 或 Online access。",
      },
      {
        category: "词汇资源",
        english: "Lexical Resource",
        evaluation:
          "基础词汇能表达观点，但 think、good、problems、life 等词使用较普通。",
        evidence:
          "Many people think that technology has more advantages than disadvantages.",
        nextStep:
          "优先积累高频同义替换：believe, argue, benefits, drawbacks, digital tools。",
      },
      {
        category: "语法丰富度与准确性",
        english: "Grammar Range & Accuracy",
        evaluation:
          "能使用复合句，但主谓一致和单复数错误影响准确度。",
        evidence:
          "some people says technology make people lazy",
        nextStep:
          "提交前专门检查第三人称单数、复数名词和从句主谓一致。",
      },
    ],
  },
  sentenceCoachingLab: [
    {
      original:
        "Many people think that technology has more advantages than disadvantages.",
      improved:
        "Many people believe that technology offers more benefits than drawbacks.",
      issue: "表达更自然",
    },
    {
      original: "Technology makes our life easier and more comfortable.",
      improved:
        "Technology makes our lives easier and allows people to work, study and communicate more conveniently.",
      issue: "观点展开不足",
    },
    {
      original: "However, there are some problems that technology brings.",
      improved:
        "However, technology also creates problems such as distraction, reduced face-to-face communication and overdependence on digital tools.",
      issue: "内容过泛",
    },
  ],
  reflectionQuestions: [
    "你是否完整回应了题目中所有的问题？",
    "哪一个主体段的例子最弱？是否可以补充更具体的解释？",
    "下次写同类题目时，你应该先检查观点展开，还是先检查语法准确性？",
  ],
  trainingPlan: [
    {
      title: "语法准确性强化练习",
      description: "主谓一致、时态、冠词专项训练",
      estimatedMinutes: 15,
      focusArea: "Grammar Range & Accuracy",
      status: "已完成",
    },
    {
      title: "句子多样性提升练习",
      description: "复合句、从句结构与连接词练习",
      estimatedMinutes: 20,
      focusArea: "Coherence & Cohesion",
      status: "进行中",
    },
    {
      title: "词汇精准度训练",
      description: "学术词汇搭配与同义替换练习",
      estimatedMinutes: 12,
      focusArea: "Lexical Resource",
      status: "未开始",
    },
  ],
};

export const dashboardData = {
  currentBand: 6.5,
  drillCompletionRate: 73,
  reflectionCompletionRate: 40,
  totalEssays: 5,
  currentBiggestGap: "词汇多样性",
  currentBiggestGapScore: 4.5,
  monthlyNewEssays: 5,
  completedDrills: 11,
  totalDrills: 15,
  examCountdown: {
    targetDate: userProfile.examDate,
    days: 56,
  },
  bandTrend: [
    { date: "5/02", band: 5.5 },
    { date: "5/09", band: 6.5 },
    { date: "5/16", band: 5.5 },
    { date: "5/22", band: 6.0 },
    { date: "5/28", band: 6.5 },
  ],
  criteriaAverage: [
    { name: "任务回应", score: 6.5, target: 7 },
    { name: "连贯与衔接", score: 6.0, target: 7 },
    { name: "词汇资源", score: 4.5, target: 7 },
    { name: "语法丰富度与准确性", score: 6.0, target: 7 },
  ],
  trendInsight: "最近 5 篇作文整体从 5.5 提升到 6.5，复训后波动逐步收窄。",
  weaknessInsight: "词汇多样性是目前主要短板，建议加强同义替换与地道表达训练。",
  weeklySuggestions: [
    {
      title: "完成 2 篇 Task 2 训练",
      description: "重点练习论点展开与论证深度",
    },
    {
      title: "积累 20 个高级词汇",
      description: "学习同义替换与学术表达",
    },
    {
      title: "复习语法错误高频点",
      description: "关注从句结构与时态一致性",
    },
  ],
  metricCards: [
    {
      key: "currentBand",
      title: "当前诊断分",
      value: "6.5",
      detail: "较第一篇 ↑ 1.0",
    },
    {
      key: "drillCompletion",
      title: "训练完成率",
      value: "73%",
      detail: "完成 11 / 15 次训练",
    },
    {
      key: "totalEssays",
      title: "累计作文数",
      value: "5",
      detail: "本月新增 5 篇",
    },
    {
      key: "biggestGap",
      title: "当前最大短板",
      value: "词汇多样性",
      detail: "平均分 4.5 / 9",
    },
  ],
};

export const essayLibraryData = {
  focusTitle: "Task 2 - 议论文",
  focusDescription: "提升观点展开与逻辑连贯性，增强论证深度。",
  progress: {
    total: essayRecords.length,
    completed: essayRecords.filter((essay) => essay.status === "completed").length,
    inProgress: essayRecords.filter((essay) => essay.status === "in_progress").length,
    pendingReflection: essayRecords.filter(
      (essay) => essay.status === "pending_reflection",
    ).length,
  },
  improvementDelta: 1.0,
};
