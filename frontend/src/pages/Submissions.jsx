import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Plus, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'

export default function Submissions() {
  const [submissions, setSubmissions] = useState([])
  const [assignmentId, setAssignmentId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showGrade, setShowGrade] = useState(false)
  const [gradeTarget, setGradeTarget] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getSubmissions(assignmentId, studentId).then(setSubmissions).catch(e => setError(e.message))
  }, [assignmentId, studentId])

  const [form, setForm] = useState({ assignmentId: '', studentId: '', submissionText: '' })
  const handleAdd = () => {
    api.addSubmission(form)
      .then(() => { setShowAdd(false); setForm({ assignmentId: '', studentId: '', submissionText: '' }); api.getSubmissions(assignmentId, studentId).then(setSubmissions) })
      .catch(e => alert(e.message))
  }

  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '', gradedBy: '' })
  const openGrade = (submission) => {
    setGradeTarget(submission)
    setGradeForm({ marks: '', feedback: '', gradedBy: '' })
    setShowGrade(true)
  }
  const handleGrade = () => {
    if (!gradeTarget) return
    api.addGrade({ submissionId: gradeTarget.submissionId, ...gradeForm })
      .then(() => { setShowGrade(false); setGradeTarget(null) })
      .catch(e => alert(e.message))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Submissions</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Submission
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Filter by assignment ID (optional)"
          value={assignmentId}
          onChange={e => setAssignmentId(e.target.value)}
        />
        <Input
          placeholder="Filter by student ID (optional)"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive mb-2">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(s => (
                <TableRow key={s.submissionId}>
                  <TableCell className="font-mono text-xs">{s.submissionId}</TableCell>
                  <TableCell className="text-sm">{s.assignmentTitle}</TableCell>
                  <TableCell className="text-sm">{s.courseName}</TableCell>
                  <TableCell className="text-sm">{s.studentName}</TableCell>
                  <TableCell className="text-xs">{s.submissionDate}</TableCell>
                  <TableCell className="text-xs">{s.submissionText}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openGrade(s)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {submissions.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No submissions found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Assignment ID</Label>
              <Input type="number" value={form.assignmentId} onChange={e => setForm({ ...form, assignmentId: e.target.value })} />
            </div>
            <div>
              <Label>Student ID</Label>
              <Input type="number" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} />
            </div>
            <div>
              <Label>Submission Text</Label>
              <Input value={form.submissionText} onChange={e => setForm({ ...form, submissionText: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGrade} onClose={() => setShowGrade(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission {gradeTarget?.submissionId}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marks</Label>
                <Input type="number" value={gradeForm.marks} onChange={e => setGradeForm({ ...gradeForm, marks: e.target.value })} />
              </div>
              <div>
                <Label>Graded By (Instructor ID)</Label>
                <Input type="number" value={gradeForm.gradedBy} onChange={e => setGradeForm({ ...gradeForm, gradedBy: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Feedback</Label>
              <Input value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrade(false)}>Cancel</Button>
            <Button onClick={handleGrade}>Save Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
