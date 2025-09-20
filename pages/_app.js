import '../styles/globals.css'
import Header from '../components/Header'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <div className="container">
        <Component {...pageProps} />
      </div>
      <footer className="footer">
        <span className="small">© {new Date().getFullYear()} AssistaForm · <a className="link" href="#">Privacy</a></span>
      </footer>
    </>
  )
}
