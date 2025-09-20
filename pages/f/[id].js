import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function Avatar({ mood, time }) {
  const tips = {
    neutral: "I’ll keep it straight and simple.",
    positive: "Awesome! I’ll be brief, you’ve got this.",
    frustrated: "No stress—I'll explain each step clearly.",
    worried: "I’ll go slow and double-check anything unclear.",
    confused: "We’ll take it one field at a time."
  }
  const timeMsg = {
    fast: "I’ll keep it snappy.",
    five: "We’ll aim for ~5 minutes.",
    more: "We can take our time."
  }
  return (
    <div style={{ position:'fixed', bottom:16, right:16, display:'flex', gap:12, alignItems:'center' }}>
      <div style={{ maxWidth:280, background:'#111', color:'#fff', padding:'10px 12px', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
        <div style={{fontWeight:600, marginBottom:4}}>Hi — I’m here to help</div>
        <div style={{fontSize:13, opacity:0.9}}>{tips[mood]} {timeMsg[time]}</div>
      </div>
      <img src="/avatar.svg" alt="" width={48} height={48} style={{borderRadius:12}} />
    </div>
  )
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

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const r = await fetch(`/api/forms?id=${id}`)
        const ct = r.headers.get('content-type') || ''
        const data = ct.includes('application/json') ? await r.json() : null
        if (!r.ok) throw new Error(data?.error || `API error ${r.status}`)
        setForm(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div style={{padding:24}}>Loading…</div>
  if (error)   return <div style={{padding:24, color:'crimson'}}>Error: {error}</div>
  if (!form)   return <div style={{padding:24}}>Form not found.</div>

  const fields = form?.schema?.fields || []
  const done   = step > fields.length

  const onNext = () => setStep(s => (s === 0 ? 1 : Math.min(fields.length + 1, s + 1)))
  const onChange = (f, v) => setAnswers(a => ({ ...a, [f]: v }))

  const exportCSV = () => {
    const rows = Object.entries(answers)
    const csv = ['field,answer', ...rows.map(([k,v]) => `"${k}","${(v??'').toString().replace(/"/g,'""')}"`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(form.title||'form').replace(/\s+/g,'_')}_responses.csv`
    a.click()
  }

  return (
    <main style={{ padding:24 }}>
      <h1>{form.title}</h1>

      {step === 0 ? (
        <>
          <div style={{display:'flex', gap:16, alignItems:'center', margin:'8px 0 16px'}}>
            <label>How are you feeling?{' '}
              <select value={mood} onChange={e=>setMood(e.target.value)}>
                <option value="neutral">Neutral</option>
                <option value="positive">Positive</option>
                <option value="frustrated">Frustrated</option>
                <option value="worried">Worried</option>
                <option value="confused">Confused</option>
              </select>
            </label>
            <label>Time budget{' '}
              <select value={time} onChange={e=>setTime(e.target.value)}>
                <option value="fast">Under 2 min</option>
                <option value="five">About 5 min</option>
                <option value="more">I have time</option>
              </select>
            </label>
          </div>
          <button onClick={onNext} style={{ padding:'8px 14px', background:'#111', color:'#fff', borderRadius:8 }}>Start</button>
        </>
      ) : done ? (
        <>
          <p>All done — nice work.</p>
          <button onClick={exportCSV} style={{ padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8 }}>Export CSV</button>
        </>
      ) : (
        <>
          <div style={{marginTop:8, color:'#6b7280', fontSize:12}}>
            Step {step} of {fields.length}
          </div>
          <label style={{display:'block', fontWeight:600, marginTop:10}}>
            {fields[step-1]}
          </label>
          <input
            style={{width:420, padding:8, border:'1px solid #e5e7eb', borderRadius:8}}
            value={answers[fields[step-1]] || ''}
            onChange={e => onChange(fields[step-1], e.target.value)}
            autoFocus
          />
          <div style={{marginTop:12}}>
            <button onClick={onNext} style={{padding:'8px 14px', background:'#111', color:'#fff', borderRadius:8}}>
              {step < fields.length ? 'Next' : 'Finish'}
            </button>
          </div>
        </>
      )}

      <Avatar mood={mood} time={time} />
    </main>
  )
}
