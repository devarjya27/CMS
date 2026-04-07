const users = [
  { userId: 1, username: 'april', password: 'pass123', role: 'instructor', name: "Dr. April D'Souza", email: 'april.dsouza@mit.edu' },
  { userId: 2, username: 'rohit', password: 'pass123', role: 'instructor', name: 'Prof. Rohit Nair', email: 'rohit.nair@mit.edu' },
  { userId: 3, username: 'meera', password: 'pass123', role: 'student', name: 'Meera Iyer', email: 'meera.iyer@mit.edu' },
  { userId: 4, username: 'arjun', password: 'pass123', role: 'student', name: 'Arjun Rao', email: 'arjun.rao@mit.edu' },
  { userId: 5, username: 'nisha', password: 'pass123', role: 'student', name: 'Nisha Kulkarni', email: 'nisha.k@mit.edu' },
]

const courses = [
  { courseId: 101, courseName: 'Database Systems', courseCode: 'CSS2212', instructorId: 1 },
  { courseId: 102, courseName: 'Web Development', courseCode: 'CSE3012', instructorId: 2 },
  { courseId: 103, courseName: 'Data Structures', courseCode: 'CSE2101', instructorId: 1 },
]

const enrollments = [
  { enrollmentId: 1001, courseId: 101, studentId: 3, enrollmentDate: '12-JAN-2026' },
  { enrollmentId: 1002, courseId: 102, studentId: 3, enrollmentDate: '12-JAN-2026' },
  { enrollmentId: 1003, courseId: 101, studentId: 4, enrollmentDate: '12-JAN-2026' },
  { enrollmentId: 1004, courseId: 103, studentId: 4, enrollmentDate: '12-JAN-2026' },
  { enrollmentId: 1005, courseId: 102, studentId: 5, enrollmentDate: '12-JAN-2026' },
  { enrollmentId: 1006, courseId: 103, studentId: 5, enrollmentDate: '12-JAN-2026' },
]

const assignments = [
  { assignmentId: 201, courseId: 101, title: 'ER Modeling Basics', description: 'Design ER diagram for a college system.', dueDate: '10-APR-2026', maxMarks: 25 },
  { assignmentId: 202, courseId: 101, title: 'SQL Practice Set', description: 'Write SQL queries for the schema.', dueDate: '20-MAR-2026', maxMarks: 25 },
  { assignmentId: 203, courseId: 102, title: 'HTML/CSS Mini Site', description: 'Create a responsive landing page.', dueDate: '06-APR-2026', maxMarks: 20 },
  { assignmentId: 204, courseId: 102, title: 'React Intro', description: 'Build a simple SPA with routing.', dueDate: '20-APR-2026', maxMarks: 30 },
  { assignmentId: 205, courseId: 103, title: 'Stack and Queue Lab', description: 'Implement stack and queue operations.', dueDate: '10-MAR-2026', maxMarks: 30 },
]

const submissions = [
  { submissionId: 301, assignmentId: 201, studentId: 3, submissionText: 'Submitted ER diagram and assumptions.', submissionDate: '05-APR-2026' },
  { submissionId: 302, assignmentId: 201, studentId: 4, submissionText: 'Attached ER diagram with entities/relations.', submissionDate: '06-APR-2026' },
  { submissionId: 303, assignmentId: 202, studentId: 3, submissionText: 'SQL queries with joins and aggregates.', submissionDate: '15-MAR-2026' },
  { submissionId: 304, assignmentId: 202, studentId: 4, submissionText: 'SQL queries + notes.', submissionDate: '19-MAR-2026' },
  { submissionId: 305, assignmentId: 203, studentId: 3, submissionText: 'HTML/CSS responsive site.', submissionDate: '06-APR-2026' },
  { submissionId: 306, assignmentId: 204, studentId: 3, submissionText: 'React SPA with three routes.', submissionDate: '08-APR-2026' },
  { submissionId: 307, assignmentId: 204, studentId: 5, submissionText: 'React SPA with routing + hooks.', submissionDate: '09-APR-2026' },
  { submissionId: 308, assignmentId: 205, studentId: 5, submissionText: 'Stack/Queue implementations.', submissionDate: '09-MAR-2026' },
]

const grades = [
  { gradeId: 401, submissionId: 301, marks: 98, feedback: 'Excellent diagram.', gradedBy: 1, gradedDate: '07-APR-2026' },
  { gradeId: 402, submissionId: 302, marks: 85, feedback: 'Good work, minor fixes.', gradedBy: 1, gradedDate: '07-APR-2026' },
  { gradeId: 403, submissionId: 303, marks: 72, feedback: 'Satisfactory.', gradedBy: 1, gradedDate: '21-MAR-2026' },
  { gradeId: 404, submissionId: 305, marks: 73, feedback: '', gradedBy: 2, gradedDate: '06-APR-2026' },
  { gradeId: 405, submissionId: 308, marks: 45, feedback: '', gradedBy: 1, gradedDate: '11-MAR-2026' },
]

let nextUserId = 6
let nextCourseId = 104
let nextEnrollmentId = 1007
let nextAssignmentId = 206
let nextSubmissionId = 309
let nextGradeId = 406

function formatDate(date) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const d = String(date.getDate()).padStart(2, '0')
  return `${d}-${months[date.getMonth()]}-${date.getFullYear()}`
}

function getUserName(userId) {
  const u = users.find(u => u.userId === userId)
  return u ? u.name : 'Unknown'
}

function getCourseName(courseId) {
  const c = courses.find(c => c.courseId === courseId)
  return c ? c.courseName : 'Unknown'
}

function getAssignmentTitle(assignmentId) {
  const a = assignments.find(a => a.assignmentId === assignmentId)
  return a ? a.title : 'Unknown'
}

function addUser(data) {
  if (!['student', 'instructor'].includes(data.role)) throw new Error('Invalid role')
  if (users.some(u => u.username === data.username)) throw new Error('Username already exists')
  if (users.some(u => u.email === data.email)) throw new Error('Email already exists')
  const user = {
    userId: nextUserId++,
    username: data.username,
    password: data.password || 'pass123',
    role: data.role,
    name: data.name,
    email: data.email,
  }
  users.push(user)
  return user
}

function addCourse(data) {
  const instructor = users.find(u => u.userId === data.instructorId && u.role === 'instructor')
  if (!instructor) throw new Error('Instructor not found')
  if (courses.some(c => c.courseCode === data.courseCode)) throw new Error('Course code already exists')
  const course = {
    courseId: nextCourseId++,
    courseName: data.courseName,
    courseCode: data.courseCode,
    instructorId: data.instructorId,
  }
  courses.push(course)
  return course
}

function enrollStudent(courseId, studentId) {
  const student = users.find(u => u.userId === studentId && u.role === 'student')
  if (!student) throw new Error('Student not found')
  const course = courses.find(c => c.courseId === courseId)
  if (!course) throw new Error('Course not found')
  const dup = enrollments.find(e => e.courseId === courseId && e.studentId === studentId)
  if (dup) throw new Error('Student already enrolled in this course')

  const enrollment = {
    enrollmentId: nextEnrollmentId++,
    courseId,
    studentId,
    enrollmentDate: formatDate(new Date()),
  }
  enrollments.push(enrollment)
  return enrollment
}

function addAssignment(data) {
  const course = courses.find(c => c.courseId === data.courseId)
  if (!course) throw new Error('Course not found')
  const assignment = {
    assignmentId: nextAssignmentId++,
    courseId: data.courseId,
    title: data.title,
    description: data.description || '',
    dueDate: data.dueDate || formatDate(new Date()),
    maxMarks: Number(data.maxMarks) || 10,
  }
  assignments.push(assignment)
  return assignment
}

function submitAssignment(data) {
  const assignment = assignments.find(a => a.assignmentId === data.assignmentId)
  if (!assignment) throw new Error('Assignment not found')
  const student = users.find(u => u.userId === data.studentId && u.role === 'student')
  if (!student) throw new Error('Student not found')
  const enrolled = enrollments.find(e => e.courseId === assignment.courseId && e.studentId === data.studentId)
  if (!enrolled) throw new Error('Student not enrolled in this course')
  const dup = submissions.find(s => s.assignmentId === data.assignmentId && s.studentId === data.studentId)
  if (dup) throw new Error('Submission already exists for this assignment')

  const submission = {
    submissionId: nextSubmissionId++,
    assignmentId: data.assignmentId,
    studentId: data.studentId,
    submissionText: data.submissionText || '',
    submissionDate: data.submissionDate || formatDate(new Date()),
  }
  submissions.push(submission)
  return submission
}

function gradeSubmission(data) {
  const submission = submissions.find(s => s.submissionId === data.submissionId)
  if (!submission) throw new Error('Submission not found')
  const assignment = assignments.find(a => a.assignmentId === submission.assignmentId)
  const instructor = users.find(u => u.userId === data.gradedBy && u.role === 'instructor')
  if (!instructor) throw new Error('Instructor not found')

  const max = assignment?.maxMarks ?? 100
  if (Number(data.marks) < 0 || Number(data.marks) > max) throw new Error(`Marks must be between 0 and ${max}`)

  let grade = grades.find(g => g.submissionId === data.submissionId)
  if (grade) {
    grade.marks = Number(data.marks)
    grade.feedback = data.feedback || ''
    grade.gradedBy = data.gradedBy
    grade.gradedDate = formatDate(new Date())
    return grade
  }

  grade = {
    gradeId: nextGradeId++,
    submissionId: data.submissionId,
    marks: Number(data.marks),
    feedback: data.feedback || '',
    gradedBy: data.gradedBy,
    gradedDate: formatDate(new Date()),
  }
  grades.push(grade)
  return grade
}

module.exports = {
  users,
  courses,
  enrollments,
  assignments,
  submissions,
  grades,
  getUserName,
  getCourseName,
  getAssignmentTitle,
  addUser,
  addCourse,
  enrollStudent,
  addAssignment,
  submitAssignment,
  gradeSubmission,
}
