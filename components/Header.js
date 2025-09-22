import Link from 'next/link'
export default function Header() {
  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <Link href="/" aria-label="AssistaForm Home">
          <img src="/logo-wordmark.svg" alt="AssistaForm" style={{height:36}} />
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/dashboard">Dashboard</Link>
          <a className="link" href="mailto:hello@example.com">Contact</a>
        </nav>
      </div>
    </header>
  )
}
