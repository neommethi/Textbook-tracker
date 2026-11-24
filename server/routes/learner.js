import express from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

function requireLearner(req, res, next) {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: 'Learner access only.' })
  }
  next()
}

router.get('/me/textbooks', requireAuth, requireLearner, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('textbook_allocations')
      .select(`
        id,
        allocation_number,
        textbook_id,
        learner_id,
        allocated_at,
        returned_at,
        textbook:textbooks!textbook_allocations_textbook_id_fkey(title, subject, grade)
      `)
      .eq('learner_id', req.user.id)
      .order('allocated_at', { ascending: false })

    if (error) {
      console.error('Failed to retrieve learner textbook allocations:', error)
      return res.status(500).json({ error: 'Unable to retrieve textbook allocations.' })
    }

    const textbooks = data.map(allocation => ({
      id: allocation.id,
      allocation_number: allocation.allocation_number,
      textbook_id: allocation.textbook_id,
      title: allocation.textbook?.title ?? null,
      subject: allocation.textbook?.subject ?? null,
      grade: allocation.textbook?.grade ?? null,
      allocated_at: allocation.allocated_at,
      returned_at: allocation.returned_at,
    }))

    return res.json({ textbooks })
  } catch (error) {
    console.error('Failed to retrieve learner textbook allocations:', error)
    return res.status(500).json({ error: 'Unable to retrieve textbook allocations.' })
  }
})

export default router
