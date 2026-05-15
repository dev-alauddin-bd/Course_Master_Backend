//  ====================
//    Dashboard Service
// ====================

import { prisma } from "../../lib/prisma";
import {  UserRole } from "../interfaces/user.interface";

export const dashboardService = {
  // ============================== GET Admin Analytics ==============================
  async getAdminAnalytics() {
    const [totalStudents, totalInstructors, totalCourses, totalEnrollments, revenueData] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.user.count({ where: { role: UserRole.INSTRUCTOR } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    const totalRevenue = revenueData._sum.amount || 0;
    const engagementRate = totalStudents > 0 
      ? Math.min(Math.round((totalEnrollments / totalStudents) * 100), 100)
      : 0;

    return {
      role: UserRole.ADMIN,
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
  },

  // ============================== GET Instructor Analytics ==============================
  async getInstructorAnalytics(userId: string) {
    const [myCoursesCount, totalLessons, totalEnrolledData, uniqueStudents, instructorRevenueData] = await Promise.all([
      prisma.course.count({ where: { instructorId: userId } }),
      prisma.lesson.count({ where: { module: { course: { instructorId: userId } } } }),
      prisma.enrollment.count({ where: { course: { instructorId: userId } } }),
      prisma.user.count({
        where: { enrolledCourses: { some: { course: { instructorId: userId } } } }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED',
          course: { instructorId: userId }
        },
        _sum: { amount: true }
      })
    ]);

    const myRevenue = instructorRevenueData._sum.amount || 0;
    const engagementRate = uniqueStudents > 0 
      ? Math.min(Math.round((totalEnrolledData / uniqueStudents) * 100), 100)
      : 0;

    return {
      role: UserRole.INSTRUCTOR,
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
  },

  // ============================== GET Student Analytics ==============================
  async getStudentAnalytics(userId: string) {
    const [myEnrolledCount, totalCompletedLessons, pendingAssignments, myEnrollmentsData] = await Promise.all([

      prisma.enrollment.count({ where: { userId } }),
      prisma.completedLesson.count({ where: { userId } }),
      prisma.assignment.count({
        where: { module: { course: { enrolledUsers: { some: { userId } } } } }
      }),
      prisma.enrollment.findMany({
        where: { userId },
        select: { 
          lastActivity: true,
          course: { 
            select: { 
              id: true,
              title: true,
              thumbnail: true,
              modules: { 
                select: { 
                  lessons: { select: { id: true } } 
                } 
              } 
            } 
          } 
        },
        orderBy: { lastActivity: 'desc' }
      })

    ]);

    const completedLessonRecords = await prisma.completedLesson.findMany({
      where: { userId },
      select: { lessonId: true }
    });
    const completedLessonIds = new Set(completedLessonRecords.map(r => r.lessonId));

    let completedCount = 0;
    let totalProgressSum = 0;
    
    const enrichedEnrollments = myEnrollmentsData.map(enrollment => {
      const lessons = enrollment.course.modules.flatMap(m => m.lessons);
      const totalLessonsInCourse = lessons.length;
      let progressPercentage = 0;
      
      if (totalLessonsInCourse > 0) {
        const completedInThisCourse = lessons.filter(l => completedLessonIds.has(l.id)).length;
        progressPercentage = Math.round((completedInThisCourse / totalLessonsInCourse) * 100);
        if (completedInThisCourse === totalLessonsInCourse) {
          completedCount++;
        }
      } else {
        // If course has no lessons, consider it 100%? Or 0? Let's say 0 for safety or check if it's meant to be completed.
        // Usually, courses have lessons.
      }
      
      totalProgressSum += progressPercentage;
      
      return {
        ...enrollment.course,
        progressPercentage,
        lastActivity: enrollment.lastActivity
      };
    });

    const inProgressCount = myEnrolledCount - completedCount;
    const overallProgressVal = myEnrolledCount > 0 ? Math.round(totalProgressSum / myEnrolledCount) : 0;
    const continueCourses = enrichedEnrollments.slice(0, 4);

    return {
      role: UserRole.STUDENT,
      statistics: {
        totalEnrolled: myEnrolledCount,
        completedCount: completedCount,
        inProgressCount: inProgressCount,
        overallProgressVal: overallProgressVal,
        lessonsCompleted: totalCompletedLessons,
        pendingTasks: pendingAssignments,
        continueCourses: continueCourses
      },
      message: "Student activity dashboard snapshot ready"
    };

  }

};
