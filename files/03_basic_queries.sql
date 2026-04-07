-- ============================================================
-- CMS PROJECT: BASIC QUERIES (20)
-- ============================================================

USE cms_db;

-- Q1. List all users
SELECT user_id, username, role, name, email
FROM users
ORDER BY role, username;

-- Q2. List all courses with instructor
SELECT c.course_id, c.course_name, c.course_code, u.name AS instructor
FROM courses c
JOIN users u ON c.instructor_id = u.user_id
ORDER BY c.course_code;

-- Q3. List all enrollments with course and student
SELECT e.enrollment_id, c.course_code, c.course_name, u.name AS student, e.enrollment_date
FROM enrollments e
JOIN courses c ON e.course_id = c.course_id
JOIN users u ON e.student_id = u.user_id
ORDER BY e.enrollment_date DESC;

-- Q4. List assignments with course name and due date
SELECT a.assignment_id, a.title, c.course_code, DATE_FORMAT(a.due_date, '%d-%b-%Y') AS due_date
FROM assignments a
JOIN courses c ON a.course_id = c.course_id
ORDER BY a.due_date;

-- Q5. List submissions with student and assignment
SELECT s.submission_id, u.name AS student, a.title AS assignment, DATE_FORMAT(s.submission_date, '%d-%b-%Y') AS submitted_on
FROM submissions s
JOIN users u ON s.student_id = u.user_id
JOIN assignments a ON s.assignment_id = a.assignment_id
ORDER BY s.submission_date DESC;

-- Q6. List grades with student, assignment, marks
SELECT g.grade_id, u.name AS student, a.title AS assignment, g.marks
FROM grades g
JOIN submissions s ON g.submission_id = s.submission_id
JOIN users u ON s.student_id = u.user_id
JOIN assignments a ON s.assignment_id = a.assignment_id
ORDER BY g.grade_id DESC;

-- Q7. Students enrolled in course CSS2212
SELECT u.user_id, u.name, u.email
FROM enrollments e
JOIN users u ON e.student_id = u.user_id
JOIN courses c ON e.course_id = c.course_id
WHERE c.course_code = 'CSS2212'
ORDER BY u.name;

-- Q8. Assignments for course 101
SELECT assignment_id, title, max_marks, DATE_FORMAT(due_date, '%d-%b-%Y') AS due_date
FROM assignments
WHERE course_id = 101
ORDER BY due_date;

-- Q9. Submissions for assignment 201
SELECT s.submission_id, u.name AS student, DATE_FORMAT(s.submission_date, '%d-%b-%Y') AS submitted
FROM submissions s
JOIN users u ON s.student_id = u.user_id
WHERE s.assignment_id = 201
ORDER BY s.submission_date;

-- Q10. Students with no submissions yet (for any assignment)
SELECT u.user_id, u.name
FROM users u
LEFT JOIN submissions s ON u.user_id = s.student_id
WHERE u.role = 'student' AND s.submission_id IS NULL
ORDER BY u.name;

-- Q11. Count enrollments per course
SELECT c.course_code, c.course_name, COUNT(e.enrollment_id) AS total_enrolled
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_code, c.course_name
ORDER BY total_enrolled DESC;

-- Q12. Count submissions per assignment
SELECT a.assignment_id, a.title, COUNT(s.submission_id) AS total_submissions
FROM assignments a
LEFT JOIN submissions s ON a.assignment_id = s.assignment_id
GROUP BY a.assignment_id, a.title
ORDER BY total_submissions DESC;

-- Q13. Average marks per assignment (graded only)
SELECT a.assignment_id, a.title, ROUND(AVG(g.marks), 2) AS avg_marks
FROM assignments a
JOIN submissions s ON a.assignment_id = s.assignment_id
JOIN grades g ON s.submission_id = g.submission_id
GROUP BY a.assignment_id, a.title
ORDER BY avg_marks DESC;

-- Q14. Students sorted by highest average marks
SELECT u.user_id, u.name, ROUND(AVG(g.marks), 2) AS avg_marks
FROM users u
JOIN submissions s ON u.user_id = s.student_id
JOIN grades g ON s.submission_id = g.submission_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.name
ORDER BY avg_marks DESC;

-- Q15. Show usernames in upper case and email prefix
SELECT UPPER(username) AS upper_user, SUBSTRING_INDEX(email, '@', 1) AS email_prefix
FROM users;

-- Q16. Assignment titles (first 20 chars) and course code
SELECT SUBSTRING(a.title, 1, 20) AS short_title, c.course_code
FROM assignments a
JOIN courses c ON a.course_id = c.course_id
ORDER BY a.title;

-- Q17. Days left until assignment due date
SELECT assignment_id, title, DATEDIFF(due_date, NOW()) AS days_left
FROM assignments
ORDER BY days_left;

-- Q18. Days between enrollment date and first submission (if any)
SELECT u.user_id, u.name, MIN(DATEDIFF(s.submission_date, e.enrollment_date)) AS days_to_submit
FROM enrollments e
JOIN users u ON e.student_id = u.user_id
LEFT JOIN submissions s ON s.student_id = u.user_id
GROUP BY u.user_id, u.name
ORDER BY days_to_submit;

-- Q19. Display submission dates in multiple formats
SELECT submission_id,
       DATE_FORMAT(submission_date, '%d-%b-%Y') AS format1,
       DATE_FORMAT(submission_date, '%d/%m/%Y') AS format2,
       DATE_FORMAT(submission_date, '%W, %M %d %Y') AS format3
FROM submissions;

-- Q20. Replace NULL feedback with text
SELECT grade_id,
       IFNULL(feedback, 'No feedback') AS feedback,
       marks
FROM grades
ORDER BY grade_id;
