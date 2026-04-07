-- ============================================================
-- CMS PROJECT: INSERT SAMPLE DATA (as per CMS_Report)
-- ============================================================

USE cms_db;

-- USERS (5 total: 3 students, 2 instructors)
INSERT INTO users (user_id, username, password, role, name, email) VALUES
(1, 'april', 'pass123', 'instructor', 'Dr. April D''Souza', 'april.dsouza@mit.edu'),
(2, 'rohit', 'pass123', 'instructor', 'Prof. Rohit Nair', 'rohit.nair@mit.edu'),
(3, 'meera', 'pass123', 'student', 'Meera Iyer', 'meera.iyer@mit.edu'),
(4, 'arjun', 'pass123', 'student', 'Arjun Rao', 'arjun.rao@mit.edu'),
(5, 'nisha', 'pass123', 'student', 'Nisha Kulkarni', 'nisha.k@mit.edu');

-- COURSES (3)
INSERT INTO courses (course_id, course_name, course_code, instructor_id) VALUES
(101, 'Database Systems', 'CSS2212', 1),
(102, 'Web Development', 'CSE3012', 2),
(103, 'Data Structures', 'CSE2101', 1);

-- ENROLLMENTS (6 total; each student enrolled in 2 courses)
INSERT INTO enrollments (enrollment_id, course_id, student_id, enrollment_date) VALUES
(1001, 101, 3, '2026-01-12'),
(1002, 102, 3, '2026-01-12'),
(1003, 101, 4, '2026-01-12'),
(1004, 103, 4, '2026-01-12'),
(1005, 102, 5, '2026-01-12'),
(1006, 103, 5, '2026-01-12');

-- ASSIGNMENTS (5: 2 active, 2 past-due, 1 due today)
INSERT INTO assignments (assignment_id, course_id, title, description, due_date, max_marks) VALUES
(201, 101, 'ER Modeling Basics', 'Design ER diagram for a college system.', '2026-04-10 23:59:59', 25), -- active
(202, 101, 'SQL Practice Set', 'Write SQL queries for the schema.', '2026-03-20 23:59:59', 25),        -- past-due
(203, 102, 'HTML/CSS Mini Site', 'Create a responsive landing page.', '2026-04-06 23:59:59', 20),      -- due today
(204, 102, 'React Intro', 'Build a simple SPA with routing.', '2026-04-20 23:59:59', 30),             -- active
(205, 103, 'Stack and Queue Lab', 'Implement stack and queue operations.', '2026-03-10 23:59:59', 30); -- past-due

-- SUBMISSIONS (8 total; all on-time in DB)
INSERT INTO submissions (submission_id, assignment_id, student_id, submission_text, submission_date) VALUES
(301, 201, 3, 'Submitted ER diagram and assumptions.', '2026-04-05 10:00:00'),
(302, 201, 4, 'Attached ER diagram with entities/relations.', '2026-04-06 12:30:00'),
(303, 202, 3, 'SQL queries with joins and aggregates.', '2026-03-15 18:00:00'),
(304, 202, 4, 'SQL queries + notes.', '2026-03-19 09:00:00'),
(305, 203, 3, 'HTML/CSS responsive site.', '2026-04-06 14:00:00'),
(306, 204, 3, 'React SPA with three routes.', '2026-04-08 16:10:00'),
(307, 204, 5, 'React SPA with routing + hooks.', '2026-04-09 11:20:00'),
(308, 205, 5, 'Stack/Queue implementations.', '2026-03-09 15:45:00');

-- (Demo) Late submissions that would be blocked by trigger:
-- INSERT INTO submissions (assignment_id, student_id, submission_text, submission_date)
-- VALUES (202, 3, 'Late submission', '2026-03-25 10:00:00');
-- INSERT INTO submissions (assignment_id, student_id, submission_text, submission_date)
-- VALUES (205, 4, 'Late submission', '2026-03-15 09:00:00');

-- GRADES (5 total; marks 45..98, avg = 74.6)
INSERT INTO grades (grade_id, submission_id, marks, feedback, graded_by, graded_date) VALUES
(401, 301, 98, 'Excellent diagram.', 1, '2026-04-07 10:30:00'),
(402, 302, 85, 'Good work, minor fixes.', 1, '2026-04-07 11:00:00'),
(403, 303, 72, 'Satisfactory.', 1, '2026-03-21 09:00:00'),
(404, 305, 73, NULL, 2, '2026-04-06 18:00:00'),
(405, 308, 45, NULL, 1, '2026-03-11 10:00:00');

COMMIT;
