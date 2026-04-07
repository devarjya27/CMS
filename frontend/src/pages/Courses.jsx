import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Plus } from 'lucide-react'
import { api } from '../lib/api'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    api.getCourses(search).then(setCourses).catch(e => setError(e.message))
  }

  useEffect(() => { load() }, [search])

  const [form, setForm] = useState({ courseName: '', courseCode: '', instructorId: '' })

  const handleAdd = () => {
    api.addCourse(form)
      .then(() => { setShowAdd(false); load(); setForm({ courseName: '', courseCode: '', instructorId: '' }) })
      .catch(e => alert(e.message))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Courses</h2>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Course
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by course name, code, or instructor..."
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
                  <TableHead>Course Name</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Instructor</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map(c => (
                <TableRow key={c.courseId}>
                  <TableCell className="font-mono text-xs">{c.courseId}</TableCell>
                  <TableCell className="font-medium">{c.courseName}</TableCell>
                  <TableCell className="text-sm">{c.courseCode}</TableCell>
                  <TableCell className="text-sm">{c.instructorName}</TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No courses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Course Name</Label>
              <Input value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} />
            </div>
            <div>
              <Label>Course Code</Label>
              <Input value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} />
            </div>
            <div>
              <Label>Instructor ID</Label>
              <Input type="number" value={form.instructorId} onChange={e => setForm({ ...form, instructorId: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
