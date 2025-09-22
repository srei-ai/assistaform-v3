import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
function msToNice(ms) { if (!ms) return '—'; const s = Math.round(ms/1000); const m = Math.floor(s/60); const r = s % 60; return m ? `${m}m ${r}s` : `${r}s` }
export default function Analytics() {
  const { query } = useRouter()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const id = query.id
  useEffect(() => { if (!id) return; (async () => {
    try { const r = await fetch(`/api/analytics?id=${id}`); const j = await r.json(); if (!r.ok) throw new Error(j.error || `API ${r.status}`); setData(j) }
    catch (e) { setError(e.message) }
  })() }, [id])
  const exportAll = () => { window.location.href = `/api/submissions_csv?id=${id}` }
  if (error) return <div style={{color:'crimson'}}>Error: {error}</div>
  if (!data) return <div>Loading…</div>
  const { form, summary, recent } = data
  return (<main><div className="card" style={{padding:20}}>
    <h1 style={{marginTop:0}}>Analytics — {form.title}</h1>
    <div className="row" style={{margin:'8px 0 16px'}}>
      <span className="badge">Total: {summary.total}</span>
      <span className="badge">Last 7 days: {summary.last7}</span>
      <span className="badge">Avg duration: {msToNice(summary.avgDurationMs)}</span>
      <button onClick={exportAll} className="btn">Export CSV (last 1000)</button>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:12, marginTop:8}}>
      <div className="card"><h3 style={{marginTop:0}}>Mood</h3><ul style={{margin:0, paddingLeft:16}}>
        {Object.entries(summary.mood).map(([k,v]) => <li key={k}>{k}: {v}</li>)}
      </ul></div>
      <div className="card"><h3 style={{marginTop:0}}>Time budget</h3><ul style={{margin:0, paddingLeft:16}}>
        {Object.entries(summary.timeBudget).map(([k,v]) => <li key={k}>{k}: {v}</li>)}
      </ul></div>
      <div className="card"><h3 style={{marginTop:0}}>Last 7 days</h3>
        <table style={{width:'100%', borderCollapse:'collapse'}}><thead><tr><th style={{textAlign:'left'}}>Day</th><th style={{textAlign:'right'}}>Submissions</th></tr></thead><tbody>
          {summary.series.map(pt => (<tr key={pt.day}><td>{pt.day}</td><td style={{textAlign:'right'}}>{pt.count}</td></tr>))}
        </tbody></table>
      </div>
    </div>
    <h3 style={{marginTop:16}}>Recent submissions</h3>
    <div className="card" style={{overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse'}}><thead><tr><th style={{textAlign:'left'}}>When</th><th style={{textAlign:'left'}}>Mood</th><th style={{textAlign:'left'}}>Time</th><th style={{textAlign:'right'}}>Duration</th><th style={{textAlign:'left'}}>Answers</th></tr></thead>
        <tbody>{recent.map(row => (<tr key={row.id}><td>{new Date(row.created_at).toLocaleString()}</td><td>{row.mood || '—'}</td><td>{row.time_budget || '—'}</td><td style={{textAlign:'right'}}>{msToNice(row.duration_ms)}</td><td><code style={{fontSize:12}}>{Object.entries(row.answers||{}).map(([k,v]) => `${k}=${v}`).join(', ')}</code></td></tr>))}</tbody>
      </table>
    </div>
  </div></main>)
}
