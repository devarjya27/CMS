import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Plus } from 'lucide-react'
import { api } from '../lib/api'

export default function Grades() {
  const [grades, setGrades] = useState([])
  const [studentId, setStudentId] = useState('')
  const [assignmentId, setAssignmentId] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    api.getGrades(studentId, assignmentId).then(setGrades).catch(e => setError(e.message))
  }

  useEffect(() => { load() }, [studentId, assignmentId])

  const [form, setForm] = useState({ submissionId: '', marks: '', feedback: '', gradedBy: '' })
  const handleAdd = () => {
    api.addGrade(form)
      .then(() => { setShowAdd(false); setForm({ submissionId: '', marks: '', feedback: '', gradedBy: '' }); load() })
      .catch(e => alert(e.message))
  }

  const statsSource = grades.filter(g => (assignmentId ? g.assignmentId === Number(assignmentId) : true))
  const stats = statsSource.length > 0 ? {
    count: statsSource.length,
    avg: (statsSource.reduce((s, g) => s + Number(g.marks), 0) / statsSource.length).toFixed(2),
    min: Math.min(...statsSource.map(g => Number(g.marks))),
    max: Math.max(...statsSource.map(g => Number(g.marks))),
  } : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Grades</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Grade
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Filter by student ID (optional)"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />
        <Input
          placeholder="Filter by assignment ID (optional)"
          value={assignmentId}
          onChange={e => setAssignmentId(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive mb-2">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade ID</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Graded By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map(g => (
                <TableRow key={g.gradeId}>
                  <TableCell className="font-mono text-xs">{g.gradeId}</TableCell>
                  <TableCell className="text-sm">{g.assignmentTitle}</TableCell>
                  <TableCell className="text-sm">{g.studentName}</TableCell>
                  <TableCell className="text-xs">{g.marks}</TableCell>
                  <TableCell className="text-xs">{g.feedback || '-'}</TableCell>
                  <TableCell className="text-xs">{g.instructorName}</TableCell>
                  <TableCell className="text-xs">{g.gradedDate}</TableCell>
                </TableRow>
              ))}
              {grades.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No grades found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div style={{ marginTop: 16 }}>
        <div className="comic-card" style={{ padding: 14 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6 }}>Grade Stats</div>
          {stats ? (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <div>Count: <strong>{stats.count}</strong></div>
              <div>Average: <strong>{stats.avg}</strong></div>
              <div>Min: <strong>{stats.min}</strong></div>
              <div>Max: <strong>{stats.max}</strong></div>
            </div>
          ) : (
            <div className="text-muted-foreground">No grades to summarize.</div>
          )}
        </div>
      </div>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Submission ID</Label>
              <Input type="number" value={form.submissionId} onChange={e => setForm({ ...form, submissionId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marks</Label>
                <Input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} />
              </div>
              <div>
                <Label>Graded By (Instructor ID)</Label>
                <Input type="number" value={form.gradedBy} onChange={e => setForm({ ...form, gradedBy: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Feedback</Label>
              <Input value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
