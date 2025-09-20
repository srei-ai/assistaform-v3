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
  const [copied, setCopied] = useState(false)

  const onCsvFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const headers = parseCsvHeader(text)
    if (headers.length) setRawFields(headers.join('\n'))
    else alert('Could not parse header row from CSV')
  }

  const createForm = async () => {
    setError(''); setBusy(true); setCreated(null)
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
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = shareId ? `${origin}/f/${shareId}` : ''

  const copyShare = async () => {
    if (!shareUrl) return
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(()=>setCopied(false), 1500) } catch {}
  }

  return (
    <main>
      <div className="card" style={{padding:20}}>
        <h1 style={{marginTop:0}}>Create a form</h1>

        <label htmlFor="title">Title</label>
        <input id="title" className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Client intake" />

        <label htmlFor="fields">Fields (one per line)</label>
        <textarea id="fields" className="textarea" value={rawFields} onChange={e=>setRawFields(e.target.value)} />

        <div className="row">
          <input type="file" accept=".csv" onChange={onCsvFile} />
          <span className="small">Tip: upload a CSV to use its header row as field names.</span>
        </div>

        {error && <div className="badge" role="status" aria-live="polite" style={{marginTop:8, background:'#ffecec', borderColor:'#ffd2d2', color:'#5f2120'}}>
          ⚠️ {error}
        </div>}

        <div style={{ marginTop: 12 }}>
          <button onClick={createForm} disabled={busy} className="btn btn-primary">
            {busy ? 'Creating…' : 'Create form'}
          </button>
        </div>

        {created && (
          <section style={{marginTop:20}}>
            <hr className="sep" />
            <p>Form created <span className="badge">✅ Saved</span></p>
            <div className="row">
              <code>id: {created.id}</code>
              {created.public_id && <code>public_id: {created.public_id}</code>}
            </div>
            <div className="row" style={{marginTop:8}}>
              <a href={`/f/${shareId}`} target="_blank" rel="noreferrer" className="btn btn-primary">Open fill page →</a>
              <button onClick={copyShare} className="btn btn-outline">{copied ? '✓ Copied' : 'Copy share link'}</button>
            </div>
            <label style={{marginTop:12}}>Embed (iframe)</label>
            <textarea readOnly className="textarea" value={`<iframe src="${shareUrl}" width="480" height="420" style="border:0;"></iframe>`} />
          </section>
        )}
      </div>
    </main>
  )
}
