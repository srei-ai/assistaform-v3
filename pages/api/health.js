export default function handler(req, res) {
  res.status(200).json({ ok: true, name: 'assistaform', time: new Date().toISOString() })
}
