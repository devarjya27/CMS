const express = require('express')
const router = express.Router()

const useMock = () => process.env.USE_MOCK === 'true'

// GET /api/enrollments
router.get('/', async (req, res) => {
  const { courseId, studentId } = req.query
  try {
    if (useMock()) {
      const mock = require('../mockData')
      let result = mock.enrollments.map(e => ({
        ...e,
        courseName: mock.getCourseName(e.courseId),
        studentName: mock.getUserName(e.studentId),
      }))
      if (courseId) result = result.filter(e => e.courseId === Number(courseId))
      if (studentId) result = result.filter(e => e.studentId === Number(studentId))
      return res.json(result)
    }
    const db = require('../db')
    let sql = `SELECT E.enrollment_id AS "enrollmentId", E.course_id AS "courseId", E.student_id AS "studentId",
               DATE_FORMAT(E.enrollment_date, '%d-%b-%Y') AS "enrollmentDate",
               C.course_name AS "courseName", U.name AS "studentName"
               FROM enrollments E
               JOIN courses C ON E.course_id = C.course_id
               JOIN users U ON E.student_id = U.user_id
               WHERE 1=1`
    const binds = {}
    if (courseId) { sql += ` AND E.course_id = :courseId`; binds.courseId = Number(courseId) }
    if (studentId) { sql += ` AND E.student_id = :studentId`; binds.studentId = Number(studentId) }
    sql += ` ORDER BY E.enrollment_id DESC`
    const result = await db.execute(sql, binds)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/enrollments
router.post('/', async (req, res) => {
  const { courseId, studentId } = req.body
  if (!courseId || !studentId) return res.status(400).json({ error: 'courseId and studentId are required' })
  try {
    if (useMock()) {
      const mock = require('../mockData')
      const enrollment = mock.enrollStudent(Number(courseId), Number(studentId))
      return res.json(enrollment)
    }
    const db = require('../db')
    await db.execute(
      `CALL enroll_student(:courseId, :studentId)`,
      { courseId: Number(courseId), studentId: Number(studentId) },
    )
    res.json({ message: 'Student enrolled' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
