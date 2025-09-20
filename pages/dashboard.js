import { useState } from 'react'

function parseCsvHeader(text) {
  if (!text) return []
  const firstLine = text.split(/\r?\n/)[0] || ''
  return firstLine.split(',').map(h => h.replace(/^["']|["']$/g,'').trim()).filter(Boolean)
}

export default function Dashboard() {
  const [title, setTitle] = useState('Client intake')
  const [rawFields, setRawFields] = useState('name\nemail\ncompany')
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onCsvFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const headers = parseCsvHeader(text)
    if (headers.length) {
      setRawFields(headers.join('\n'))
    } else {
      alert('Could not parse header row from CSV')
    }
  }

  const createForm = async () => {
    setError('')
    setBusy(true)
    try {
      const fields = rawFields.split('\n').map(s => s.trim()).filter(Boolean)
      const r = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, fields }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to create form')
      setCreated(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const shareId = created ? (created.public_id || created.id) : null
  const shareUrl = shareId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${shareId}` : ''

  return (
    <main style={{ padding: 24 }}>
      <h1>Create a form</h1>
      <label style={{display:'block', marginTop:12}}>Title</label>
      <input value={title} onChange={e=>setTitle(e.target.value)}
        style={{ width: 420, padding: 8, border:'1px solid #e5e7eb', borderRadius:8 }}/>

      <label style={{display:'block', marginTop:12}}>Fields (one per line)</label>
      <textarea value={rawFields} onChange={e=>setRawFields(e.target.value)}
        style={{ width: 420, height: 140, padding: 8, border:'1px solid #e5e7eb', borderRadius:8 }}/>

      <div style={{marginTop:8}}>
        <input type="file" accept=".csv" onChange={onCsvFile} />
        <div style={{fontSize:12, color:'#6b7280'}}>Tip: upload a CSV and we’ll use the header row as field names.</div>
      </div>

      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 12 }}>
        <button onClick={createForm} disabled={busy}
          style={{ padding: '8px 14px', background: '#111', color: '#fff', borderRadius: 8 }}>
          {busy ? 'Creating…' : 'Create form'}
        </button>
      </div>

      {created && (
        <section style={{marginTop:20, paddingTop:12, borderTop:'1px solid #e5e7eb'}}>
          <p>Form created ✅</p>
          <div><code>id: {created.id}</code></div>
          <div><code>share: /f/{shareId}</code></div>

          <div style={{ marginTop: 8 }}>
            <label>Embed (iframe)</label>
            <textarea readOnly style={{ width: 420, height: 84, padding: 8, border:'1px solid #e5e7eb', borderRadius:8 }}
              value={`<iframe src="${shareUrl}" width="480" height="420" style="border:0;"></iframe>`} />
          </div>

          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <a href={`/f/${shareId}`} target="_blank" rel="noreferrer"
               style={{ padding:'8px 14px', background:'#111', color:'#fff', borderRadius:8, textDecoration:'none' }}>
              Open fill page →
            </a>
            {shareUrl && (
              <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{ padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8 }}>
                Copy share link
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
