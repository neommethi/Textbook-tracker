import jwt from 'jsonwebtoken'
import { supabase } from '../supabase.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Please log in.' })
  }

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
  }
  if (!payload || typeof payload !== 'object' || typeof payload.id !== 'string') {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', payload.id)
      .maybeSingle()
    if (error) {
      console.error('Session account lookup failed:', error)
      return res.status(500).json({ error: 'Could not verify the account session.' })
    }
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists. Please log in again.' })
    }

    req.user = { id: user.id, role: user.role }
    return next()
  } catch (error) {
    console.error('Session account lookup failed:', error)
    return res.status(500).json({ error: 'Could not verify the account session.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only.' })
  }
  next()
}