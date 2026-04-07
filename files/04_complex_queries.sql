-- ============================================================
-- CMS PROJECT: COMPLEX QUERIES, VIEWS, CTEs
-- ============================================================

USE cms_db;

-- Q1. Students who submitted ALL assignments for a given course (course_id = 101)
SELECT u.user_id, u.name
FROM users u
JOIN enrollments e ON u.user_id = e.student_id
WHERE e.course_id = 101
AND NOT EXISTS (
  SELECT 1 FROM assignments a
  WHERE a.course_id = 101
  AND NOT EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.assignment_id = a.assignment_id AND s.student_id = u.user_id
  )
);

-- Q2. Students who have NOT submitted any assignment in their enrolled courses
SELECT DISTINCT u.user_id, u.name
FROM users u
JOIN enrollments e ON u.user_id = e.student_id
LEFT JOIN submissions s ON s.student_id = u.user_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.name
HAVING COUNT(s.submission_id) = 0;

-- Q3. Assignments with submission completion rate
SELECT a.assignment_id, a.title,
       COUNT(s.submission_id) AS submitted,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = a.course_id) AS total_enrolled,
       ROUND(COUNT(s.submission_id) / NULLIF((SELECT COUNT(*) FROM enrollments e WHERE e.course_id = a.course_id), 0) * 100, 2) AS completion_pct
FROM assignments a
LEFT JOIN submissions s ON a.assignment_id = s.assignment_id
GROUP BY a.assignment_id, a.title, a.course_id
ORDER BY completion_pct DESC;

-- Q4. Highest scorer per assignment (correlated subquery)
SELECT a.assignment_id, a.title, u.name, g.marks
FROM grades g
JOIN submissions s ON g.submission_id = s.submission_id
JOIN assignments a ON s.assignment_id = a.assignment_id
JOIN users u ON s.student_id = u.user_id
WHERE g.marks = (
  SELECT MAX(g2.marks)
  FROM grades g2
  JOIN submissions s2 ON g2.submission_id = s2.submission_id
  WHERE s2.assignment_id = a.assignment_id
);

-- Q5. Students with average marks above course average
WITH course_avg AS (
  SELECT a.course_id, AVG(g.marks) AS avg_marks
  FROM grades g
  JOIN submissions s ON g.submission_id = s.submission_id
  JOIN assignments a ON s.assignment_id = a.assignment_id
  GROUP BY a.course_id
),
student_avg AS (
  SELECT a.course_id, s.student_id, AVG(g.marks) AS student_avg
  FROM grades g
  JOIN submissions s ON g.submission_id = s.submission_id
  JOIN assignments a ON s.assignment_id = a.assignment_id
  GROUP BY a.course_id, s.student_id
)
SELECT c.course_code, u.name, sa.student_avg
FROM student_avg sa
JOIN course_avg ca ON sa.course_id = ca.course_id
JOIN courses c ON sa.course_id = c.course_id
JOIN users u ON sa.student_id = u.user_id
WHERE sa.student_avg > ca.avg_marks
ORDER BY c.course_code, sa.student_avg DESC;

-- Q6. View: course overview
CREATE OR REPLACE VIEW vw_course_overview AS
SELECT c.course_id, c.course_code, c.course_name, u.name AS instructor,
       COUNT(DISTINCT e.student_id) AS total_students,
       COUNT(DISTINCT a.assignment_id) AS total_assignments
FROM courses c
JOIN users u ON c.instructor_id = u.user_id
LEFT JOIN enrollments e ON c.course_id = e.course_id
LEFT JOIN assignments a ON c.course_id = a.course_id
GROUP BY c.course_id, c.course_code, c.course_name, u.name;

-- Q7. View: student grades summary
CREATE OR REPLACE VIEW vw_student_grades AS
SELECT u.user_id, u.name, c.course_code, a.title AS assignment,
       g.marks, g.graded_date
FROM grades g
JOIN submissions s ON g.submission_id = s.submission_id
JOIN users u ON s.student_id = u.user_id
JOIN assignments a ON s.assignment_id = a.assignment_id
JOIN courses c ON a.course_id = c.course_id;

-- Q8. View: pending submissions per assignment
CREATE OR REPLACE VIEW vw_pending_submissions AS
SELECT a.assignment_id, a.title, c.course_code,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = a.course_id) AS total_enrolled,
       COUNT(s.submission_id) AS submitted,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = a.course_id) - COUNT(s.submission_id) AS pending
FROM assignments a
JOIN courses c ON a.course_id = c.course_id
LEFT JOIN submissions s ON a.assignment_id = s.assignment_id
GROUP BY a.assignment_id, a.title, c.course_code, a.course_id;

-- Q9. View: assignment stats
CREATE OR REPLACE VIEW vw_assignment_stats AS
SELECT a.assignment_id, a.title, c.course_code,
       COUNT(s.submission_id) AS submissions,
       ROUND(AVG(g.marks), 2) AS avg_marks,
       MAX(g.marks) AS max_marks,
       MIN(g.marks) AS min_marks
FROM assignments a
JOIN courses c ON a.course_id = c.course_id
LEFT JOIN submissions s ON a.assignment_id = s.assignment_id
LEFT JOIN grades g ON s.submission_id = g.submission_id
GROUP BY a.assignment_id, a.title, c.course_code;

-- Q10. Transaction demo (safe rollback)
START TRANSACTION;
  INSERT INTO submissions (assignment_id, student_id, submission_text, submission_date)
  VALUES (201, 5, 'Temporary submission for demo', NOW());
  SAVEPOINT before_rollback;
  UPDATE submissions SET submission_text = 'Updated demo submission'
  WHERE assignment_id = 201 AND student_id = 5;
  ROLLBACK TO before_rollback;
ROLLBACK;
