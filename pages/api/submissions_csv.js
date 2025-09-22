import { supabaseAdmin } from '../../lib/supabaseAdmin'
export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).send('Server not configured')
  try {
    const { id } = req.query; if (!id) return res.status(400).send('Missing id')
    let form = null
    try { const r1 = await supabaseAdmin.from('forms').select('id,title,public_id').eq('public_id', id).maybeSingle(); if (!r1.error && r1.data) form = r1.data } catch {}
    if (!form) { try { const r2 = await supabaseAdmin.from('forms').select('id,title,public_id').eq('id', id).maybeSingle(); if (!r2.error && r2.data) form = r2.data } catch {} }
    if (!form) return res.status(404).send('Form not found')
    const { data: subs, error } = await supabaseAdmin.from('submissions').select('created_at,duration_ms,mood,time_budget,answers').eq('form_id', form.id).order('created_at', { ascending: false }).limit(1000)
    if (error) throw error
    const keys = new Set(); for (const s of subs || []) for (const k of Object.keys(s.answers || {})) keys.add(k)
    const cols = ['created_at','duration_ms','mood','time_budget', ...Array.from(keys)]
    const esc = (v) => `"${(v==null?'':String(v)).replace(/"/g,'""')}"`
    const rows = [cols.join(',')]
    for (const s of subs || []) {
      const base = [s.created_at, s.duration_ms ?? '', s.mood ?? '', s.time_budget ?? '']
      const vals = [...Array.from(keys)].map(k => (s.answers && k in s.answers) ? s.answers[k] : '')
      rows.push([...base, ...vals].map(esc).join(','))
    }
    const csv = rows.join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${(form.title||'form').replace(/\s+/g,'_')}_submissions.csv"`)
    return res.status(200).send(csv)
  } catch (e) { console.error('/api/submissions_csv error:', e); return res.status(500).send('Server error') }
}
