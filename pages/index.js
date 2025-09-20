import Link from 'next/link'

export default function Home() {
  return (
    <main style={{padding:24}}>
      <img src="/logo-wordmark.svg" alt="AssistaForm" style={{height:48, marginBottom:16}} />
      <p>AI form concierge — create a form, share a link, guide users step-by-step.</p>
      <p><Link href="/dashboard">Go to dashboard →</Link></p>
    </main>
  )
}
