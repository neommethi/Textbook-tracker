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
const learnerFields = ['name', 'grade', 'class']
const learnerColumns = 'id, name, email, grade, class, created_at'
const allocationConditions = ['new', 'good', 'fair', 'poor', 'damaged']
const allocationStatuses = ['issued', 'returned', 'lost', 'found', 'damaged']
const allocationSelect = '*, textbook:textbooks!allocations_textbook_id_fkey!inner(book_number, title, subject, grade, condition), learner:users!allocations_learner_id_fkey!inner(id, name, grade, class)'
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

function parseLearnerUpdate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object.' }
  }

  const unknownFields = Object.keys(input).filter((field) => !learnerFields.includes(field))
  if (unknownFields.length) {
    return { error: `Unsupported field: ${unknownFields[0]}.` }
  }

  const updates = {}
  if (Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || !input.name.trim()) {
      return { error: 'name must be a non-empty string.' }
    }
    updates.name = input.name.trim()
  }

  if (Object.hasOwn(input, 'grade')) {
    if (input.grade !== null && (!Number.isInteger(input.grade) || input.grade < 8 || input.grade > 12)) {
      return { error: 'grade must be an integer from 8 to 12 or null.' }
    }
    updates.grade = input.grade
  }

  if (Object.hasOwn(input, 'class')) {
    if (input.class !== null && (typeof input.class !== 'string' || !input.class.trim())) {
      return { error: 'class must be a non-empty string or null.' }
    }
    updates.class = input.class === null ? null : input.class.trim()
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'Provide at least one learner field to update.' }
  }

  return { data: updates }
}

function parseAllocationInput(input) {
  const fields = ['book_number', 'learner_id', 'condition_issued']
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object.' }
  }

  const unknownFields = Object.keys(input).filter((field) => !fields.includes(field))
  if (unknownFields.length) {
    return { error: `Unsupported field: ${unknownFields[0]}.` }
  }
  if (typeof input.book_number !== 'string' || !input.book_number.trim()) {
    return { error: 'book_number is required and must be a non-empty string.' }
  }
  if (typeof input.learner_id !== 'string' || !uuidPattern.test(input.learner_id)) {
    return { error: 'learner_id must be a valid UUID.' }
  }

  const conditionIssued = Object.hasOwn(input, 'condition_issued') ? input.condition_issued : 'good'
  if (!allocationConditions.includes(conditionIssued)) {
    return { error: `condition_issued must be one of: ${allocationConditions.join(', ')}.` }
  }

  return {
    data: {
      book_number: input.book_number.trim(),
      learner_id: input.learner_id,
      condition_issued: conditionIssued,
    },
  }
}

function parseAllocationReturnInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object.' }
  }
  const unknownFields = Object.keys(input).filter((field) => field !== 'condition_returned')
  if (unknownFields.length) {
    return { error: `Unsupported field: ${unknownFields[0]}.` }
  }

  const conditionReturned = Object.hasOwn(input, 'condition_returned')
    ? input.condition_returned
    : 'good'
  if (!allocationConditions.includes(conditionReturned)) {
    return { error: `condition_returned must be one of: ${allocationConditions.join(', ')}.` }
  }

  return { data: { condition_returned: conditionReturned } }
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

function allocationError(res, error) {
  if (error?.code === '23505') {
    return res.status(409).json({ error: 'This book is already issued to a learner.' })
  }
  if (error?.code === '23503') {
    return res.status(409).json({ error: 'The learner or textbook is no longer available.' })
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

// List learners with only currently outstanding allocations and textbook details.
router.get('/learners', async (req, res) => {
  try {
    const { q, grade, class: learnerClass, outstanding } = req.query
    let query = supabase.from('users').select(learnerColumns).eq('role', 'user')

    if (q !== undefined) {
      if (typeof q !== 'string') return res.status(400).json({ error: 'q must be text.' })
      const search = clean(q).trim()
      if (search) query = query.ilike('name', `%${search}%`)
    }

    if (grade !== undefined) {
      if (typeof grade !== 'string' || !/^(8|9|10|11|12)$/.test(grade)) {
        return res.status(400).json({ error: 'grade must be an integer from 8 to 12.' })
      }
      query = query.eq('grade', Number(grade))
    }

    if (learnerClass !== undefined) {
      if (typeof learnerClass !== 'string' || !learnerClass.trim()) {
        return res.status(400).json({ error: 'class must be non-empty text.' })
      }
      query = query.eq('class', learnerClass.trim())
    }

    if (outstanding !== undefined && !['true', 'false'].includes(outstanding)) {
      return res.status(400).json({ error: 'outstanding must be true or false.' })
    }

    const { data: learners, error: learnerError } = await query.order('name', { ascending: true })
    if (learnerError) return fail(res, learnerError)

    const allocationsByLearner = new Map()
    if (learners.length) {
      const { data: allocations, error: allocationError } = await supabase
        .from('allocations')
        .select('id, learner_id, textbook_id, issued_at, textbook:textbooks!allocations_textbook_id_fkey(book_number, title, subject)')
        .in('learner_id', learners.map((learner) => learner.id))
        .is('returned_at', null)
      if (allocationError) return fail(res, allocationError)

      for (const allocation of allocations) {
        const learnerAllocations = allocationsByLearner.get(allocation.learner_id) || []
        learnerAllocations.push({
          id: allocation.id,
          textbook_id: allocation.textbook_id,
          issued_at: allocation.issued_at,
          textbook: allocation.textbook,
        })
        allocationsByLearner.set(allocation.learner_id, learnerAllocations)
      }
    }

    const results = learners
      .map((learner) => ({
        ...learner,
        outstanding: allocationsByLearner.get(learner.id) || [],
      }))
      .filter((learner) => outstanding !== 'true' || learner.outstanding.length > 0)

    return res.json({ learners: results })
  } catch (error) {
    return fail(res, error)
  }
})

// Update allowed learner fields without exposing or changing account credentials.
router.put('/learners/:id', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  const { data: updates, error: validationError } = parseLearnerUpdate(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('role', 'user')
      .select(learnerColumns)
      .maybeSingle()
    if (error) return fail(res, error)
    if (!data) return res.status(404).json({ error: 'Learner not found.' })

    await logActivity(req.user.id, 'update', 'learner', id, updates)
    return res.json({ learner: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Delete a learner only when no allocation history refers to them.
router.delete('/learners/:id', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  try {
    const { data: learner, error: lookupError } = await supabase
      .from('users')
      .select(learnerColumns)
      .eq('id', id)
      .eq('role', 'user')
      .maybeSingle()
    if (lookupError) return fail(res, lookupError)
    if (!learner) return res.status(404).json({ error: 'Learner not found.' })

    const { count, error: historyError } = await supabase
      .from('allocations')
      .select('id', { count: 'exact', head: true })
      .eq('learner_id', id)
    if (historyError) return fail(res, historyError)
    if (count > 0) {
      return res.status(409).json({ error: 'Learners with allocation history cannot be deleted.' })
    }

    const { data: deleted, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'user')
      .select('id')
      .maybeSingle()
    if (error?.code === '23503') {
      return res.status(409).json({ error: 'The learner has related records and cannot be deleted.' })
    }
    if (error) return fail(res, error)
    if (!deleted) return res.status(404).json({ error: 'Learner not found.' })

    await logActivity(req.user.id, 'delete', 'learner', id, { name: learner.name })
    return res.status(200).json({ message: 'Learner deleted.' })
  } catch (error) {
    return fail(res, error)
  }
})

// List allocations with related textbook and learner details and optional filters.
router.get('/allocations', async (req, res) => {
  try {
    const { learner, bookNumber, subject, grade, status, outstanding } = req.query
    let query = supabase.from('allocations').select(allocationSelect)

    if (learner !== undefined) {
      if (typeof learner !== 'string') return res.status(400).json({ error: 'learner must be text.' })
      const search = clean(learner).trim()
      if (search) query = query.ilike('learner.name', `%${search}%`)
    }

    if (bookNumber !== undefined) {
      if (typeof bookNumber !== 'string') {
        return res.status(400).json({ error: 'bookNumber must be text.' })
      }
      const search = clean(bookNumber).trim()
      if (search) query = query.ilike('textbook.book_number', `%${search}%`)
    }

    if (subject !== undefined) {
      if (typeof subject !== 'string' || !subject.trim()) {
        return res.status(400).json({ error: 'subject must be non-empty text.' })
      }
      query = query.eq('textbook.subject', subject.trim())
    }

    if (grade !== undefined) {
      if (typeof grade !== 'string' || !/^(8|9|10|11|12)$/.test(grade)) {
        return res.status(400).json({ error: 'grade must be an integer from 8 to 12.' })
      }
      query = query.eq('learner.grade', Number(grade))
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || !allocationStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${allocationStatuses.join(', ')}.` })
      }
      query = query.eq('status', status)
    }

    if (outstanding !== undefined) {
      if (outstanding === 'true') {
        query = query.is('returned_at', null)
      } else if (outstanding === 'false') {
        query = query.not('returned_at', 'is', null)
      } else {
        return res.status(400).json({ error: 'outstanding must be true or false.' })
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return fail(res, error)
    return res.json({ allocations: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Issue a textbook to a learner and record the admin who issued it.
router.post('/allocations', async (req, res) => {
  const { data: input, error: validationError } = parseAllocationInput(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const { data: textbook, error: textbookError } = await supabase
      .from('textbooks')
      .select('id')
      .eq('book_number', input.book_number)
      .maybeSingle()
    if (textbookError) return fail(res, textbookError)
    if (!textbook) return res.status(404).json({ error: 'Textbook not found.' })

    const { data: learner, error: learnerError } = await supabase
      .from('users')
      .select('id')
      .eq('id', input.learner_id)
      .eq('role', 'user')
      .maybeSingle()
    if (learnerError) return fail(res, learnerError)
    if (!learner) return res.status(404).json({ error: 'Learner not found.' })

    const { data, error } = await supabase
      .from('allocations')
      .insert({
        textbook_id: textbook.id,
        learner_id: learner.id,
        issued_by: req.user.id,
        condition_issued: input.condition_issued,
      })
      .select(allocationSelect)
      .single()
    if (error) return allocationError(res, error)

    await logActivity(req.user.id, 'issue', 'allocation', data.id, {
      textbook_id: textbook.id,
      learner_id: learner.id,
      condition_issued: input.condition_issued,
    })
    return res.status(201).json({ allocation: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Mark an outstanding allocation as returned and update the textbook condition.
router.put('/allocations/:id/return', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  const { data: input, error: validationError } = parseAllocationReturnInput(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const { data: allocation, error: lookupError } = await supabase
      .from('allocations')
      .select('id, textbook_id, status, fee_status, returned_at')
      .eq('id', id)
      .maybeSingle()
    if (lookupError) return fail(res, lookupError)
    if (!allocation) return res.status(404).json({ error: 'Allocation not found.' })
    if (allocation.returned_at !== null) {
      return res.status(409).json({ error: 'This allocation has already been returned.' })
    }

    const returnedAt = new Date().toISOString()
    const status = allocation.status === 'lost' ? 'found' : 'returned'
    const feeStatus = allocation.fee_status === 'paid'
      ? 'refund_due'
      : allocation.fee_status === 'owed'
        ? 'none'
        : allocation.fee_status
    const { data: updated, error: updateError } = await supabase
      .from('allocations')
      .update({
        returned_at: returnedAt,
        returned_by: req.user.id,
        condition_returned: input.condition_returned,
        status,
        fee_status: feeStatus,
      })
      .eq('id', id)
      .is('returned_at', null)
      .select('id')
      .maybeSingle()
    if (updateError) return allocationError(res, updateError)
    if (!updated) {
      const { data: current, error: currentError } = await supabase
        .from('allocations')
        .select('id, returned_at')
        .eq('id', id)
        .maybeSingle()
      if (currentError) return fail(res, currentError)
      if (!current) return res.status(404).json({ error: 'Allocation not found.' })
      return res.status(409).json({ error: 'This allocation has already been returned.' })
    }

    await logActivity(req.user.id, 'return', 'allocation', id, {
      returned_at: returnedAt,
      condition_returned: input.condition_returned,
      status,
      fee_status: feeStatus,
    })

    const { data: updatedTextbook, error: textbookUpdateError } = await supabase
      .from('textbooks')
      .update({ condition: input.condition_returned })
      .eq('id', allocation.textbook_id)
      .select('id')
      .maybeSingle()
    if (textbookUpdateError) return fail(res, textbookUpdateError)
    if (!updatedTextbook) return fail(res, new Error('Textbook for allocation was not found.'))

    await logActivity(req.user.id, 'update', 'textbook', allocation.textbook_id, {
      condition: input.condition_returned,
    })

    const { data, error } = await supabase
      .from('allocations')
      .select(allocationSelect)
      .eq('id', id)
      .single()
    if (error) return fail(res, error)
    return res.json({ allocation: data })
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
