const express = require('express')
const router = express.Router()

const useMock = () => process.env.USE_MOCK === 'true'

// GET /api/assignments
router.get('/', async (req, res) => {
  const { courseId, search } = req.query
  try {
    if (useMock()) {
      const mock = require('../mockData')
      let result = mock.assignments.map(a => ({
        ...a,
        courseName: mock.getCourseName(a.courseId),
      }))
      if (courseId) result = result.filter(a => a.courseId === Number(courseId))
      if (search) {
        const s = search.toLowerCase()
        result = result.filter(a => a.title.toLowerCase().includes(s))
      }
      return res.json(result)
    }
    const db = require('../db')
    let sql = `SELECT A.assignment_id AS "assignmentId", A.course_id AS "courseId", A.title, A.description,
               DATE_FORMAT(A.due_date, '%d-%b-%Y') AS "dueDate", A.max_marks AS "maxMarks",
               C.course_name AS "courseName"
               FROM assignments A JOIN courses C ON A.course_id = C.course_id WHERE 1=1`
    const binds = {}
    if (courseId) { sql += ` AND A.course_id = :courseId`; binds.courseId = Number(courseId) }
    if (search) { sql += ` AND UPPER(A.title) LIKE '%' || UPPER(:search) || '%'`; binds.search = search }
    sql += ` ORDER BY A.due_date`
    const result = await db.execute(sql, binds)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/assignments
router.post('/', async (req, res) => {
  const { courseId, title, description, dueDate, maxMarks } = req.body
  if (!courseId || !title || !maxMarks) return res.status(400).json({ error: 'courseId, title, maxMarks are required' })
  try {
    if (useMock()) {
      const mock = require('../mockData')
      const assignment = mock.addAssignment({
        courseId: Number(courseId),
        title,
        description,
        dueDate,
        maxMarks: Number(maxMarks),
      })
      return res.json(assignment)
    }
    const db = require('../db')
    await db.execute(
      `INSERT INTO assignments (course_id, title, description, due_date, max_marks)
       VALUES (:courseId, :title, :description, STR_TO_DATE(:dueDate, '%d-%b-%Y'), :maxMarks)`,
      {
        courseId: Number(courseId),
        title,
        description: description || null,
        dueDate: dueDate || '01-JAN-2026',
        maxMarks: Number(maxMarks),
      }
    )
    res.json({ message: 'Assignment added' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
