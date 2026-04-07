const express = require('express')
const router = express.Router()

const useMock = () => process.env.USE_MOCK === 'true'

// GET /api/users
router.get('/', async (req, res) => {
  const { role, search } = req.query
  try {
    if (useMock()) {
      const mock = require('../mockData')
      let result = [...mock.users]
      if (role) result = result.filter(u => u.role === role)
      if (search) {
        const s = search.toLowerCase()
        result = result.filter(u =>
          u.username.toLowerCase().includes(s) ||
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s)
        )
      }
      return res.json(result)
    }
    const db = require('../db')
    let sql = `SELECT user_id AS "userId", username, role, name, email FROM users WHERE 1=1`
    const binds = {}
    if (role) { sql += ` AND role = :role`; binds.role = role }
    if (search) {
      sql += ` AND (UPPER(username) LIKE '%' || UPPER(:search) || '%' OR UPPER(name) LIKE '%' || UPPER(:search) || '%' OR UPPER(email) LIKE '%' || UPPER(:search) || '%')`
      binds.search = search
    }
    sql += ` ORDER BY role, username`
    const result = await db.execute(sql, binds)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (useMock()) {
      const mock = require('../mockData')
      const user = mock.users.find(u => u.userId === id)
      if (!user) return res.status(404).json({ error: 'User not found' })
      return res.json(user)
    }
    const db = require('../db')
    const result = await db.execute(
      `SELECT user_id AS "userId", username, role, name, email FROM users WHERE user_id = :id`,
      { id }
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users
router.post('/', async (req, res) => {
  const { username, password, role, name, email } = req.body
  if (!username || !role || !name || !email) return res.status(400).json({ error: 'username, role, name, email are required' })
  try {
    if (useMock()) {
      const mock = require('../mockData')
      const user = mock.addUser({ username, password, role, name, email })
      return res.json(user)
    }
    const db = require('../db')
    await db.execute(
      `INSERT INTO users (username, password, role, name, email)
       VALUES (:username, :password, :role, :name, :email)`,
      { username, password: password || 'pass123', role, name, email },
      { autoCommit: true }
    )
    res.json({ message: 'User added' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
