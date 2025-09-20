# AssistaForm — MVP (Next.js + Supabase)

Minimal **production‑deployable** MVP:
- Create forms from field list or CSV header
- Share link `/f/{id}` (uses `public_id` when available, falls back to `id`)
- Guided fill page with simple "avatar" helper and CSV export
- Serverless API uses **Supabase service role** on the server (RLS can stay ON)

## Deploy (Vercel + Supabase)

1) **Supabase**
   - Create project → Settings → API → copy **Project URL** and **Service Role Key**.
   - SQL Editor → run `supabase/schema.sql` (creates `forms` with `public_id`).

2) **Vercel**
   - Import this repo.
   - Env vars:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Deploy → open `/dashboard`.

3) **Local (optional)**
   ```bash
   npm i
   cp .env.example .env.local   # then fill values
   npm run dev
   ```

## Security
- The **service role key** is used only server‑side in API routes.
- RLS remains **enabled**; no public policies required.

## API
- `POST /api/forms` body: `{ title, fields: string[] }`
- `GET /api/forms?id={public_id_or_id}`
