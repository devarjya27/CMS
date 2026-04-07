const express = require('express')
const router = express.Router()

const useMock = () => process.env.USE_MOCK === 'true'

// GET /api/submissions
router.get('/', async (req, res) => {
  const { assignmentId, studentId } = req.query
  try {
    if (useMock()) {
      const mock = require('../mockData')
      let result = mock.submissions.map(s => {
        const assignment = mock.assignments.find(a => a.assignmentId === s.assignmentId)
        return {
          ...s,
          assignmentTitle: mock.getAssignmentTitle(s.assignmentId),
          courseId: assignment?.courseId || null,
          courseName: assignment ? mock.getCourseName(assignment.courseId) : 'Unknown',
          studentName: mock.getUserName(s.studentId),
        }
      })
      if (assignmentId) result = result.filter(s => s.assignmentId === Number(assignmentId))
      if (studentId) result = result.filter(s => s.studentId === Number(studentId))
      return res.json(result)
    }
    const db = require('../db')
    let sql = `SELECT S.submission_id AS "submissionId", S.assignment_id AS "assignmentId", S.student_id AS "studentId",
               S.submission_text AS "submissionText", DATE_FORMAT(S.submission_date, '%d-%b-%Y') AS "submissionDate",
               A.title AS "assignmentTitle", C.course_id AS "courseId", C.course_name AS "courseName", U.name AS "studentName"
               FROM submissions S
               JOIN assignments A ON S.assignment_id = A.assignment_id
               JOIN courses C ON A.course_id = C.course_id
               JOIN users U ON S.student_id = U.user_id
               WHERE 1=1`
    const binds = {}
    if (assignmentId) { sql += ` AND S.assignment_id = :assignmentId`; binds.assignmentId = Number(assignmentId) }
    if (studentId) { sql += ` AND S.student_id = :studentId`; binds.studentId = Number(studentId) }
    sql += ` ORDER BY S.submission_date DESC`
    const result = await db.execute(sql, binds)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/submissions
router.post('/', async (req, res) => {
  const { assignmentId, studentId, submissionText } = req.body
  if (!assignmentId || !studentId || !submissionText) {
    return res.status(400).json({ error: 'assignmentId, studentId, submissionText are required' })
  }
  try {
    if (useMock()) {
      const mock = require('../mockData')
      const submission = mock.submitAssignment({
        assignmentId: Number(assignmentId),
        studentId: Number(studentId),
        submissionText,
      })
      return res.json(submission)
    }
    const db = require('../db')
    await db.execute(
      `CALL submit_assignment(:assignmentId, :studentId, :submissionText)`,
      { assignmentId: Number(assignmentId), studentId: Number(studentId), submissionText }
    )
    res.json({ message: 'Submission added' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
