-- ============================================================
-- CMS PROJECT: TRIGGERS (as per CMS_Report)
-- ============================================================

USE cms_db;

DROP TRIGGER IF EXISTS trg_check_enrollment;
DROP TRIGGER IF EXISTS trg_check_deadline;
DROP TRIGGER IF EXISTS trg_validate_marks_ins;
DROP TRIGGER IF EXISTS trg_validate_marks_upd;
DROP TRIGGER IF EXISTS trg_audit_grade_changes_ins;
DROP TRIGGER IF EXISTS trg_audit_grade_changes_upd;
DROP TRIGGER IF EXISTS trg_audit_grade_changes_del;
DROP TRIGGER IF EXISTS trg_check_enrollment_sub;
DROP TRIGGER IF EXISTS trg_prevent_dup_sub;

DELIMITER $$

-- 1) Prevent duplicate enrollment; ensure role = student
CREATE TRIGGER trg_check_enrollment
BEFORE INSERT ON enrollments
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = NEW.student_id AND role = 'student') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only students can enroll';
  END IF;
  IF EXISTS (SELECT 1 FROM enrollments WHERE course_id = NEW.course_id AND student_id = NEW.student_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate enrollment';
  END IF;
END$$

-- 2) Reject submission if after due_date
CREATE TRIGGER trg_check_deadline
BEFORE INSERT ON submissions
FOR EACH ROW
BEGIN
  DECLARE v_due DATETIME;
  SELECT due_date INTO v_due FROM assignments WHERE assignment_id = NEW.assignment_id;
  IF v_due IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Assignment not found';
  END IF;
  IF NEW.submission_date > v_due THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Late submission not allowed';
  END IF;
END$$

-- 3) Ensure marks <= max_marks (BEFORE INSERT)
CREATE TRIGGER trg_validate_marks_ins
BEFORE INSERT ON grades
FOR EACH ROW
BEGIN
  DECLARE v_max INT;
  SELECT a.max_marks INTO v_max
  FROM assignments a
  JOIN submissions s ON s.assignment_id = a.assignment_id
  WHERE s.submission_id = NEW.submission_id;
  IF v_max IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Submission not found';
  END IF;
  IF NEW.marks < 0 OR NEW.marks > v_max THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Marks exceed max_marks';
  END IF;
END$$

-- 3) Ensure marks <= max_marks (BEFORE UPDATE)
CREATE TRIGGER trg_validate_marks_upd
BEFORE UPDATE ON grades
FOR EACH ROW
BEGIN
  DECLARE v_max INT;
  SELECT a.max_marks INTO v_max
  FROM assignments a
  JOIN submissions s ON s.assignment_id = a.assignment_id
  WHERE s.submission_id = NEW.submission_id;
  IF v_max IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Submission not found';
  END IF;
  IF NEW.marks < 0 OR NEW.marks > v_max THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Marks exceed max_marks';
  END IF;
END$$

-- 4) Grade audit triggers (INSERT/UPDATE/DELETE)
CREATE TRIGGER trg_audit_grade_changes_ins
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
  INSERT INTO grade_audit (grade_id, submission_id, operation, old_marks, new_marks, old_feedback, new_feedback)
  VALUES (NEW.grade_id, NEW.submission_id, 'INSERT', NULL, NEW.marks, NULL, NEW.feedback);
END$$

CREATE TRIGGER trg_audit_grade_changes_upd
AFTER UPDATE ON grades
FOR EACH ROW
BEGIN
  INSERT INTO grade_audit (grade_id, submission_id, operation, old_marks, new_marks, old_feedback, new_feedback)
  VALUES (NEW.grade_id, NEW.submission_id, 'UPDATE', OLD.marks, NEW.marks, OLD.feedback, NEW.feedback);
END$$

CREATE TRIGGER trg_audit_grade_changes_del
AFTER DELETE ON grades
FOR EACH ROW
BEGIN
  INSERT INTO grade_audit (grade_id, submission_id, operation, old_marks, new_marks, old_feedback, new_feedback)
  VALUES (OLD.grade_id, OLD.submission_id, 'DELETE', OLD.marks, NULL, OLD.feedback, NULL);
END$$

-- 5) Validate that submitting student is enrolled in the course
CREATE TRIGGER trg_check_enrollment_sub
BEFORE INSERT ON submissions
FOR EACH ROW FOLLOWS trg_check_deadline
BEGIN
  DECLARE v_course_id INT;
  SELECT course_id INTO v_course_id FROM assignments WHERE assignment_id = NEW.assignment_id;
  IF v_course_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Assignment not found';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = v_course_id AND student_id = NEW.student_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student not enrolled in course';
  END IF;
END$$

-- 6) Prevent duplicate submissions for same assignment
CREATE TRIGGER trg_prevent_dup_sub
BEFORE INSERT ON submissions
FOR EACH ROW FOLLOWS trg_check_enrollment_sub
BEGIN
  IF EXISTS (SELECT 1 FROM submissions WHERE assignment_id = NEW.assignment_id AND student_id = NEW.student_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate submission';
  END IF;
END$$

DELIMITER ;
