# AssistaForm — Full Pack (MVP + Polish + Submissions + Analytics)

What you get
- Next.js app with clean UI
- Create forms (CSV header import) → share `/f/{id}`
- Guided fill with avatar + progress
- Submissions logged (mood, time budget, duration)
- Analytics `/analytics/{id}` + CSV export
- Secure: Supabase service role only on server; RLS can stay ON

1) Supabase: choose ONE schema
Run exactly one file in Supabase SQL Editor:
- `supabase/schema_uuid.sql` (recommended)
- `supabase/schema_bigint.sql` (if your existing `forms.id` is bigint)

Check type:
```sql
select data_type from information_schema.columns
where table_schema='public' and table_name='forms' and column_name='id';
```

2) Vercel envs
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

3) Routes
- `/` home
- `/dashboard` builder
- `/f/{id}` fill
- `/analytics/{id}` analytics
- `/api/health`
- `/api/forms` (GET/POST)
- `/api/submissions` (POST)
- `/api/analytics` (GET)
- `/api/submissions_csv` (GET)

Notes
- Use either `public_id` or `id` in URLs.
- Analytics fetches up to 1000 most recent submissions.
