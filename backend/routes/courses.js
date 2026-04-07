const express = require('express')
const router = express.Router()

const useMock = () => process.env.USE_MOCK === 'true'

// GET /api/courses
router.get('/', async (req, res) => {
  const { search } = req.query
  try {
    if (useMock()) {
      const mock = require('../mockData')
      let result = mock.courses.map(c => ({
        ...c,
        instructorName: mock.getUserName(c.instructorId),
      }))
      if (search) {
        const s = search.toLowerCase()
        result = result.filter(c =>
          c.courseName.toLowerCase().includes(s) ||
          c.courseCode.toLowerCase().includes(s) ||
          c.instructorName.toLowerCase().includes(s)
        )
      }
      return res.json(result)
    }
    const db = require('../db')
    let sql = `SELECT C.course_id AS "courseId", C.course_name AS "courseName", C.course_code AS "courseCode",
               C.instructor_id AS "instructorId", U.name AS "instructorName"
               FROM courses C JOIN users U ON C.instructor_id = U.user_id WHERE 1=1`
    const binds = {}
    if (search) {
      sql += ` AND (UPPER(C.course_name) LIKE '%' || UPPER(:search) || '%' OR UPPER(C.course_code) LIKE '%' || UPPER(:search) || '%' OR UPPER(U.name) LIKE '%' || UPPER(:search) || '%')`
      binds.search = search
    }
    sql += ` ORDER BY C.course_code`
    const result = await db.execute(sql, binds)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/courses
router.post('/', async (req, res) => {
  const { courseName, courseCode, instructorId } = req.body
  if (!courseName || !courseCode || !instructorId) return res.status(400).json({ error: 'courseName, courseCode, instructorId are required' })
  try {
    if (useMock()) {
      const mock = require('../mockData')
      const course = mock.addCourse({ courseName, courseCode, instructorId: Number(instructorId) })
      return res.json(course)
    }
    const db = require('../db')
    await db.execute(
      `INSERT INTO courses (course_name, course_code, instructor_id)
       VALUES (:courseName, :courseCode, :instructorId)`,
      { courseName, courseCode, instructorId: Number(instructorId) },
      { autoCommit: true }
    )
    res.json({ message: 'Course added' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
