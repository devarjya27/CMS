-- ============================================================
-- CMS PROJECT: STORED PROCEDURES & FUNCTIONS (MySQL 8.0)
-- ============================================================

USE cms_db;

DROP PROCEDURE IF EXISTS enroll_student;
DROP PROCEDURE IF EXISTS submit_assignment;
DROP PROCEDURE IF EXISTS grade_submission;
DROP PROCEDURE IF EXISTS print_course_summary;
DROP PROCEDURE IF EXISTS quick_enroll;
DROP PROCEDURE IF EXISTS total_marks_awarded;
DROP PROCEDURE IF EXISTS pending_grades;
DROP FUNCTION IF EXISTS get_student_avg;
DROP FUNCTION IF EXISTS get_course_stats;
DROP FUNCTION IF EXISTS is_enrolled;

DELIMITER $$

-- ------------------------------------------------------------
-- Procedure: enroll_student
-- ------------------------------------------------------------
CREATE PROCEDURE enroll_student(IN p_course_id INT, IN p_student_id INT)
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = p_student_id AND role = 'student') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student not found or invalid role';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM courses WHERE course_id = p_course_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course not found';
  END IF;

  IF EXISTS (SELECT 1 FROM enrollments WHERE course_id = p_course_id AND student_id = p_student_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student already enrolled';
  END IF;

  INSERT INTO enrollments (course_id, student_id, enrollment_date)
  VALUES (p_course_id, p_student_id, CURRENT_DATE);
END$$

-- ------------------------------------------------------------
-- Procedure: submit_assignment
-- ------------------------------------------------------------
CREATE PROCEDURE submit_assignment(
  IN p_assignment_id INT,
  IN p_student_id INT,
  IN p_submission_text TEXT
)
BEGIN
  DECLARE v_course_id INT;
  DECLARE v_due_date DATETIME;

  SELECT course_id, due_date INTO v_course_id, v_due_date
  FROM assignments WHERE assignment_id = p_assignment_id;

  IF v_course_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Assignment not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = v_course_id AND student_id = p_student_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student not enrolled in course';
  END IF;

  IF NOW() > v_due_date THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Late submission not allowed';
  END IF;

  IF EXISTS (SELECT 1 FROM submissions WHERE assignment_id = p_assignment_id AND student_id = p_student_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Submission already exists';
  END IF;

  INSERT INTO submissions (assignment_id, student_id, submission_text, submission_date)
  VALUES (p_assignment_id, p_student_id, p_submission_text, NOW());
END$$

-- ------------------------------------------------------------
-- Procedure: grade_submission
-- ------------------------------------------------------------
CREATE PROCEDURE grade_submission(
  IN p_submission_id INT,
  IN p_marks DECIMAL(5,2),
  IN p_feedback TEXT,
  IN p_graded_by INT
)
BEGIN
  DECLARE v_assignment_id INT;
  DECLARE v_max_marks INT;

  SELECT s.assignment_id INTO v_assignment_id
  FROM submissions s WHERE s.submission_id = p_submission_id;

  IF v_assignment_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Submission not found';
  END IF;

  SELECT max_marks INTO v_max_marks FROM assignments WHERE assignment_id = v_assignment_id;

  IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = p_graded_by AND role = 'instructor') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Grader must be an instructor';
  END IF;

  IF p_marks < 0 OR p_marks > v_max_marks THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Marks out of range';
  END IF;

  IF EXISTS (SELECT 1 FROM grades WHERE submission_id = p_submission_id) THEN
    UPDATE grades
    SET marks = p_marks,
        feedback = p_feedback,
        graded_by = p_graded_by,
        graded_date = NOW()
    WHERE submission_id = p_submission_id;
  ELSE
    INSERT INTO grades (submission_id, marks, feedback, graded_by, graded_date)
    VALUES (p_submission_id, p_marks, p_feedback, p_graded_by, NOW());
  END IF;
END$$

-- ------------------------------------------------------------
-- Function: get_student_avg
-- ------------------------------------------------------------
CREATE FUNCTION get_student_avg(p_student_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
  DECLARE v_avg DECIMAL(5,2);
  SELECT ROUND(AVG(g.marks), 2) INTO v_avg
  FROM grades g
  JOIN submissions s ON g.submission_id = s.submission_id
  WHERE s.student_id = p_student_id;
  RETURN IFNULL(v_avg, 0.00);
END$$

-- ------------------------------------------------------------
-- Function: get_course_stats
-- ------------------------------------------------------------
CREATE FUNCTION get_course_stats(p_course_id INT)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
  DECLARE v_enrolled INT DEFAULT 0;
  DECLARE v_submitted INT DEFAULT 0;
  DECLARE v_total INT DEFAULT 0;
  DECLARE v_completion DECIMAL(5,2) DEFAULT 0;

  SELECT COUNT(*) INTO v_enrolled FROM enrollments WHERE course_id = p_course_id;
  SELECT COUNT(*) INTO v_total FROM assignments WHERE course_id = p_course_id;
  SELECT COUNT(s.submission_id) INTO v_submitted
  FROM submissions s
  JOIN assignments a ON s.assignment_id = a.assignment_id
  WHERE a.course_id = p_course_id;

  IF v_enrolled > 0 AND v_total > 0 THEN
    SET v_completion = ROUND((v_submitted / (v_enrolled * v_total)) * 100, 2);
  END IF;
  RETURN CONCAT('enrolled=', v_enrolled, ', completion=', v_completion, '%');
END$$

-- ------------------------------------------------------------
-- Function: is_enrolled
-- ------------------------------------------------------------
CREATE FUNCTION is_enrolled(p_student_id INT, p_course_id INT)
RETURNS CHAR(3)
DETERMINISTIC
BEGIN
  RETURN IF(EXISTS(SELECT 1 FROM enrollments WHERE student_id = p_student_id AND course_id = p_course_id), 'YES', 'NO');
END$$

-- ------------------------------------------------------------
-- Extra Procedures (cms_procedures)
-- ------------------------------------------------------------
CREATE PROCEDURE print_course_summary(IN p_course_id INT)
BEGIN
  SELECT c.course_code, c.course_name, u.name AS instructor,
         COUNT(DISTINCT e.student_id) AS total_students,
         COUNT(DISTINCT a.assignment_id) AS total_assignments
  FROM courses c
  JOIN users u ON c.instructor_id = u.user_id
  LEFT JOIN enrollments e ON c.course_id = e.course_id
  LEFT JOIN assignments a ON c.course_id = a.course_id
  WHERE c.course_id = p_course_id
  GROUP BY c.course_id, c.course_code, c.course_name, u.name;
END$$

CREATE PROCEDURE quick_enroll(IN p_student_id INT, IN p_course_code VARCHAR(20))
BEGIN
  DECLARE v_course_id INT;
  SELECT course_id INTO v_course_id FROM courses WHERE course_code = p_course_code;
  IF v_course_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course code not found';
  END IF;
  CALL enroll_student(v_course_id, p_student_id);
END$$

CREATE PROCEDURE total_marks_awarded(IN p_course_id INT)
BEGIN
  SELECT c.course_code,
         SUM(g.marks) AS total_marks
  FROM grades g
  JOIN submissions s ON g.submission_id = s.submission_id
  JOIN assignments a ON s.assignment_id = a.assignment_id
  JOIN courses c ON a.course_id = c.course_id
  WHERE c.course_id = p_course_id
  GROUP BY c.course_code;
END$$

CREATE PROCEDURE pending_grades(IN p_course_id INT)
BEGIN
  SELECT s.submission_id, u.name AS student, a.title AS assignment, s.submission_date
  FROM submissions s
  JOIN assignments a ON s.assignment_id = a.assignment_id
  JOIN users u ON s.student_id = u.user_id
  LEFT JOIN grades g ON s.submission_id = g.submission_id
  WHERE a.course_id = p_course_id AND g.grade_id IS NULL
  ORDER BY s.submission_date;
END$$

-- ------------------------------------------------------------
-- Cursors
-- ------------------------------------------------------------
CREATE PROCEDURE cursor_list_submissions(IN p_assignment_id INT)
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_student VARCHAR(100);
  DECLARE v_sub_date DATETIME;
  DECLARE v_marks DECIMAL(5,2);

  DECLARE cur1 CURSOR FOR
    SELECT u.name, s.submission_date, g.marks
    FROM submissions s
    JOIN users u ON s.student_id = u.user_id
    LEFT JOIN grades g ON s.submission_id = g.submission_id
    WHERE s.assignment_id = p_assignment_id
    ORDER BY s.submission_date;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur1;
  read_loop: LOOP
    FETCH cur1 INTO v_student, v_sub_date, v_marks;
    IF done = 1 THEN LEAVE read_loop; END IF;
    SELECT v_student AS student_name, v_sub_date AS submitted_on, v_marks AS marks;
  END LOOP;
  CLOSE cur1;
END$$

CREATE PROCEDURE cursor_course_assignment_status(IN p_course_id INT)
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_assignment_id INT;
  DECLARE v_title VARCHAR(200);
  DECLARE v_submitted INT;

  DECLARE cur2 CURSOR FOR
    SELECT a.assignment_id, a.title,
           (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.assignment_id) AS submitted
    FROM assignments a
    WHERE a.course_id = p_course_id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur2;
  read_loop: LOOP
    FETCH cur2 INTO v_assignment_id, v_title, v_submitted;
    IF done = 1 THEN LEAVE read_loop; END IF;
    SELECT v_assignment_id AS assignment_id, v_title AS title, v_submitted AS submitted_count;
  END LOOP;
  CLOSE cur2;
END$$

CREATE PROCEDURE cursor_scale_marks(IN p_course_id INT, IN p_factor DECIMAL(5,2))
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_grade_id INT;
  DECLARE v_marks DECIMAL(5,2);

  DECLARE cur3 CURSOR FOR
    SELECT g.grade_id, g.marks
    FROM grades g
    JOIN submissions s ON g.submission_id = s.submission_id
    JOIN assignments a ON s.assignment_id = a.assignment_id
    WHERE a.course_id = p_course_id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur3;
  read_loop: LOOP
    FETCH cur3 INTO v_grade_id, v_marks;
    IF done = 1 THEN LEAVE read_loop; END IF;
    UPDATE grades SET marks = v_marks * p_factor WHERE grade_id = v_grade_id;
  END LOOP;
  CLOSE cur3;
END$$

DELIMITER ;
