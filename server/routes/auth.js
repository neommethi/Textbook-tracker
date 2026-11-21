import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../supabase.js'

const router = express.Router()

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  const cleanEmail = email.trim().toLowerCase()

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle()

  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('users')
    .insert({ name: name.trim(), email: cleanEmail, password_hash, role: 'user' })
    .select('id, name, email, role')
    .single()

  if (error) {
    return res.status(500).json({ error: 'Could not create account.' })
  }

  res.status(201).json({ user: data })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  const valid = user && (await bcrypt.compare(password, user.password_hash))

  if (!valid) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
})

export default router