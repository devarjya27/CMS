import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Plus } from 'lucide-react'
import { api } from '../lib/api'

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [searchCourse, setSearchCourse] = useState('')
  const [searchStudent, setSearchStudent] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    api.getEnrollments(searchCourse, searchStudent).then(setEnrollments).catch(e => setError(e.message))
  }

  useEffect(() => { load() }, [searchCourse, searchStudent])

  const [form, setForm] = useState({ courseId: '', studentId: '' })
  const handleAdd = () => {
    api.addEnrollment(form)
      .then(() => { setShowAdd(false); setForm({ courseId: '', studentId: '' }); load() })
      .catch(e => alert(e.message))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Enrollments</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Enrollment
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Filter by course ID (optional)"
          value={searchCourse}
          onChange={e => setSearchCourse(e.target.value)}
        />
        <Input
          placeholder="Filter by student ID (optional)"
          value={searchStudent}
          onChange={e => setSearchStudent(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive mb-2">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>Enrollment ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map(e => (
                <TableRow key={e.enrollmentId}>
                  <TableCell className="font-mono text-xs">{e.enrollmentId}</TableCell>
                  <TableCell className="text-sm">{e.courseName}</TableCell>
                  <TableCell className="text-sm">{e.studentName}</TableCell>
                  <TableCell className="text-xs">{e.enrollmentDate}</TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No enrollments found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Enrollment Dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll a Student</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Course ID</Label>
              <Input type="number" placeholder="e.g. 101" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} />
            </div>
            <div>
              <Label>Student ID</Label>
              <Input type="number" placeholder="e.g. 3" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Enroll Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
