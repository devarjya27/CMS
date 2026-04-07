import { useState, useEffect } from 'react'
import { Users, BookOpen, ClipboardList, FileText, CheckCircle, UserCheck } from 'lucide-react'
import { api } from '../lib/api'

const CARDS_META = [
  { key: 'totalUsers',        label: 'Total Users',        icon: Users },
  { key: 'totalCourses',      label: 'Total Courses',      icon: BookOpen },
  { key: 'totalAssignments',  label: 'Total Assignments',  icon: ClipboardList },
  { key: 'totalSubmissions',  label: 'Total Submissions',  icon: FileText },
  { key: 'gradedSubmissions', label: 'Graded Submissions', icon: CheckCircle },
  { key: 'activeEnrollments', label: 'Enrollments',        icon: UserCheck },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
  }, [])

  if (error) return <p className="comic-msg-error">Error: {error}</p>
  if (!stats) return <p>Loading...</p>

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Dashboard</h2>
      </div>

      {/* Stat cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {CARDS_META.map(({ key, label, icon: Icon }) => (
          <div key={key} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', color: '#333' }}>{label}</span>
              <Icon size={18} color="#333" strokeWidth={2} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111' }}>
              {stats[key] ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* System Info panel */}
      <div style={{ marginTop: 28 }}>
        <div className="comic-card" style={{ padding: 20 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>System Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {[
              ['DB', 'Database', 'MySQL 8.0 (schema from CMS_Report)'],
              ['TB', 'Tables', 'Users, Courses, Enrollments, Assignments, Submissions, Grades, Grade_Audit'],
              ['SP', 'Procedures', 'enroll_student, submit_assignment, grade_submission'],
              ['FN', 'Functions', 'get_student_avg, get_course_stats, is_enrolled'],
              ['TR', 'Triggers', 'Grade audit for INSERT/UPDATE/DELETE'],
            ].map(([, title, val]) => (
              <div key={title} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#333' }}>{title}: </span>
                  <span style={{ color: '#333' }}>{val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
