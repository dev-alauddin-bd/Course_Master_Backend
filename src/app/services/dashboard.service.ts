//  ====================
//    Dashboard Service
// ====================

import { prisma } from "../../lib/prisma";
import { IUser, UserRole } from "../interfaces/user.interface";

export const dashboardService = {
  // ============================== GET Dashboard Analytics ==============================
  async getDashboardAnalytics(user: IUser) {
    const role = user.role as UserRole;
    const userId = user.id;

    // ------------ ADMINISTRATOR ANALYTICS ------------
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

      const totalRevenue = coursesData.reduce((sum, course) => sum + (course.price * course._count.enrolledUsers), 0);
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
        message: "Full administrative overview generated"
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
        prisma.lesson.count({ where: { module: { course: { instructorId: userId } } } }),
        prisma.enrollment.count({ where: { course: { instructorId: userId } } })
      ]);

      const myRevenue = myCourses.reduce((sum, course) => sum + (course.price * course._count.enrolledUsers), 0);
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

    // ------------ STUDENT ANALYTICS ------------
    if (role === UserRole.STUDENT) {
      const [myEnrolledCount, totalCompletedLessons, pendingAssignments, myEnrollments] = await Promise.all([
        prisma.enrollment.count({ where: { userId } }),
        prisma.completedLesson.count({ where: { userId } }),
        prisma.assignment.count({
          where: { module: { course: { enrolledUsers: { some: { userId } } } } }
        }),
        prisma.enrollment.findMany({
          where: { userId },
          select: { 
            courseId: true,
            course: { 
              select: { 
                id: true,
                title: true,
                modules: { 
                  select: { 
                    id: true,
                    lessons: { select: { id: true } } 
                  } 
                } 
              } 
            } 
          }
        })
      ]);

      // Fetch all completed lesson IDs for this user in one go to avoid N+1
      const completedLessonRecords = await prisma.completedLesson.findMany({
        where: { userId },
        select: { lessonId: true }
      });
      const completedLessonIds = new Set(completedLessonRecords.map(r => r.lessonId));

      let completedCoursesCount = 0;
      for (const enrollment of myEnrollments) {
        const lessons = enrollment.course.modules.flatMap(m => m.lessons);
        const totalLessonsInCourse = lessons.length;
        
        if (totalLessonsInCourse > 0) {
          const completedInThisCourse = lessons.filter(l => completedLessonIds.has(l.id)).length;
          if (completedInThisCourse === totalLessonsInCourse) {
            completedCoursesCount++;
          }
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
