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

const textbookFields = ['title', 'subject', 'grade']
const learnerFields = ['name', 'grade', 'class']
const learnerColumns = 'id, name, email, grade, class, created_at'
const accountColumns = 'id, name, email, role, grade, class, created_at'
const allocationSelect = 'id, allocation_number, textbook_id, learner_id, allocated_at, returned_at, textbook:textbooks!textbook_allocations_textbook_id_fkey(title, subject, grade)'
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
  for (const field of ['title', 'subject']) {
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

  if (!partial && !Object.hasOwn(input, 'grade')) {
    return { error: 'grade is required and must be an integer from 8 to 12.' }
  }
  if (Object.hasOwn(input, 'grade')) {
    if (!Number.isInteger(input.grade) || input.grade < 8 || input.grade > 12) {
      return { error: 'grade must be an integer from 8 to 12.' }
    }
    data.grade = input.grade
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

function parseAccountUpdate(input) {
  const fields = ['name', 'email', 'grade', 'class']
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object.' }
  }

  const unknownFields = Object.keys(input).filter((field) => !fields.includes(field))
  if (unknownFields.length) {
    return { error: `Unsupported field: ${unknownFields[0]}.` }
  }

  const updates = {}
  if (Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || !input.name.trim()) {
      return { error: 'name must be non-empty text.' }
    }
    updates.name = input.name.trim()
  }

  if (Object.hasOwn(input, 'email')) {
    if (typeof input.email !== 'string') {
      return { error: 'email must be valid text.' }
    }
    const email = input.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'email must be a valid email address.' }
    }
    updates.email = email
  }

  if (Object.hasOwn(input, 'grade')) {
    if (input.grade !== null && (!Number.isInteger(input.grade) || input.grade < 8 || input.grade > 12)) {
      return { error: 'grade must be an integer from 8 to 12 or null.' }
    }
    updates.grade = input.grade
  }

  if (Object.hasOwn(input, 'class')) {
    if (input.class !== null && (typeof input.class !== 'string' || !input.class.trim())) {
      return { error: 'class must be non-empty text or null.' }
    }
    updates.class = input.class === null ? null : input.class.trim()
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'Provide at least one account field to update.' }
  }

  return { data: updates }
}

function parseAllocationInput(input) {
  const fields = ['textbook_id', 'learner_id']
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object.' }
  }

  const unknownFields = Object.keys(input).filter((field) => !fields.includes(field))
  if (unknownFields.length) {
    return { error: `Unsupported field: ${unknownFields[0]}.` }
  }
  if (typeof input.textbook_id !== 'string' || !uuidPattern.test(input.textbook_id)) {
    return { error: 'textbook_id must be a valid UUID.' }
  }
  if (typeof input.learner_id !== 'string' || !input.learner_id.trim()) {
    return { error: 'learner_id is required and must be non-empty text.' }
  }

  return {
    data: {
      textbook_id: input.textbook_id,
      learner_id: input.learner_id.trim(),
    },
  }
}

function textbookError(res, error) {
  if (error?.code === '23503') {
    return res.status(409).json({ error: 'The textbook has related records and cannot be changed.' })
  }
  return fail(res, error)
}

function getAllocationResult(data) {
  return Array.isArray(data) ? data[0] : data
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

// List registered accounts without exposing authentication credentials.
router.get('/accounts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(accountColumns)
      .order('name', { ascending: true })
    if (error) return fail(res, error)
    return res.json({ accounts: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Update profile fields from the account settings page.
router.put('/accounts/:id', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  const { data: updates, error: validationError } = parseAccountUpdate(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select(accountColumns)
      .maybeSingle()
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists.' })
    }
    if (error) return fail(res, error)
    if (!data) return res.status(404).json({ error: 'Account not found.' })

    await logActivity(req.user.id, 'update', 'account', id, updates)
    return res.json({ account: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Change an account role while preventing self-demotion and removal of the final admin.
router.patch('/accounts/:id/role', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })
  if (!req.body || !['admin', 'user'].includes(req.body.role)) {
    return res.status(400).json({ error: 'role must be admin or user.' })
  }

  try {
    const { data: target, error: lookupError } = await supabase
      .from('users')
      .select(accountColumns)
      .eq('id', id)
      .maybeSingle()
    if (lookupError) return fail(res, lookupError)
    if (!target) return res.status(404).json({ error: 'Account not found.' })
    if (target.role === req.body.role) return res.json({ account: target })
    if (id === req.user.id) {
      return res.status(409).json({ error: 'You cannot change your own admin access.' })
    }

    if (target.role === 'admin' && req.body.role === 'user') {
      const { count, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
      if (countError) return fail(res, countError)
      if (count <= 1) {
        return res.status(409).json({ error: 'The final admin account cannot be demoted.' })
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role: req.body.role })
      .eq('id', id)
      .select(accountColumns)
      .maybeSingle()
    if (error) return fail(res, error)
    if (!data) return res.status(404).json({ error: 'Account not found.' })

    await logActivity(req.user.id, 'update', 'account_role', id, {
      role: req.body.role,
    })
    return res.json({ account: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Delete accounts only when no allocation history depends on their learner identity.
router.delete('/accounts/:id', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  try {
    const { data: account, error: lookupError } = await supabase
      .from('users')
      .select(accountColumns)
      .eq('id', id)
      .maybeSingle()
    if (lookupError) return fail(res, lookupError)
    if (!account) return res.status(404).json({ error: 'Account not found.' })
    if (id === req.user.id) {
      return res.status(409).json({ error: 'You cannot delete your own account.' })
    }

    if (account.role === 'admin') {
      const { count, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
      if (countError) return fail(res, countError)
      if (count <= 1) {
        return res.status(409).json({ error: 'The final admin account cannot be deleted.' })
      }
    }

    const { count, error: historyError } = await supabase
      .from('textbook_allocations')
      .select('id', { count: 'exact', head: true })
      .eq('learner_id', id)
    if (historyError) return fail(res, historyError)
    if (count > 0) {
      return res.status(409).json({
        error: 'Accounts with textbook allocation history cannot be deleted.',
      })
    }

    const { data: deleted, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (error?.code === '23503') {
      return res.status(409).json({ error: 'The account has related records and cannot be deleted.' })
    }
    if (error) return fail(res, error)
    if (!deleted) return res.status(404).json({ error: 'Account not found.' })

    await logActivity(req.user.id, 'delete', 'account', id, {
      name: account.name,
      email: account.email,
      role: account.role,
    })
    return res.json({ message: 'Account deleted.' })
  } catch (error) {
    return fail(res, error)
  }
})

// List textbooks by their current schema fields; no allocation availability filter is applied.
router.get('/textbooks', async (req, res) => {
  try {
    const { q, subject, grade } = req.query
    let query = supabase.from('textbooks').select('id, title, subject, grade, created_at')

    if (q !== undefined) {
      if (typeof q !== 'string') return res.status(400).json({ error: 'q must be text.' })
      const search = clean(q).trim()
      if (search) query = query.ilike('title', `%${search}%`)
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

// Return the configured subject list.
router.get('/subjects', async (req, res) => {
  try {
    const { data, error } = await supabase.from('subjects').select('name').order('name')
    if (error) return fail(res, error)

    const subjects = data.map(({ name }) => ({ id: name, name }))
    return res.json({ subjects })
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
      .select('id, title, subject')
      .eq('id', id)
      .maybeSingle()
    if (lookupError) return fail(res, lookupError)
    if (!textbook) return res.status(404).json({ error: 'Textbook not found.' })

    const { count, error: historyError } = await supabase
      .from('textbook_allocations')
      .select('id', { count: 'exact', head: true })
      .eq('textbook_id', id)
    if (historyError) return fail(res, historyError)
    if (count > 0) {
      return res.status(409).json({ error: 'Textbooks with allocation history cannot be deleted.' })
    }

    const { error } = await supabase.from('textbooks').delete().eq('id', id)
    if (error) return textbookError(res, error)

    await logActivity(req.user.id, 'delete', 'textbook', id, {
      title: textbook.title,
      subject: textbook.subject,
    })
    return res.json({ message: 'Textbook deleted.' })
  } catch (error) {
    return fail(res, error)
  }
})

// List learners; allocation history is loaded separately from the allocations endpoint.
router.get('/learners', async (req, res) => {
  try {
    const { q, grade, class: learnerClass } = req.query
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

    const { data: learners, error: learnerError } = await query.order('name', { ascending: true })
    if (learnerError) return fail(res, learnerError)

    return res.json({ learners })
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
      .from('textbook_allocations')
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

// List allocation history with the related textbook title, subject, and grade.
router.get('/allocations', async (req, res) => {
  try {
    const { learnerId, subject, grade, outstanding } = req.query
    let query = supabase.from('textbook_allocations').select(allocationSelect)

    if (learnerId !== undefined) {
      if (typeof learnerId !== 'string' || !learnerId.trim()) {
        return res.status(400).json({ error: 'learnerId must be non-empty text.' })
      }
      query = query.eq('learner_id', learnerId.trim())
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
      query = query.eq('textbook.grade', Number(grade))
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

    const { data, error } = await query.order('allocated_at', { ascending: false })
    if (error) return fail(res, error)
    return res.json({ allocations: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Use the database function to allocate by textbook ID and return its allocation number.
router.post('/allocations', async (req, res) => {
  const { data: input, error: validationError } = parseAllocationInput(req.body)
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const { data, error } = await supabase.rpc('allocate_textbook', {
      p_textbook_id: input.textbook_id,
      p_learner_id: input.learner_id,
    })
    if (error) return fail(res, error)

    const allocation = getAllocationResult(data)
    if (!allocation?.allocation_number) {
      console.error('Allocation RPC response did not include allocation_number.')
      return res.status(502).json({
        error: 'The allocation was created, but no allocation number was returned.',
      })
    }

    const allocationId = allocation.allocation_id ?? allocation.id ?? null
    await logActivity(req.user.id, 'issue', 'allocation', allocationId, {
      textbook_id: input.textbook_id,
      learner_id: input.learner_id,
      allocation_number: allocation.allocation_number,
    })

    return res.status(201).json({ allocation })
  } catch (error) {
    return fail(res, error)
  }
})

// Record the return timestamp while retaining the allocation history.
router.put('/allocations/:id/return', async (req, res) => {
  const { id } = req.params
  if (!uuidPattern.test(id)) return res.status(400).json({ error: 'id must be a valid UUID.' })

  try {
    const { data: allocation, error: lookupError } = await supabase
      .from('textbook_allocations')
      .select('id, allocation_number, returned_at')
      .eq('id', id)
      .maybeSingle()
    if (lookupError) return fail(res, lookupError)
    if (!allocation) return res.status(404).json({ error: 'Allocation not found.' })
    if (allocation.returned_at !== null) {
      return res.status(409).json({ error: 'This allocation has already been returned.' })
    }

    const returnedAt = new Date().toISOString()
    const { data: updated, error: updateError } = await supabase
      .from('textbook_allocations')
      .update({ returned_at: returnedAt })
      .eq('id', id)
      .is('returned_at', null)
      .select('id')
      .maybeSingle()
    if (updateError) return fail(res, updateError)
    if (!updated) {
      const { data: current, error: currentError } = await supabase
        .from('textbook_allocations')
        .select('id, returned_at')
        .eq('id', id)
        .maybeSingle()
      if (currentError) return fail(res, currentError)
      if (!current) return res.status(404).json({ error: 'Allocation not found.' })
      return res.status(409).json({ error: 'This allocation has already been returned.' })
    }

    await logActivity(req.user.id, 'return', 'allocation', id, {
      allocation_number: allocation.allocation_number,
      returned_at: returnedAt,
    })

    const { data, error } = await supabase
      .from('textbook_allocations')
      .select(allocationSelect)
      .eq('id', id)
      .single()
    if (error) return fail(res, error)
    return res.json({ allocation: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Return dashboard counts for learners, textbooks, and allocation history.
router.get('/summary', async (req, res) => {
  try {
    const [learners, textbooks, outstanding, returned, subjects] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('textbooks').select('id', { count: 'exact', head: true }),
      supabase.from('textbook_allocations').select('id', { count: 'exact', head: true }).is('returned_at', null),
      supabase.from('textbook_allocations').select('id', { count: 'exact', head: true }).not('returned_at', 'is', null),
      supabase.from('subjects').select('name', { count: 'exact', head: true }),
    ])

    const error = learners.error || textbooks.error || outstanding.error || returned.error || subjects.error
    if (error) return fail(res, error)

    return res.json({
      learners: learners.count,
      textbooks: textbooks.count,
      outstanding: outstanding.count,
      returned: returned.count,
      subjects: subjects.count,
    })
  } catch (error) {
    return fail(res, error)
  }
})

export default router
