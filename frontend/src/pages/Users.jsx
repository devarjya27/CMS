import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Plus, History } from 'lucide-react'
import { api } from '../lib/api'

const ROLES = ['student', 'instructor']

export default function Users() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [historyUser, setHistoryUser] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    api.getUsers(search, role).then(setUsers).catch(e => setError(e.message))
  }

  useEffect(() => { load() }, [search, role])

  const [form, setForm] = useState({ username: '', name: '', email: '', role: 'student', password: '' })

  const handleAdd = () => {
    api.addUser(form)
      .then(() => { setShowAdd(false); load(); setForm({ username: '', name: '', email: '', role: 'student', password: '' }) })
      .catch(e => alert(e.message))
  }

  const viewHistory = (user) => {
    setHistoryUser(user)
    api.getEnrollments('', user.userId)
      .then(setHistory)
      .catch(() => setHistory([]))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Users</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Search by username, name, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="comic-select"
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {error && <p className="text-destructive mb-2">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.userId}>
                  <TableCell className="font-mono text-xs">{u.userId}</TableCell>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'instructor' ? 'default' : 'secondary'}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.role === 'student' && (
                      <Button variant="ghost" size="sm" onClick={() => viewHistory(u)}>
                        <History className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Username</Label>
              <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="comic-select"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Password (optional)</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!historyUser} onClose={() => { setHistoryUser(null); setHistory(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enrollment History: {historyUser?.name}</DialogTitle>
          </DialogHeader>
          {history === null ? (
            <p className="text-muted-foreground py-4">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground py-4">No enrollments found.</p>
          ) : (
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(h => (
                    <TableRow key={h.enrollmentId}>
                      <TableCell className="text-sm">{h.courseName}</TableCell>
                      <TableCell className="text-xs">{h.enrollmentDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setHistoryUser(null); setHistory(null) }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
