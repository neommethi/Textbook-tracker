import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { supabase } from './supabase.js'
import authRoutes from './routes/auth.js'
import { requireAuth, requireAdmin } from './middleware/auth.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
app.get('/api/admin/ping', requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, message: 'Admin access granted' })
})

app.get('/api/test-db', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').limit(1)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true, rows: data.length })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})