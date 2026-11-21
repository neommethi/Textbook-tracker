import express from 'express'
import { supabase } from '../supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.use((req, res, next) => {
  req.body ??= {}
  next()
})

router.use(requireAuth, requireAdmin)

function clean(text) {
  return String(text ?? '').replace(/[(),%]/g, '')
}

function fail(res, error) {
  console.error('Admin route error:', error)
  return res.status(500).json({ error: 'Internal server error' })
}

async function logActivity(actorId, action, entity, entityId, details) {
  try {
    const { error } = await supabase.from('activity_log').insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      details,
    })

    if (error) console.error('Activity log insert failed:', error)
  } catch (error) {
    console.error('Activity log insert failed:', error)
  }
}

// Return counts for learners, textbooks, and currently outstanding allocations.
router.get('/summary', async (req, res) => {
  try {
    const [learners, textbooks, outstanding] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('textbooks').select('id', { count: 'exact', head: true }),
      supabase.from('allocations').select('id', { count: 'exact', head: true }).is('returned_at', null),
    ])

    const error = learners.error || textbooks.error || outstanding.error
    if (error) return fail(res, error)

    return res.json({
      learners: learners.count,
      textbooks: textbooks.count,
      outstanding: outstanding.count,
    })
  } catch (error) {
    return fail(res, error)
  }
})

export default router
