import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Plus } from 'lucide-react'
import { api } from '../lib/api'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [courseId, setCourseId] = useState('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    api.getAssignments(courseId, search).then(setAssignments).catch(e => setError(e.message))
  }

  useEffect(() => { load() }, [courseId, search])

  const [form, setForm] = useState({ courseId: '', title: '', description: '', dueDate: '', maxMarks: 10 })

  const handleAdd = () => {
    api.addAssignment(form)
      .then(() => { setShowAdd(false); setForm({ courseId: '', title: '', description: '', dueDate: '', maxMarks: 10 }); load() })
      .catch(e => alert(e.message))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Assignments</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Assignment
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Filter by course ID (optional)"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
        />
        <Input
          placeholder="Search by title (optional)"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive mb-2">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Max Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(a => (
                <TableRow key={a.assignmentId}>
                  <TableCell className="font-mono text-xs">{a.assignmentId}</TableCell>
                  <TableCell className="text-sm">{a.courseName}</TableCell>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell className="text-xs">{a.dueDate}</TableCell>
                  <TableCell className="text-xs">{a.maxMarks}</TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No assignments found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Course ID</Label>
              <Input type="number" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Due Date (DD-MON-YYYY)</Label>
                <Input value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} placeholder="20-FEB-2026" />
              </div>
              <div>
                <Label>Max Marks</Label>
                <Input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
