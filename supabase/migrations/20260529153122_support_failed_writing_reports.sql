alter table public.writing_reports
  add column error_message text;

alter table public.writing_reports
  alter column coach_summary drop not null,
  alter column diagnostic_band drop not null,
  alter column target_band drop not null,
  alter column word_count drop not null,
  alter column biggest_gap drop not null,
  alter column priority_fix drop not null,
  alter column next_practice_suggestion drop not null;

alter table public.writing_reports
  add constraint writing_reports_completed_fields_required
  check (
    status <> 'completed'
    or (
      coach_summary is not null
      and diagnostic_band is not null
      and target_band is not null
      and word_count is not null
      and biggest_gap is not null
      and priority_fix is not null
      and next_practice_suggestion is not null
    )
  );
