require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/users', require('./routes/users'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/enrollments', require('./routes/enrollments'))
app.use('/api/assignments', require('./routes/assignments'))
app.use('/api/submissions', require('./routes/submissions'))
app.use('/api/grades', require('./routes/grades'))
app.use('/api/stats', require('./routes/stats'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Mode: ${process.env.USE_MOCK === 'true' ? 'MOCK DATA' : 'MYSQL DB'}`)
})
