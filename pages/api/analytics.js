import { supabaseAdmin } from '../../lib/supabaseAdmin'
function summarize(rows) {
  const total = rows.length, now = new Date(), sevenAgo = new Date(now.getTime() - 7*24*60*60*1000)
  let last7 = 0, durationSum = 0, durationCount = 0
  const mood = { neutral:0, positive:0, frustrated:0, worried:0, confused:0, null:0 }
  const timeBudget = { fast:0, five:0, more:0, null:0 }
  const daily = {}
  for (const row of rows) {
    const t = new Date(row.created_at), isoDay = t.toISOString().slice(0,10)
    daily[isoDay] = (daily[isoDay] || 0) + 1
    if (t >= sevenAgo) last7++
    if (typeof row.duration_ms === 'number') { durationSum += row.duration_ms; durationCount++ }
    const m = row.mood || 'null'; if (mood[m] !== undefined) mood[m]++; else mood['null']++
    const tb = row.time_budget || 'null'; if (timeBudget[tb] !== undefined) timeBudget[tb]++; else timeBudget['null']++
  }
  const avgDurationMs = durationCount ? Math.round(durationSum / durationCount) : 0
  const series = []; for (let i=6;i>=0;i--){ const d = new Date(now.getTime() - i*24*60*60*1000).toISOString().slice(0,10); series.push({ day: d, count: daily[d] || 0 }) }
  return { total, last7, avgDurationMs, mood, timeBudget, series }
}
export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured. Missing Supabase env vars.' })
  if (req.method !== 'GET') { res.setHeader('Allow',['GET']); return res.status(405).end('Method Not Allowed') }
  try {
    const { id } = req.query; if (!id) return res.status(400).json({ error: 'Missing id' })
    let form = null
    try { const r1 = await supabaseAdmin.from('forms').select('id,title,public_id,created_at').eq('public_id', id).maybeSingle(); if (!r1.error && r1.data) form = r1.data } catch {}
    if (!form) { try { const r2 = await supabaseAdmin.from('forms').select('id,title,public_id,created_at').eq('id', id).maybeSingle(); if (!r2.error && r2.data) form = r2.data } catch {} }
    if (!form) return res.status(404).json({ error: 'Form not found' })
    const { data: subs, error } = await supabaseAdmin.from('submissions').select('id,created_at,duration_ms,mood,time_budget,answers').eq('form_id', form.id).order('created_at', { ascending: false }).limit(1000)
    if (error) throw error
    const summary = summarize(subs || [])
    const recent = (subs || []).slice(0, 20)
    return res.status(200).json({ form, summary, recent })
  } catch (e) { console.error('/api/analytics error:', e); return res.status(500).json({ error: e.message || 'Server error' }) }
}
