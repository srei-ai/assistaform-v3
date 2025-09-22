import { supabaseAdmin } from '../../lib/supabaseAdmin'
export default async function handler(req, res) {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server not configured. Missing Supabase env vars.' })
  try {
    if (req.method === 'POST') {
      const { title, fields } = req.body || {}
      if (!title || !Array.isArray(fields) || fields.length === 0) return res.status(400).json({ error: 'Need title and fields[]' })
      const schema = { fields }
      const { data, error } = await supabaseAdmin.from('forms').insert([{ title, schema }]).select().single()
      if (error) throw error; return res.status(200).json(data)
    }
    if (req.method === 'GET') {
      const { id } = req.query; if (!id) return res.status(400).json({ error: 'Missing id' })
      let row = null
      try { const r1 = await supabaseAdmin.from('forms').select('*').eq('public_id', id).maybeSingle(); if (!r1.error && r1.data) row = r1.data } catch {}
      if (!row) { try { const r2 = await supabaseAdmin.from('forms').select('*').eq('id', id).maybeSingle(); if (!r2.error && r2.data) row = r2.data } catch {} }
      if (!row) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(row)
    }
    res.setHeader('Allow', ['GET','POST']); return res.status(405).end('Method Not Allowed')
  } catch (e) { console.error('/api/forms error:', e); return res.status(500).json({ error: e.message || 'Server error' }) }
}
