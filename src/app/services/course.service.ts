//  ====================
//      Course Service
// ====================

import { ICourse } from "../interfaces/course.interface";
import { CustomAppError } from "../errors/customError";
import { prisma } from "../../lib/prisma";
import redis from "../../lib/redis";

// ============================== CREATE Course ==============================
const createCourse = async (payload: ICourse) => {
  try {
    const {
      title,
      description,
      categoryId,
      instructorId,
      previewVideo,
      price,
      thumbnail,
    } = payload;

    return await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        instructorId,
        previewVideo,
        price,
        thumbnail,
      } as any,
    });
  } catch (error: any) {
    console.error("❌ Error creating course:", error.message);
    throw new Error("Course creation failed");
  }
};

// ============================== GET ALL Courses ==============================
const getAllCourses = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check cache first
  const cacheKey = `courses:${page}:${limit}:${query.search}:${query.category}:${query.sort}`;
  const cachedData = await redis.get(cacheKey);
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const where: any = {};

  // Filter By Publish Status
  if (query.instructorId && query.instructorId !== 'undefined') {
    where.instructorId = query.instructorId;
  } else if (query.showAll === 'true') {
    // Admin or specific view: show everything
  } else {
    // Public view: only show published
    where.isPublished = true;
  }

  // Optimized Search
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // Category Filter
  if (query.category) {
    where.categoryId = query.category;
  }

  // Sort Logic
  let orderBy: any = { createdAt: "desc" };
  if (query.sort) {
    if (query.sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else {
      const [field, order] = query.sort.split(":");
      const allowedFields = ["price", "createdAt", "title"];
      if (allowedFields.includes(field)) {
        orderBy = { [field]: order === "desc" ? "desc" : "asc" };
      }
    }
  }

  // Database Query (Optimized Select)
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        thumbnail: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        instructor: { select: { name: true, avatar: true } },
        _count: { select: { enrolledUsers: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const result = {
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  // Cache result
  await redis.setex(cacheKey, 300, JSON.stringify(result));
  return result;
};

// ============================== GET Course By ID ==============================
const getCourseById = async (id: string, userId?: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      instructor: { select: { name: true, avatar: true } },
      modules: {
        include: {
          assignments: true,
          lessons: { orderBy: { order: 'asc' } }
        },
        orderBy: { order: 'asc' }
      },
      _count: { select: { enrolledUsers: true } },
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!course) {
    throw new CustomAppError(404, "Course not found in our records");
  }

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } }
    });
    isEnrolled = !!enrollment;
  }

  return { ...course, isEnrolled };
};

// ============================== UPDATE Course ==============================
const updateCourse = async (id: string, payload: Partial<ICourse>) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new CustomAppError(404, "Unable to update: Course not found");
  }

  return await prisma.course.update({
    where: { id },
    data: payload as any,
    include: { category: true } as any
  });
};

// ============================== TOGGLE Publish Status ==============================
const togglePublish = async (id: string) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new CustomAppError(404, "Unable to toggle: Course not found");
  }

  const result = await prisma.course.update({
    where: { id },
    data: { isPublished: !existing.isPublished } as any,
  });

  await redis.del(`courses:${id}`);
  return result;
};

// ============================== DELETE Course ==============================
const deleteCourse = async (id: string) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new CustomAppError(404, "Unable to delete: Course not found");
  }

  await prisma.course.delete({ where: { id } });
  await redis.del(`courses:${id}`);
  return { message: "Course has been successfully deleted from the server" };
};

// ============================== MARK Lesson Completed ==============================
const completeLesson = async (userId: string, courseId: string, lessonId: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });

  if (!enrollment) {
    throw new CustomAppError(403, "Access denied: You are not enrolled in this course");
  }

  await prisma.completedLesson.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId },
    update: {}
  });

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastActivity: new Date() }
  });
};

// ============================== GET My Enrolled Courses ==============================
const getMyCourses = async (userId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, avatar: true } },
          modules: {
            include: {
              lessons: {
                include: {
                  completedByUsers: { where: { userId } }
                }
              },
            },
          },
        },
      },
    },
    orderBy: { lastActivity: "desc" },
  });

  return enrollments.map((enrollment) => {
    let totalLessons = 0;
    let completedLessonsCount = 0;

    enrollment.course.modules?.forEach((mod) => {
      totalLessons += mod.lessons?.length || 0;
      mod.lessons?.forEach((lesson) => {
        if (lesson.completedByUsers && lesson.completedByUsers.length > 0) {
          completedLessonsCount++;
        }
      });
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

    return {
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      lastActivity: enrollment.lastActivity,
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      thumbnail: enrollment.course.thumbnail,
      price: enrollment.course.price,
      instructorId: enrollment.course.instructorId,
      instructor: enrollment.course.instructor,
      isPublished: enrollment.course.isPublished,
      categoryId: enrollment.course.categoryId,
      totalModules: enrollment.course.modules?.length || 0,
      totalLessons,
      completedLessonsCount,
      progressPercentage,
    };
  });
};

// ============================== GET Recommendations ==============================
const getRecommendations = async (userId: string) => {
  try {
    const userEnrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: { include: { category: true } } },
    });

    const categories = userEnrollments.map((e) => e.course.category?.name).filter(Boolean);
    
    return await prisma.course.findMany({
      where: {
        category: { name: { in: categories as string[] } },
        enrolledUsers: { none: { userId } }
      },
      take: 3,
      include: { category: true, instructor: { select: { name: true } } }
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    throw error;
  }
};

export const courseService = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
  completeLesson,
  togglePublish,
  getRecommendations
};
