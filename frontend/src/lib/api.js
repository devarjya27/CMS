const API = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Stats
  getStats: () => request('/stats'),

  // Users
  getUsers: (search = '', role = '') => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    const q = params.toString()
    return request(`/users${q ? '?' + q : ''}`)
  },
  getUser: (id) => request(`/users/${id}`),
  addUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Courses
  getCourses: (search = '') => {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    return request(`/courses${q}`)
  },
  addCourse: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),

  // Enrollments
  getEnrollments: (courseId = '', studentId = '') => {
    const params = new URLSearchParams()
    if (courseId) params.set('courseId', courseId)
    if (studentId) params.set('studentId', studentId)
    const q = params.toString()
    return request(`/enrollments${q ? '?' + q : ''}`)
  },
  addEnrollment: (data) => request('/enrollments', { method: 'POST', body: JSON.stringify(data) }),

  // Assignments
  getAssignments: (courseId = '', search = '') => {
    const params = new URLSearchParams()
    if (courseId) params.set('courseId', courseId)
    if (search) params.set('search', search)
    const q = params.toString()
    return request(`/assignments${q ? '?' + q : ''}`)
  },
  addAssignment: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) }),

  // Submissions
  getSubmissions: (assignmentId = '', studentId = '') => {
    const params = new URLSearchParams()
    if (assignmentId) params.set('assignmentId', assignmentId)
    if (studentId) params.set('studentId', studentId)
    const q = params.toString()
    return request(`/submissions${q ? '?' + q : ''}`)
  },
  addSubmission: (data) => request('/submissions', { method: 'POST', body: JSON.stringify(data) }),

  // Grades
  getGrades: (studentId = '', assignmentId = '') => {
    const params = new URLSearchParams()
    if (studentId) params.set('studentId', studentId)
    if (assignmentId) params.set('assignmentId', assignmentId)
    const q = params.toString()
    return request(`/grades${q ? '?' + q : ''}`)
  },
  addGrade: (data) => request('/grades', { method: 'POST', body: JSON.stringify(data) }),
}
