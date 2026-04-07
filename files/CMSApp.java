/**
 * CSS 2212 DBS LAB MINI PROJECT
 * Simple Course Management System (CMS)
 * FILE: Java JDBC DB Connectivity
 *
 * HOW TO COMPILE & RUN:
 *   javac -cp .:mysql-connector-j.jar CMSApp.java
 *   java  -cp .:mysql-connector-j.jar CMSApp
 */

import java.sql.*;
import java.util.Scanner;

public class CMSApp {

    private static final String DB_URL  = "jdbc:mysql://localhost:3306/cms_db";
    private static final String DB_USER = "cms_user";
    private static final String DB_PASS = "cms_pass";

    private static Connection conn = null;
    private static final Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            conn.setAutoCommit(false);
            System.out.println("Connected to CMS database.");
        } catch (Exception e) {
            System.out.println("Connection failed: " + e.getMessage());
            return;
        }

        boolean running = true;
        while (running) {
            printMenu();
            int choice = readInt("Enter choice: ");
            switch (choice) {
                case 1: listUsers(); break;
                case 2: listCourses(); break;
                case 3: enrollStudent(); break;
                case 4: submitAssignment(); break;
                case 5: gradeSubmission(); break;
                case 6: studentAverage(); break;
                case 7: courseSummary(); break;
                case 0: running = false; break;
                default: System.out.println("Invalid option."); break;
            }
        }

        closeConnection();
        System.out.println("Goodbye!");
    }

    static void printMenu() {
        System.out.println("\n========== SIMPLE CMS ==========");
        System.out.println("  1. List Users");
        System.out.println("  2. List Courses");
        System.out.println("  3. Enroll Student");
        System.out.println("  4. Submit Assignment");
        System.out.println("  5. Grade Submission");
        System.out.println("  6. Student Average Marks");
        System.out.println("  7. Course Summary");
        System.out.println("  0. Exit");
        System.out.println("================================");
    }

    static void listUsers() {
        String sql = "SELECT user_id, username, role, name, email FROM users ORDER BY role, username";
        try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            System.out.printf("%-6s %-12s %-10s %-20s %-25s%n", "ID", "Username", "Role", "Name", "Email");
            while (rs.next()) {
                System.out.printf("%-6d %-12s %-10s %-20s %-25s%n",
                        rs.getInt("user_id"),
                        rs.getString("username"),
                        rs.getString("role"),
                        rs.getString("name"),
                        rs.getString("email"));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void listCourses() {
        String sql = "SELECT c.course_id, c.course_code, c.course_name, u.name AS instructor " +
                     "FROM courses c JOIN users u ON c.instructor_id = u.user_id ORDER BY c.course_code";
        try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            System.out.printf("%-6s %-10s %-25s %-20s%n", "ID", "Code", "Course", "Instructor");
            while (rs.next()) {
                System.out.printf("%-6d %-10s %-25s %-20s%n",
                        rs.getInt("course_id"),
                        rs.getString("course_code"),
                        rs.getString("course_name"),
                        rs.getString("instructor"));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void enrollStudent() {
        int courseId = readInt("Course ID: ");
        int studentId = readInt("Student ID: ");
        try (CallableStatement cs = conn.prepareCall("{CALL enroll_student(?, ?)}")) {
            cs.setInt(1, courseId);
            cs.setInt(2, studentId);
            cs.execute();
            conn.commit();
            System.out.println("Student enrolled.");
        } catch (SQLException e) {
            rollbackQuiet();
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void submitAssignment() {
        int assignmentId = readInt("Assignment ID: ");
        int studentId = readInt("Student ID: ");
        String text = readString("Submission Text: ");
        try (CallableStatement cs = conn.prepareCall("{CALL submit_assignment(?, ?, ?)}")) {
            cs.setInt(1, assignmentId);
            cs.setInt(2, studentId);
            cs.setString(3, text);
            cs.execute();
            conn.commit();
            System.out.println("Submission recorded.");
        } catch (SQLException e) {
            rollbackQuiet();
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void gradeSubmission() {
        int submissionId = readInt("Submission ID: ");
        double marks = readDouble("Marks: ");
        int gradedBy = readInt("Instructor ID: ");
        String feedback = readString("Feedback (optional): ");
        try (CallableStatement cs = conn.prepareCall("{CALL grade_submission(?, ?, ?, ?)}")) {
            cs.setInt(1, submissionId);
            cs.setDouble(2, marks);
            cs.setString(3, feedback);
            cs.setInt(4, gradedBy);
            cs.execute();
            conn.commit();
            System.out.println("Grade saved.");
        } catch (SQLException e) {
            rollbackQuiet();
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void studentAverage() {
        int studentId = readInt("Student ID: ");
        String sql = "SELECT get_student_avg(?) AS avg_marks";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                System.out.println("Average marks: " + rs.getDouble("avg_marks"));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void courseSummary() {
        int courseId = readInt("Course ID: ");
        try (CallableStatement cs = conn.prepareCall("{CALL print_course_summary(?)}")) {
            cs.setInt(1, courseId);
            ResultSet rs = cs.executeQuery();
            if (rs.next()) {
                System.out.println("Course: " + rs.getString("course_code") + " - " + rs.getString("course_name"));
                System.out.println("Instructor: " + rs.getString("instructor"));
                System.out.println("Students: " + rs.getInt("total_students"));
                System.out.println("Assignments: " + rs.getInt("total_assignments"));
            } else {
                System.out.println("Course not found.");
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    static int readInt(String prompt) {
        System.out.print(prompt);
        return Integer.parseInt(sc.nextLine().trim());
    }

    static double readDouble(String prompt) {
        System.out.print(prompt);
        return Double.parseDouble(sc.nextLine().trim());
    }

    static String readString(String prompt) {
        System.out.print(prompt);
        return sc.nextLine();
    }

    static void rollbackQuiet() {
        try { conn.rollback(); } catch (SQLException ignored) {}
    }

    static void closeConnection() {
        try { if (conn != null) conn.close(); } catch (SQLException ignored) {}
    }
}
