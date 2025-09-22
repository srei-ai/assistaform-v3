import { supabaseAdmin } from '../../lib/supabaseAdmin'
export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured. Missing Supabase env vars.' })
  if (req.method !== 'POST') { res.setHeader('Allow',['POST']); return res.status(405).end('Method Not Allowed') }
  try {
    const { id, answers, mood, time, duration_ms } = req.body || {}
    if (!id || typeof answers !== 'object') return res.status(400).json({ error: 'Need id (form id or public_id) and answers {..}' })
    let formId = null
    try { const r1 = await supabaseAdmin.from('forms').select('id').eq('public_id', id).maybeSingle(); if (!r1.error && r1.data) formId = r1.data.id } catch {}
    if (!formId) { try { const r2 = await supabaseAdmin.from('forms').select('id').eq('id', id).maybeSingle(); if (!r2.error && r2.data) formId = r2.data.id } catch {} }
    if (!formId) return res.status(404).json({ error: 'Form not found' })
    const payload = { form_id: formId, answers, mood: mood || null, time_budget: time || null, duration_ms: Number.isFinite(duration_ms) ? Math.max(0, Math.trunc(duration_ms)) : null }
    const { data, error } = await supabaseAdmin.from('submissions').insert([payload]).select().single()
    if (error) throw error; return res.status(200).json({ ok: true, submission: data })
  } catch (e) { console.error('/api/submissions error:', e); return res.status(500).json({ error: e.message || 'Server error' }) }
}
