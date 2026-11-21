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

const textbookConditions = ['new', 'good', 'fair', 'poor', 'damaged']
const textbookFields = ['book_number', 'title', 'subject', 'grade', 'condition']
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function parseTextbookInput(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object.' }
  }

  const unknownFields = Object.keys(input).filter((field) => !textbookFields.includes(field))
  if (unknownFields.length) {
    return { error: `Unsupported field: ${unknownFields[0]}.` }
  }

  const data = {}
  for (const field of ['book_number', 'title', 'subject']) {
    if (!partial && (typeof input[field] !== 'string' || !input[field].trim())) {
      return { error: `${field} is required and must be a non-empty string.` }
    }
    if (Object.hasOwn(input, field)) {
      if (typeof input[field] !== 'string' || !input[field].trim()) {
        return { error: `${field} must be a non-empty string.` }
      }
      data[field] = input[field].trim()
    }
  }

  if (Object.hasOwn(input, 'grade')) {
    if (input.grade !== null && (!Number.isInteger(input.grade) || input.grade < 8 || input.grade > 12)) {
      return { error: 'grade must be an integer from 8 to 12 or null.' }
    }
    data.grade = input.grade
  }

  if (!partial || Object.hasOwn(input, 'condition')) {
    const condition = Object.hasOwn(input, 'condition') ? input.condition : 'good'
    if (!textbookConditions.includes(condition)) {
      return { error: `condition must be one of: ${textbookConditions.join(', ')}.` }
    }
    data.condition = condition
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: 'Provide at least one textbook field to update.' }
  }

  return { data }
}

function textbookError(res, error) {
  if (error?.code === '23505') {
    return res.status(409).json({ error: 'A textbook with that book_number already exists.' })
  }
  if (error?.code === '23503') {
    return res.status(409).json({ error: 'The textbook has related records and cannot be changed.' })
  }
  return fail(res, error)
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

// List textbooks, optionally filtered by search text, subject, and grade.
router.get('/textbooks', async (req, res) => {
  try {
    const { q, subject, grade } = req.query
    let query = supabase.from('textbooks').select('*')

    if (q !== undefined) {
      if (typeof q !== 'string') return res.status(400).json({ error: 'q must be text.' })
      const search = clean(q).trim()
      if (search) query = query.or(`book_number.ilike.%${search}%,title.ilike.%${search}%`)
    }

    if (subject !== undefined) {
      if (typeof subject !== 'string' || !subject.trim()) {
        return res.status(400).json({ error: 'subject must be non-empty text.' })
      }
      query = query.eq('subject', subject.trim())
    }

    if (grade !== undefined) {
      if (typeof grade !== 'string' || !/^(8|9|10|11|12)$/.test(grade)) {
        return res.status(400).json({ error: 'grade must be an integer from 8 to 12.' })
      }
      query = query.eq('grade', Number(grade))
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return fail(res, error)
    return res.json({ textbooks: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Create a textbook after validating its fields and record the change.
router.post('/textbooks', async (req, res) => {
  const { data: textbook, error: validationError } = parseTextbookInput(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const { data, error } = await supabase.from('textbooks').insert(textbook).select('*').single()
    if (error) return textbookError(res, error)

    await logActivity(req.user.id, 'create', 'textbook', data.id, textbook)
    return res.status(201).json({ textbook: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Update allowed textbook fields, returning 404 when the textbook does not exist.
router.put('/textbooks/:id', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  const { data: updates, error: validationError } = parseTextbookInput(req.body, true)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const { data, error } = await supabase
      .from('textbooks')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) return textbookError(res, error)
    if (!data) return res.status(404).json({ error: 'Textbook not found.' })

    await logActivity(req.user.id, 'update', 'textbook', id, updates)
    return res.json({ textbook: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Delete a textbook only if it has no allocation history.
router.delete('/textbooks/:id', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  try {
    const { data: textbook, error: lookupError } = await supabase
      .from('textbooks')
      .select('id, book_number')
      .eq('id', id)
      .maybeSingle()
    if (lookupError) return fail(res, lookupError)
    if (!textbook) return res.status(404).json({ error: 'Textbook not found.' })

    const { count, error: historyError } = await supabase
      .from('allocations')
      .select('id', { count: 'exact', head: true })
      .eq('textbook_id', id)
    if (historyError) return fail(res, historyError)
    if (count > 0) {
      return res.status(409).json({ error: 'Textbooks with allocation history cannot be deleted.' })
    }

    const { error } = await supabase.from('textbooks').delete().eq('id', id)
    if (error) return textbookError(res, error)

    await logActivity(req.user.id, 'delete', 'textbook', id, { book_number: textbook.book_number })
    return res.json({ message: 'Textbook deleted.' })
  } catch (error) {
    return fail(res, error)
  }
})

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
