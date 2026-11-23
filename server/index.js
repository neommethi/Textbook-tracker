
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { supabase } from './supabase.js'

import authRoutes from './routes/auth.js'
import adminRoutes from './routes/adminRoutes.js'
import learnerRoutes from './routes/learnerRoutes.js'
import learnerDashboardRoutes from './routes/learner.js'

import { requireAuth, requireAdmin } from './middleware/auth.js'

const app = express()

app.use(cors())
app.use(express.json())

// Authentication
app.use('/api/auth', authRoutes)

// Admin routes
app.use('/api/admin', adminRoutes)

// Existing learner routes
app.use('/api/learner', learnerRoutes)

// Learner dashboard integration
app.use('/api/learner', learnerDashboardRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Admin access check
app.get('/api/admin/ping', requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, message: 'Admin access granted' })
})

// Database connection test
app.get('/api/test-db', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ ok: true, rows: data.length })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
