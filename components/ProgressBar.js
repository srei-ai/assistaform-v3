export default function ProgressBar({ current = 0, total = 1 }) {
  const safeTotal = Math.max(1, total)
  const pct = Math.round((Math.min(current, safeTotal) / safeTotal) * 100)
  return (
    <div>
      <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
        <div className="small" aria-live="polite">Step {Math.min(current, safeTotal)} of {safeTotal}</div>
        <div className="small">{pct}%</div>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="progress-bar" style={{width: `${pct}%`}} />
      </div>
    </div>
  )
}
