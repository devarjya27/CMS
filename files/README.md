# CSS 2212 DBS Lab Mini Project
## Simple Course Management System (CMS)

**Team:** Devarjya Purkayastha (09)  
**Section:** A1 | **Branch:** Information Technology

---

## FILE STRUCTURE

```
cms_project/
│
├── 00_setup_user.sql           ← MySQL user + database setup
├── 01_create_tables.sql        ← DDL: CMS tables, constraints
├── 02_insert_data.sql          ← DML: Sample CMS data
├── 03_basic_queries.sql        ← 20 basic queries
├── 04_complex_queries.sql      ← CTEs, subqueries, views
├── 05_procedures_functions.sql ← Procedures + functions
├── 06_triggers.sql             ← Grade audit triggers
├── CMSApp.java                 ← Java JDBC connectivity (menu-driven CLI)
└── index.html                  ← Simple CMS UI (static demo)
```

---

## PART 1 — MYSQL SETUP (Step-by-step)

### Step 1: Install MySQL 8.0
Install MySQL Server 8.0 and ensure the client (`mysql`) is available.

### Step 2: Create DB and user
Run the setup script in `mysql`:

```sql
SOURCE 00_setup_user.sql;
```

### Step 3: Switch to the CMS database
```sql
USE cms_db;
```

### Step 4: Run project files IN ORDER
```sql
SOURCE 01_create_tables.sql;
SOURCE 02_insert_data.sql;
SOURCE 03_basic_queries.sql;
SOURCE 04_complex_queries.sql;
SOURCE 05_procedures_functions.sql;
SOURCE 06_triggers.sql;
```

---

## PART 2 — JAVA CLI (Optional)

Compile and run:
```bash
javac -cp .:mysql-connector-j.jar CMSApp.java
java  -cp .:mysql-connector-j.jar CMSApp
```

Update the DB credentials inside `CMSApp.java` if required.

---

## NOTES
- Schema follows the ER diagram and relational schema in `CMS_Report.tex`.
- Core modules: Users, Courses, Enrollments, Assignments, Submissions, Grades, Grade_Audit.
