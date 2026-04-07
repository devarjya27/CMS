A Simple Course Management System with a React + Vite frontend and a Node/Express API. Manages users, courses, enrollments, assignments, submissions, and grades with a dashboard view. Backend supports MySQL via mysql2 (or mock data) and exposes clean REST endpoints.

### 1. Start the Backend
```bash
cd backend
npm install        # first time only
npm start
```
API runs at http://localhost:3000  

### 2. Start the Frontend
```bash
cd frontend
npm install        # first time only
npm run dev
```
Open http://localhost:5173

### 3. Connect to MySQL DB
First, make sure MySQL is running:
```bash
sudo systemctl start mysql
```

Then connect:
```bash
mysql -u root -p
```

Run SQL in `files/` in order:
```sql
SOURCE 00_setup_user.sql;
USE cms_db;
SOURCE 01_create_tables.sql;
SOURCE 02_insert_data.sql;
SOURCE 03_basic_queries.sql;
SOURCE 04_complex_queries.sql;
SOURCE 05_procedures_functions.sql;
SOURCE 06_triggers.sql;
```
Then edit `backend/.env`:
```
USE_MOCK=false
MYSQL_HOST=localhost
MYSQL_USER=cms_user
MYSQL_PASSWORD=cms_pass
MYSQL_DATABASE=cms_db
```
Restart the backend after updating `.env`.
