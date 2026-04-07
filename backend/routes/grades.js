const express = require('express')
const router = express.Router()

const useMock = () => process.env.USE_MOCK === 'true'

// GET /api/grades
router.get('/', async (req, res) => {
  const { studentId, assignmentId } = req.query
  try {
    if (useMock()) {
      const mock = require('../mockData')
      let result = mock.grades.map(g => {
        const submission = mock.submissions.find(s => s.submissionId === g.submissionId)
        const assignment = submission ? mock.assignments.find(a => a.assignmentId === submission.assignmentId) : null
        return {
          ...g,
          assignmentId: submission?.assignmentId || null,
          submissionId: g.submissionId,
          studentId: submission?.studentId || null,
          studentName: submission ? mock.getUserName(submission.studentId) : 'Unknown',
          assignmentTitle: assignment ? mock.getAssignmentTitle(assignment.assignmentId) : 'Unknown',
          courseId: assignment?.courseId || null,
          courseName: assignment ? mock.getCourseName(assignment.courseId) : 'Unknown',
          instructorName: mock.getUserName(g.gradedBy),
        }
      })
      if (studentId) result = result.filter(g => g.studentId === Number(studentId))
      if (assignmentId) result = result.filter(g => g.assignmentId === Number(assignmentId))
      return res.json(result)
    }
    const db = require('../db')
    let sql = `SELECT G.grade_id AS "gradeId", G.submission_id AS "submissionId", G.marks, G.feedback,
               G.graded_by AS "gradedBy", DATE_FORMAT(G.graded_date, '%d-%b-%Y') AS "gradedDate",
               S.assignment_id AS "assignmentId", S.student_id AS "studentId",
               U.name AS "studentName", A.title AS "assignmentTitle",
               C.course_id AS "courseId", C.course_name AS "courseName",
               I.name AS "instructorName"
               FROM grades G
               JOIN submissions S ON G.submission_id = S.submission_id
               JOIN users U ON S.student_id = U.user_id
               JOIN assignments A ON S.assignment_id = A.assignment_id
               JOIN courses C ON A.course_id = C.course_id
               JOIN users I ON G.graded_by = I.user_id
               WHERE 1=1`
    const binds = {}
    if (studentId) { sql += ` AND S.student_id = :studentId`; binds.studentId = Number(studentId) }
    if (assignmentId) { sql += ` AND S.assignment_id = :assignmentId`; binds.assignmentId = Number(assignmentId) }
    sql += ` ORDER BY G.grade_id DESC`
    const result = await db.execute(sql, binds)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/grades
router.post('/', async (req, res) => {
  const { submissionId, marks, feedback, gradedBy } = req.body
  if (!submissionId || marks === undefined || !gradedBy) {
    return res.status(400).json({ error: 'submissionId, marks, gradedBy are required' })
  }
  try {
    if (useMock()) {
      const mock = require('../mockData')
      const grade = mock.gradeSubmission({
        submissionId: Number(submissionId),
        marks: Number(marks),
        feedback: feedback || '',
        gradedBy: Number(gradedBy),
      })
      return res.json(grade)
    }
    const db = require('../db')
    await db.execute(
      `CALL grade_submission(:submissionId, :marks, :feedback, :gradedBy)`,
      { submissionId: Number(submissionId), marks: Number(marks), feedback: feedback || null, gradedBy: Number(gradedBy) }
    )
    res.json({ message: 'Grade saved' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
