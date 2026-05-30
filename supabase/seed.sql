delete from public.drill_tasks where is_demo;
delete from public.reflection_notes where is_demo;
delete from public.improvement_preview_items where is_demo;
delete from public.weakness_tags where is_demo;
delete from public.writing_reports where is_demo;
delete from public.essays where is_demo;
delete from public.user_profiles where is_demo;

insert into public.user_profiles (
  id,
  is_demo,
  target_band,
  current_level,
  exam_date,
  main_goal,
  onboarding_completed
) values (
  '00000000-0000-4000-8000-000000000001',
  true,
  7.0,
  '6.0',
  '2026-07-24',
  '稳定冲击 7.0',
  true
);

insert into public.essays (
  id,
  profile_id,
  is_demo,
  prompt,
  essay_text,
  word_count,
  source,
  status,
  created_at
) values
(
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  true,
  'Some people think governments should invest more in public transportation rather than building new roads. Discuss both views and give your opinion.',
  'Nowadays, transport is a serious issue in many cities. Some people believe governments should spend more money on buses, subways and trains, while others think new roads are more useful. I think public transportation should be the priority because it can reduce traffic and help more people at the same time.',
  286,
  'sample_seed',
  'completed',
  '2026-05-02 16:45:00+08'
),
(
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000001',
  true,
  'Many cities are becoming increasingly crowded. What problems does this cause, and what solutions can be taken?',
  'In recent years, many big cities have become more crowded than before. This causes several problems for citizens, including traffic jams, high housing prices and pressure on public services. Governments and individuals should work together to make cities more livable.',
  271,
  'sample_seed',
  'completed',
  '2026-05-09 11:05:00+08'
),
(
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000001',
  true,
  'Some people believe that online learning is more effective than traditional classroom learning. To what extent do you agree or disagree?',
  'Online learning is now common in many countries. Some students think it is more effective than classroom learning because it is flexible and convenient. However, I believe online learning cannot fully replace traditional classrooms, especially for young students who need interaction and guidance.',
  279,
  'sample_seed',
  'pending_reflection',
  '2026-05-16 14:15:00+08'
),
(
  '00000000-0000-4000-8000-000000000104',
  '00000000-0000-4000-8000-000000000001',
  true,
  'Some people think students should study abroad, while others believe they should study in their own country. Discuss both views and give your opinion.',
  'Studying abroad has become popular among young people. Some argue that it gives students a wider view of the world, but others believe studying in their own country is cheaper and safer. In my opinion, studying abroad can be valuable if students are prepared for the challenges.',
  264,
  'sample_seed',
  'in_progress',
  '2026-05-22 09:20:00+08'
),
(
  '00000000-0000-4000-8000-000000000105',
  '00000000-0000-4000-8000-000000000001',
  true,
  'Some people believe technology has more benefits than drawbacks. To what extent do you agree or disagree?',
  'Nowadays, technology is developing very fast and it influences almost every part of people''s lives. Many people think that technology has more advantages than disadvantages. I agree with this opinion because technology makes our life easier and more comfortable.',
  286,
  'sample_seed',
  'in_progress',
  '2026-05-28 10:34:00+08'
);

insert into public.writing_reports (
  id,
  essay_id,
  is_demo,
  status,
  coach_summary,
  diagnostic_band,
  target_band,
  word_count,
  biggest_gap,
  priority_fix,
  next_practice_suggestion,
  criteria,
  ai_json,
  generated_at,
  created_at
) values
(
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000101',
  true,
  'completed',
  '你的观点清楚，但公共交通与道路建设的对比还不够深入，例子需要更具体。',
  5.5,
  7.0,
  286,
  '任务回应',
  '先把每个主体段的 reason 和 example 分开写清楚。',
  '下一篇优先训练 problem-solution 或 discuss both views 的段落展开。',
  '{"task_response":{"score":5.5,"comment":"回应了题目，但论证偏概括。"},"coherence_cohesion":{"score":6.0,"comment":"结构清楚，衔接自然度一般。"},"lexical_resource":{"score":5.5,"comment":"词汇准确但重复较多。"},"grammar_range_accuracy":{"score":5.5,"comment":"基础句较稳，复杂句不足。"}}',
  '{"source":"demo_seed","version":"v1"}',
  '2026-05-02 16:46:00+08',
  '2026-05-02 16:46:00+08'
),
(
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000102',
  true,
  'completed',
  '你的文章能覆盖城市拥挤带来的问题，但解决方案仍偏笼统。',
  6.5,
  7.0,
  271,
  '论证深度',
  '把 solutions 写成可执行政策，而不是只写 general advice。',
  '下一篇练习把一个解决方案拆成 policy、mechanism 和 result。',
  '{"task_response":{"score":6.5,"comment":"问题覆盖较完整。"},"coherence_cohesion":{"score":6.5,"comment":"段落推进清楚。"},"lexical_resource":{"score":6.0,"comment":"有主题词，但同义替换不足。"},"grammar_range_accuracy":{"score":6.0,"comment":"错误不多，但句式变化有限。"}}',
  '{"source":"demo_seed","version":"v1"}',
  '2026-05-09 11:06:00+08',
  '2026-05-09 11:06:00+08'
),
(
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000103',
  true,
  'completed',
  '你的立场明确，但 online learning 与 classroom learning 的比较需要更多细节。',
  5.5,
  7.0,
  279,
  '语法准确性',
  '先降低主谓一致、单复数和从句结构错误。',
  '下一篇写完后用 5 分钟检查第三人称单数和复数名词。',
  '{"task_response":{"score":6.0,"comment":"立场明确，解释略浅。"},"coherence_cohesion":{"score":5.5,"comment":"连接词使用重复。"},"lexical_resource":{"score":5.5,"comment":"词汇较安全但普通。"},"grammar_range_accuracy":{"score":5.0,"comment":"基础语法错误影响清晰度。"}}',
  '{"source":"demo_seed","version":"v1"}',
  '2026-05-16 14:16:00+08',
  '2026-05-16 14:16:00+08'
),
(
  '00000000-0000-4000-8000-000000000204',
  '00000000-0000-4000-8000-000000000104',
  true,
  'completed',
  '你的正反观点都有提到，但 opinion 需要在全文中更稳定地推进。',
  6.0,
  7.0,
  264,
  '连贯与衔接',
  '让 introduction、body paragraphs 和 conclusion 的立场保持一致。',
  '下一篇优先练习每段首句与中心立场的对应关系。',
  '{"task_response":{"score":6.0,"comment":"覆盖双方观点但个人立场展开不够。"},"coherence_cohesion":{"score":5.5,"comment":"段间衔接可更清楚。"},"lexical_resource":{"score":6.0,"comment":"表达基本准确。"},"grammar_range_accuracy":{"score":6.0,"comment":"错误可控，复杂句较少。"}}',
  '{"source":"demo_seed","version":"v1"}',
  '2026-05-22 09:21:00+08',
  '2026-05-22 09:21:00+08'
),
(
  '00000000-0000-4000-8000-000000000205',
  '00000000-0000-4000-8000-000000000105',
  true,
  'completed',
  '你的文章结构清晰，能够回应题目要求，但主体段论证仍偏泛，语法准确性和句子多样性是下一轮训练重点。',
  6.5,
  7.0,
  286,
  '语法准确性',
  '先减少主谓一致与时态错误，再增加复合句的稳定使用。',
  '下一篇作文优先训练 body paragraph 的解释深度和句式准确性。',
  '{"task_response":{"score":6.5,"comment":"较好回应题目，但部分观点展开仍缺少具体解释。"},"coherence_cohesion":{"score":6.0,"comment":"段落结构清楚，衔接词使用合理。"},"lexical_resource":{"score":6.5,"comment":"词汇范围较广，搭配基本准确。"},"grammar_range_accuracy":{"score":6.0,"comment":"尝试使用复杂句，但语法错误影响清晰度。"}}',
  '{"source":"demo_seed","version":"v1"}',
  '2026-05-28 10:35:00+08',
  '2026-05-28 10:35:00+08'
);

insert into public.weakness_tags (
  report_id,
  is_demo,
  category,
  tag,
  severity,
  explanation,
  evidence
)
select report_id, true, category, tag, severity::public.weakness_severity, explanation, evidence
from (
  values
  ('00000000-0000-4000-8000-000000000201'::uuid, 'Task Response', '观点展开不足', 'high', '主体段给出观点后缺少具体解释。', 'public transportation should be the priority'),
  ('00000000-0000-4000-8000-000000000201'::uuid, 'Lexical Resource', '词汇重复', 'medium', 'transport、roads 等词重复较多。', 'transport is a serious issue'),
  ('00000000-0000-4000-8000-000000000202'::uuid, 'Task Response', '解决方案不够具体', 'medium', 'solutions 停留在方向层面。', 'Governments and individuals should work together'),
  ('00000000-0000-4000-8000-000000000202'::uuid, 'Lexical Resource', '同义替换不足', 'medium', 'crowded / problems 使用重复。', 'many big cities have become more crowded'),
  ('00000000-0000-4000-8000-000000000203'::uuid, 'Grammar Range & Accuracy', '主谓一致', 'high', '部分句子存在主谓一致风险。', 'online learning cannot fully replace traditional classrooms'),
  ('00000000-0000-4000-8000-000000000203'::uuid, 'Coherence & Cohesion', '连接方式单一', 'medium', 'however / because 的使用较重复。', 'because it is flexible and convenient'),
  ('00000000-0000-4000-8000-000000000204'::uuid, 'Coherence & Cohesion', '立场推进不稳定', 'high', '个人观点在主体段中没有持续强化。', 'Some argue ... but others believe ...'),
  ('00000000-0000-4000-8000-000000000204'::uuid, 'Task Response', '结论回扣不足', 'medium', '结论需要更明确回应题目双方。', 'studying abroad can be valuable'),
  ('00000000-0000-4000-8000-000000000205'::uuid, 'Grammar Range & Accuracy', '主谓一致', 'high', '第三人称单数和复数主语错误影响准确度。', 'some people says technology make people lazy'),
  ('00000000-0000-4000-8000-000000000205'::uuid, 'Lexical Resource', '搭配自然度', 'medium', 'advantages / disadvantages 表达可替换为更自然搭配。', 'technology has more advantages than disadvantages')
) as tags(report_id, category, tag, severity, explanation, evidence);

insert into public.improvement_preview_items (
  report_id,
  is_demo,
  item_type,
  sort_order,
  original_text,
  ai_response,
  issue,
  category,
  explanation,
  why_it_works,
  practice_tip,
  evaluation,
  evidence,
  next_step
)
select report_id, true, item_type::public.preview_item_type, sort_order, original_text, ai_response, issue, category,
  explanation, why_it_works, practice_tip, evaluation, evidence, next_step
from (
  values
  ('00000000-0000-4000-8000-000000000201'::uuid, 'yellow_sentence', 1, 'I think public transportation should be the priority because it can reduce traffic and help more people at the same time.', 'I believe public transportation should be prioritized because it can reduce congestion while serving a much larger group of residents.', '表达更正式', 'Lexical Resource', null, 'prioritized、reduce congestion、residents 更接近学术表达。', '练习把 common words 替换成 topic-specific words。', null, null, null),
  ('00000000-0000-4000-8000-000000000201'::uuid, 'criteria_advice', 2, null, null, null, 'Task Response', null, null, null, '需要把双方观点的 reason 和 example 展开。', 'new roads are more useful', '每个主体段补充一个具体城市交通场景。'),
  ('00000000-0000-4000-8000-000000000202'::uuid, 'yellow_sentence', 1, 'Governments and individuals should work together to make cities more livable.', 'Governments should expand affordable housing and improve public transport so that population growth does not overload city services.', '解决方案具体化', 'Task Response', null, '改进句给出两个可执行政策和结果。', '写 solution 时使用 policy + mechanism + result。', null, null, null),
  ('00000000-0000-4000-8000-000000000202'::uuid, 'criteria_advice', 2, null, null, null, 'Task Response', null, null, null, '解决方案方向正确，但缺少执行细节。', 'work together', '把 broad advice 改写成具体政策。'),
  ('00000000-0000-4000-8000-000000000203'::uuid, 'yellow_sentence', 1, 'Online learning is now common in many countries.', 'Online learning has become increasingly common in many countries, especially after schools and universities adopted digital platforms.', '背景句展开不足', 'Task Response', null, '补充场景能帮助引入论证。', '背景句可以加入 one specific context。', null, null, null),
  ('00000000-0000-4000-8000-000000000203'::uuid, 'criteria_advice', 2, null, null, null, 'Grammar Range & Accuracy', null, null, null, '语法错误不密集，但复杂句控制不足。', 'students who need interaction and guidance', '优先练习 who / which 从句的主谓一致。'),
  ('00000000-0000-4000-8000-000000000204'::uuid, 'yellow_sentence', 1, 'In my opinion, studying abroad can be valuable if students are prepared for the challenges.', 'In my opinion, studying abroad is valuable when students have clear academic goals and enough support to handle cultural and financial pressure.', '观点更完整', 'Task Response', null, '改进句说明 valuable 的条件，论证更可持续。', '写 opinion 时补充 condition。', null, null, null),
  ('00000000-0000-4000-8000-000000000204'::uuid, 'criteria_advice', 2, null, null, null, 'Coherence & Cohesion', null, null, null, '段落之间有基本连接，但中心立场需要更稳定。', 'Some argue ... but others believe ...', '每段首句回扣自己的最终观点。'),
  ('00000000-0000-4000-8000-000000000205'::uuid, 'red_sentence', 1, 'However, some people says technology make people lazy because they depend on machines too much.', 'However, some people say technology makes people lazy because they depend on machines too much.', '主谓一致错误', 'Grammar Range & Accuracy', 'some people 是复数主语，应使用 say；technology 是单数主语，应使用 makes。', null, null, null, null, null),
  ('00000000-0000-4000-8000-000000000205'::uuid, 'yellow_sentence', 2, 'Many people think that technology has more advantages than disadvantages.', 'Many people believe that technology offers more benefits than drawbacks.', '表达更自然', 'Lexical Resource', null, 'believe、offers benefits、drawbacks 比 think、has advantages/disadvantages 更自然。', '练习替换 advantages and disadvantages。', null, null, null),
  ('00000000-0000-4000-8000-000000000205'::uuid, 'criteria_advice', 3, null, null, null, 'Task Response', null, null, null, '立场清楚，但主体段解释仍偏概括。', 'Technology makes our life easier and more comfortable.', '每个主体段至少补充一个具体场景。')
) as items(report_id, item_type, sort_order, original_text, ai_response, issue, category, explanation, why_it_works, practice_tip, evaluation, evidence, next_step);

insert into public.reflection_notes (
  report_id,
  is_demo,
  questions,
  note,
  completed
) values
('00000000-0000-4000-8000-000000000201', true, '["这篇作文是否完整讨论了双方观点？","哪个主体段最缺少具体例子？"]', '下次先列出双方观点的 reason，再写例子。', true),
('00000000-0000-4000-8000-000000000202', true, '["你的 solution 是否可执行？","每个 solution 是否解释了结果？"]', '需要把解决方案写得更像政策，而不是建议。', true),
('00000000-0000-4000-8000-000000000203', true, '["哪类语法错误最常出现？","下次检查时先看主谓一致还是词汇？"]', null, false),
('00000000-0000-4000-8000-000000000204', true, '["你的立场是否从引言持续到结论？","哪个主体段最偏离中心观点？"]', '需要在每段首句更明确表达自己的倾向。', false),
('00000000-0000-4000-8000-000000000205', true, '["这篇作文中，你最想表达的核心观点是什么？","哪一个主体段的例子最弱？","下次先检查观点展开，还是先检查语法准确性？"]', null, false);

insert into public.drill_tasks (
  report_id,
  is_demo,
  title,
  description,
  focus_area,
  estimated_minutes,
  status
)
select report_id, true, title, description, focus_area, estimated_minutes, status::public.drill_status
from (
  values
  ('00000000-0000-4000-8000-000000000201'::uuid, '观点展开三步练习', '为同一观点写 reason、example、result。', 'Task Response', 15, 'completed'),
  ('00000000-0000-4000-8000-000000000201'::uuid, '交通主题词替换', '整理 congestion、commuters、infrastructure 等词。', 'Lexical Resource', 12, 'completed'),
  ('00000000-0000-4000-8000-000000000201'::uuid, '主体段重写', '重写一个 discuss both views 主体段。', 'Coherence & Cohesion', 20, 'completed'),
  ('00000000-0000-4000-8000-000000000202'::uuid, 'Solution 深化练习', '把 broad solution 改写为具体政策。', 'Task Response', 18, 'completed'),
  ('00000000-0000-4000-8000-000000000202'::uuid, '城市问题词汇组', '积累 housing pressure、public services 等搭配。', 'Lexical Resource', 12, 'completed'),
  ('00000000-0000-4000-8000-000000000202'::uuid, '结果句训练', '为每个解决方案补一个 result sentence。', 'Task Response', 15, 'completed'),
  ('00000000-0000-4000-8000-000000000203'::uuid, '主谓一致检查', '标出每个句子的主语和谓语。', 'Grammar Range & Accuracy', 15, 'completed'),
  ('00000000-0000-4000-8000-000000000203'::uuid, '连接词替换', '把 repeated because/however 改成更自然衔接。', 'Coherence & Cohesion', 12, 'pending'),
  ('00000000-0000-4000-8000-000000000203'::uuid, '教育主题例子库', '为 online learning 准备 3 个具体场景。', 'Task Response', 20, 'pending'),
  ('00000000-0000-4000-8000-000000000204'::uuid, '立场一致性检查', '检查引言、主体段、结论是否一致。', 'Coherence & Cohesion', 12, 'completed'),
  ('00000000-0000-4000-8000-000000000204'::uuid, '条件句训练', '用 if / when / provided that 写观点条件。', 'Grammar Range & Accuracy', 15, 'pending'),
  ('00000000-0000-4000-8000-000000000204'::uuid, '留学主题论据补充', '补充文化适应和学术资源两个例子。', 'Task Response', 18, 'pending'),
  ('00000000-0000-4000-8000-000000000205'::uuid, '语法准确性强化练习', '主谓一致、时态、冠词专项训练。', 'Grammar Range & Accuracy', 15, 'completed'),
  ('00000000-0000-4000-8000-000000000205'::uuid, '句子多样性提升练习', '复合句、从句结构与连接词练习。', 'Coherence & Cohesion', 20, 'pending'),
  ('00000000-0000-4000-8000-000000000205'::uuid, '词汇精准度训练', '学术词汇搭配与同义替换练习。', 'Lexical Resource', 12, 'pending')
) as tasks(report_id, title, description, focus_area, estimated_minutes, status);
