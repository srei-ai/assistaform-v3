import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ProgressBar from '../../components/ProgressBar'

function Avatar({ mood, time }) {
  const tips = { neutral:"I’ll keep it straight and simple.", positive:"Awesome! I’ll be brief, you’ve got this.", frustrated:"No stress—I'll explain each step clearly.", worried:"I’ll go slow and double-check anything unclear.", confused:"We’ll take it one field at a time." }
  const timeMsg = { fast:"I’ll keep it snappy.", five:"We’ll aim for ~5 minutes.", more:"We can take our time." }
  return (<div className="helper" aria-live="polite"><div className="helper-bubble"><div style={{fontWeight:600, marginBottom:4}}>Hi — I’m here to help</div><div style={{fontSize:13, opacity:0.9}}>{tips[mood]} {timeMsg[time]}</div></div><img src="/avatar.svg" alt="" width={48} height={48} style={{borderRadius:12}} /></div>)
}

export default function FillPage() {
  const { query } = useRouter()
  const id = query.id
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [mood, setMood] = useState('neutral')
  const [time, setTime] = useState('five')
  const [startedAt, setStartedAt] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const r = await fetch(`/api/forms?id=${id}`)
        const ct = r.headers.get('content-type') || ''
        const data = ct.includes('application/json') ? await r.json() : null
        if (!r.ok) throw new Error(data?.error || `API error ${r.status}`)
        setForm(data)
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    })()
  }, [id])

  if (loading) return <div>Loading…</div>
  if (error) return <div style={{color:'crimson'}}>Error: {error}</div>
  if (!form) return <div>Form not found.</div>

  const fields = form?.schema?.fields || []
  const done = step > fields.length

  const onNext = async () => {
    if (step === 0) { setStartedAt(Date.now()); setStep(1); return }
    const next = Math.min(fields.length + 1, step + 1)
    setStep(next)
    if (next > fields.length) {
      try {
        const duration_ms = startedAt ? (Date.now() - startedAt) : null
        const r = await fetch('/api/submissions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, answers, mood, time, duration_ms }) })
        const j = await r.json(); if (!r.ok) throw new Error(j.error || `API ${r.status}`)
        setSaved(true)
      } catch (e) { console.error('Failed to save submission', e) }
    }
  }

  const onChange = (f, v) => setAnswers(a => ({ ...a, [f]: v }))
  const exportCSV = () => {
    const rows = Object.entries(answers)
    const csv = ['field,answer', ...rows.map(([k,v]) => `"${k}","${(v??'').toString().replace(/"/g,'""')}"`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${(form.title||'form').replace(/\s+/g,'_')}_responses.csv`; a.click()
  }

  const currentForProgress = Math.min(step, fields.length)
  return (
    <main>
      <div className="card" style={{padding:20}}>
        <h1 style={{marginTop:0}}>{form.title}</h1>
        {step > 0 && fields.length > 0 && <div style={{margin:'12px 0 16px'}}><ProgressBar current={currentForProgress} total={fields.length} /></div>}
        {step === 0 ? (<>
          <div className="row" style={{margin:'8px 0 16px'}}>
            <label htmlFor="mood">How are you feeling?</label>
            <select id="mood" className="select" style={{width:220}} value={mood} onChange={e=>setMood(e.target.value)}>
              <option value="neutral">Neutral</option><option value="positive">Positive</option><option value="frustrated">Frustrated</option><option value="worried">Worried</option><option value="confused">Confused</option>
            </select>
            <label htmlFor="time">Time budget</label>
            <select id="time" className="select" style={{width:220}} value={time} onChange={e=>setTime(e.target.value)}>
              <option value="fast">Under 2 min</option><option value="five">About 5 min</option><option value="more">I have time</option>
            </select>
          </div>
          <button onClick={onNext} className="btn btn-primary">Start</button>
        </>) : done ? (<>
          <p>All done — nice work. {saved ? <span className="badge">Saved</span> : <span className="badge">Saving…</span>}</p>
          <div className="row"><button onClick={exportCSV} className="btn">Export CSV</button><a href="/" className="btn btn-outline">Return home</a></div>
        </>) : (<>
          <label htmlFor="fieldInput">{fields[step-1]}</label>
          <input id="fieldInput" className="input" value={answers[fields[step-1]] || ''} onChange={e => onChange(fields[step-1], e.target.value)} autoFocus />
          <div className="row" style={{marginTop:12}}><button onClick={onNext} className="btn btn-primary">{step < fields.length ? 'Next' : 'Finish'}</button><span className="small">Press Enter to continue</span></div>
        </>)}
      </div>
      <Avatar mood={mood} time={time} />
    </main>
  )
}
