const crypto = require('crypto')
const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const bcrypt = require('bcrypt')
const { saveUser, getUserByEmail } = require('../lib/store')

const router = express.Router()
const SALT_ROUNDS = 12

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const existing = await getUserByEmail(email)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const password_hash = await bcrypt.hash(password, salt)
    const user_id = crypto.randomUUID()

    await saveUser({ user_id, email, password_hash, profile_id: null, created_at: new Date() })

    res.status(201).json({ user_id, email })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Signup failed', details: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    res.json({ user_id: user.user_id, email: user.email, profile_id: user.profile_id || null })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed', details: err.message })
  }
})

module.exports = router
