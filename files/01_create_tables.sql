-- ============================================================
-- CMS PROJECT: CREATE TABLES (MySQL 8.0)
-- ============================================================

DROP TABLE IF EXISTS grade_audit;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','instructor') NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  course_code VARCHAR(20) NOT NULL UNIQUE,
  instructor_id INT NOT NULL,
  CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES users(user_id)
);

CREATE TABLE enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  student_id INT NOT NULL,
  enrollment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses(course_id),
  CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES users(user_id),
  CONSTRAINT uq_enroll UNIQUE (course_id, student_id)
);

CREATE TABLE assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  max_marks INT NOT NULL,
  CONSTRAINT fk_assign_course FOREIGN KEY (course_id) REFERENCES courses(course_id),
  CONSTRAINT chk_max_marks CHECK (max_marks >= 1)
);

CREATE TABLE submissions (
  submission_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_text TEXT NOT NULL,
  submission_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sub_assign FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
  CONSTRAINT fk_sub_student FOREIGN KEY (student_id) REFERENCES users(user_id),
  CONSTRAINT uq_sub UNIQUE (assignment_id, student_id)
);

CREATE TABLE grades (
  grade_id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL UNIQUE,
  marks DECIMAL(5,2) NOT NULL,
  feedback TEXT,
  graded_by INT NOT NULL,
  graded_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_grade_submission FOREIGN KEY (submission_id) REFERENCES submissions(submission_id),
  CONSTRAINT fk_grade_instructor FOREIGN KEY (graded_by) REFERENCES users(user_id),
  CONSTRAINT chk_marks CHECK (marks >= 0)
);

CREATE TABLE grade_audit (
  audit_id INT AUTO_INCREMENT PRIMARY KEY,
  grade_id INT,
  submission_id INT,
  operation VARCHAR(10) NOT NULL,
  changed_by VARCHAR(100) DEFAULT CURRENT_USER,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  old_marks DECIMAL(5,2),
  new_marks DECIMAL(5,2),
  old_feedback TEXT,
  new_feedback TEXT
);
