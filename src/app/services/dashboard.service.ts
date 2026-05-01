
import { prisma } from "../../lib/prisma";
import { IUser, UserRole } from "../interfaces/user.interface";

/**
 * Service to aggregate analytical insights and statistics 
 * displayed in the user's personal dashboard.
 */
export const dashboardService = {
  /**
   * Aggregate core statistics for the authenticated user based on their role
   * 
   * Provides different analytical views for Administrators (overall platform metrics) 
   * versus Students (personal progress records).
   * 
   * @param user - Object representing the currently logged-in user
   * @returns Detailed statistics tailored to the specific user role
   */
  async getDashboardAnalytics(user: IUser) {
    const role = user.role as UserRole;
    const userId = user.id;

    // ------------ ADMINISTRATOR ANALYTICS OVERVIEW ------------
    if (role === UserRole.ADMIN) {
      const [totalStudents, totalInstructors, totalCourses, coursesData, totalEnrollments] = await Promise.all([
        prisma.user.count({ where: { role: UserRole.STUDENT } }),
        prisma.user.count({ where: { role: UserRole.INSTRUCTOR } }),
        prisma.course.count(),
        prisma.course.findMany({
          select: { price: true, _count: { select: { enrolledUsers: true } } }
        }),
        prisma.enrollment.count()
      ]);

      const totalRevenue = coursesData.reduce((sum, course) => {
        return sum + (course.price * course._count.enrolledUsers);
      }, 0);

      const engagementRate = totalStudents > 0 
        ? Math.min(Math.round((totalEnrollments / totalStudents) * 100), 100)
        : 0;

      return {
        role,
        statistics: {
          totalStudents,
          totalInstructors,
          totalCourses,
          totalRevenue,
          totalEnrollments,
          engagementRate
        },
        message: "Full administrative overview generated for dashboard"
      };
    }

    // ------------ INSTRUCTOR ANALYTICS ------------
    if (role === UserRole.INSTRUCTOR) {
      const [myCourses, myCoursesCount, totalLessons, totalEnrolledData] = await Promise.all([
        prisma.course.findMany({
          where: { instructorId: userId },
          select: { 
            id: true, 
            price: true, 
            _count: { select: { enrolledUsers: true } } 
          }
        }),
        prisma.course.count({ where: { instructorId: userId } }),
        prisma.lesson.count({ 
          where: { module: { course: { instructorId: userId } } } 
        }),
        prisma.enrollment.count({
          where: { course: { instructorId: userId } }
        })
      ]);

      const myRevenue = myCourses.reduce((sum, course) => {
        return sum + (course.price * course._count.enrolledUsers);
      }, 0);

      const uniqueStudents = await prisma.user.count({
        where: { enrolledCourses: { some: { course: { instructorId: userId } } } }
      });

      const engagementRate = uniqueStudents > 0 
        ? Math.min(Math.round((totalEnrolledData / uniqueStudents) * 100), 100)
        : 0;

      return {
        role,
        statistics: {
          totalCourses: myCoursesCount,
          totalStudents: uniqueStudents,
          totalEnrollments: totalEnrolledData,
          totalRevenue: myRevenue,
          totalLessons: totalLessons,
          engagementRate
        },
        message: "Instructor performance overview ready"
      };
    }

    // ------------ PERSONALIZED STUDENT DASHBOARD ------------
    if (role === UserRole.STUDENT) {
      const [myEnrolledCount, totalCompletedLessons, pendingAssignments] = await Promise.all([
        prisma.enrollment.count({ where: { userId } }),
        prisma.completedLesson.count({ where: { userId } }),
        prisma.assignment.count({
          where: { module: { course: { enrolledUsers: { some: { userId } } } } }
        })
      ]);
      const myEnrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: { course: { include: { modules: { include: { lessons: { select: { id: true } } } } } } }
      });

      let completedCoursesCount = 0;
      for (const enrollment of myEnrollments) {
        const totalLessonsInCourse = enrollment.course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
        const completedInThisCourse = await prisma.completedLesson.count({
          where: { 
            userId, 
            lesson: { module: { courseId: enrollment.courseId } } 
          }
        });
        if (totalLessonsInCourse > 0 && completedInThisCourse === totalLessonsInCourse) {
          completedCoursesCount++;
        }
      }

      return {
        role,
        statistics: {
          enrolledCourses: myEnrolledCount,
          completedCourses: completedCoursesCount,
          lessonsCompleted: totalCompletedLessons,
          pendingTasks: pendingAssignments
        },
        message: "Student activity dashboard snapshot ready"
      };
    }

    return {
      role,
      message: "No specific analytical data is available for this role"
    };
  },
};
