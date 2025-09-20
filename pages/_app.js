export default function App({ Component, pageProps }) {
  return (
    <div style={{fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'}}>
      <Component {...pageProps} />
    </div>
  )
}
