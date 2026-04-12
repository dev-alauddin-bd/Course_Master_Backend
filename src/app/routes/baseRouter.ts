// ==============================
// BASE ROUTER
// ==============================
import { Router } from "express";
import { authRouter } from "./auth.route";
import { courseRouter } from "./course.route";
import { categoryRouter } from "./category.route";
import { moduleRouter } from "./module.routes";
import { assignmentRouter } from "./assignment.routes";
import { dashboardRouter } from "./dashboard.route";
import { userRouter } from "./user.route";
import { reviewRoutes } from "./review.route";
import { paymentRouter } from "./payment.route";
import { enrollRouter } from "./enroll.route";
import { lessonRouter } from "./lesson.route";
import { studentSubmissionRouter } from "./studentSubmission.route";

const router = Router();

// Define all main route paths and their corresponding routers
const routes = [
  { path: "/auth", handler: authRouter },          // Auth routes: signup, login, refresh token
  { path: "/courses", handler: courseRouter },     // Courses routes: CRUD, enroll, complete lessons
  { path: "/categories", handler: categoryRouter },// Categories routes: CRUD
  { path: "/modules", handler: moduleRouter },     // Modules & Lessons routes: add, get, update
  { path: "/lessons", handler: lessonRouter },     // Dedicated Lesson routes
  { path: "/enrollments", handler: enrollRouter }, // Enrollment management
  { path: "/assignments", handler: assignmentRouter }, // Assignment routes: create assignments
  { path: "/reviews", handler: reviewRoutes },     // Testimonials/Reviews


  { path: "/dashboard", handler: dashboardRouter },
  { path: "/users", handler: userRouter },
  { path: "/submissions", handler: studentSubmissionRouter },
  { path: "/payments", handler: paymentRouter },

];

// Attach each router to its path
routes.forEach((route) => {
  router.use(route.path, route.handler);
});

// Export the base router to use in app.ts or server.ts
export const baseRouter : Router= router;
