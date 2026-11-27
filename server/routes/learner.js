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

router.get('/me', requireAuth, requireLearner, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, grade, class')
      .eq('id', req.user.id)
      .single()

    if (error) {
      console.error('Failed to retrieve learner profile:', error)
      return res.status(500).json({ error: 'Unable to retrieve your profile.' })
    }

    return res.json({ user: data })
  } catch (error) {
    console.error('Failed to retrieve learner profile:', error)
    return res.status(500).json({ error: 'Unable to retrieve your profile.' })
  }
})

router.put('/me', requireAuth, requireLearner, async (req, res) => {
  const input = req.body
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return res.status(400).json({ error: 'Request body must be an object.' })
  }

  const allowedFields = ['name', 'grade', 'class']
  const unknownFields = Object.keys(input).filter((field) => !allowedFields.includes(field))
  if (unknownFields.length) {
    return res.status(400).json({ error: `Unsupported field: ${unknownFields[0]}.` })
  }

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!name) {
    return res.status(400).json({ error: 'name must be a non-empty string.' })
  }
  if (!Number.isInteger(input.grade) || input.grade < 8 || input.grade > 12) {
    return res.status(400).json({ error: 'grade must be an integer from 8 to 12.' })
  }
  if (
    input.class !== null &&
    typeof input.class !== 'string'
  ) {
    return res.status(400).json({ error: 'class must be a string or null.' })
  }

  const learnerClass = typeof input.class === 'string' ? input.class.trim() || null : null
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, grade: input.grade, class: learnerClass })
      .eq('id', req.user.id)
      .select('id, name, email, grade, class')
      .single()

    if (error) {
      console.error('Failed to update learner profile:', error)
      return res.status(500).json({ error: 'Unable to update your profile.' })
    }

    return res.json({ user: data })
  } catch (error) {
    console.error('Failed to update learner profile:', error)
    return res.status(500).json({ error: 'Unable to update your profile.' })
  }
})

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
