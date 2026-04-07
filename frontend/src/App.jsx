import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users as UsersIcon, BookOpen, ClipboardList, FileText, CheckCircle, UserCheck } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Courses from './pages/Courses'
import Assignments from './pages/Assignments'
import Submissions from './pages/Submissions'
import Grades from './pages/Grades'
import Enrollments from './pages/Enrollments'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: UsersIcon },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/submissions', label: 'Submissions', icon: FileText },
  { to: '/grades', label: 'Grades', icon: CheckCircle },
  { to: '/enrollments', label: 'Enrollments', icon: UserCheck },
]

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* ===== HEADER ===== */}
        <header className="comic-header">
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: '#fff',
                borderRadius: 6,
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <BookOpen size={20} color="#111" strokeWidth={2} />
              </div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Simple CMS
              </h1>
            </div>

            {/* Nav */}
            <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `comic-nav-link${isActive ? ' active' : ''}`
                  }
                >
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px', width: '100%', flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/enrollments" element={<Enrollments />} />
          </Routes>
        </main>

        {/* ===== FOOTER ===== */}
        <footer className="comic-footer">
          CSS 2212 DBS Lab Mini Project · Simple Course Management System
        </footer>
      </div>
    </BrowserRouter>
  )
}
