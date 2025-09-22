import Link from 'next/link'
export default function Home() {
  return (
    <main>
      <div className="card" style={{padding:'24px 24px 28px'}}>
        <h1 style={{margin:'0 0 6px'}}>AssistaForm</h1>
        <p className="small" style={{margin:0}}>AI form concierge — create a form, share a link, guide users step-by-step.</p>
        <hr className="sep" />
        <div className="row">
          <Link href="/dashboard" className="btn btn-primary">Go to dashboard →</Link>
          <a className="btn btn-outline" href="/api/health">Health check</a>
        </div>
      </div>
    </main>
  )
}
