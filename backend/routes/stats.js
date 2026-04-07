const express = require('express')
const router = express.Router()

const useMock = () => process.env.USE_MOCK === 'true'

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    if (useMock()) {
      const mock = require('../mockData')
      return res.json({
        totalUsers: mock.users.length,
        totalCourses: mock.courses.length,
        totalAssignments: mock.assignments.length,
        totalSubmissions: mock.submissions.length,
        gradedSubmissions: mock.grades.length,
        activeEnrollments: mock.enrollments.length,
      })
    }
    const db = require('../db')
    const result = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM users) AS "totalUsers",
        (SELECT COUNT(*) FROM courses) AS "totalCourses",
        (SELECT COUNT(*) FROM assignments) AS "totalAssignments",
        (SELECT COUNT(*) FROM submissions) AS "totalSubmissions",
        (SELECT COUNT(*) FROM grades) AS "gradedSubmissions",
        (SELECT COUNT(*) FROM enrollments) AS "activeEnrollments"
    `)
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
