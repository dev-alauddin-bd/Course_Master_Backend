import {  ICourse } from "../interfaces/course.interface";
import { CustomAppError } from "../errors/customError";
import { prisma } from "../../lib/prisma";
import redis from "../../lib/redis";

/**
 * Create a new course entry in the database
 */
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

    const result = await prisma.course.create({
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

    return result;
  } catch (error: any) {
    console.error("❌ Error creating course:", error.message);
    throw new Error("Course creation failed");
  }
};

/**
 * Retrieve a list of courses with filtering, search, and pagination
 */
// const getAllCourses = async (query: any) => {
//   console.log("🚀 Incoming Query:", query);

//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;
//   const skip = (page - 1) * limit;

//   console.log("📄 Pagination:", { page, limit, skip });

//   const where: any = {};

//   // 🔍 SEARCH DEBUG
//   if (query.search) {
//     console.log("🔎 Search Term:", query.search);

//     where.OR = [
//       {
//         title: {
//           contains: query.search,
//           mode: "insensitive",
//         },
//       },
//     ];
//   }

//   // 🗂 CATEGORY DEBUG
//   if (query.category) {
//     console.log("📚 Category Filter:", query.category);
//     where.categoryId = query.category;
//   }

//   console.log("🧩 WHERE CLAUSE:", where);

//   // 🔥 SORT DEBUG
//   let orderBy: any = { createdAt: "desc" };

//   console.log("📊 Default OrderBy:", orderBy);

//   if (query.sort) {
//     console.log("🎯 Raw Sort Value:", query.sort);

//     if (query.sort === "newest") {
//       orderBy = { createdAt: "desc" };
//       console.log("✨ Applied Sort: newest");
//     } else {
//       const [field, order] = query.sort.split(":");

//       console.log("🔧 Parsed Sort:", { field, order });

//       const allowedFields = ["price", "createdAt", "title"];

//       if (allowedFields.includes(field)) {
//         orderBy = {
//           [field]: order === "desc" ? "desc" : "asc",
//         };

//         console.log("✅ Final OrderBy:", orderBy);
//       } else {
//         console.log("❌ Invalid sort field ignored:", field);
//       }
//     }
//   }

//   console.log("🚀 FINAL ORDERBY:", orderBy);

//   // 🧠 DATABASE CALL DEBUG
//   const [courses, total] = await Promise.all([
//     prisma.course.findMany({
//       where,
//       orderBy,
//       skip,
//       take: limit,
//       include: {
//         category: true,
//         instructor: {
//           select: { name: true, avatar: true },
//         },
//         _count: {
//           select: { enrolledUsers: true },
//         },
//       },
//     }),

//     prisma.course.count({ where }),
//   ]);

//   console.log("📦 COURSES FOUND:", courses.length);
//   console.log("📊 TOTAL COUNT:", total);

//   return {
//     courses,
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//   };
// };


const getAllCourses = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;


  // chek cache first

  const cacheKey= `courses:${page}:${limit}:${query.search}:${query.category}:${query.sort}`;

  const cachedData = await redis.get(cacheKey);
  if(cachedData){
    return JSON.parse(cachedData);
  }
  

  const where: any = {};

  // 🔥 FILTER BY PUBLISHED
  if (query.instructorId && query.instructorId !== 'undefined') {
    where.instructorId = query.instructorId;
  } else if (query.showAll === 'true') {
    // Admin or specific view: show everything
  } else {
    // Public view: only show published
    where.isPublished = true;
  }

  // 🔍 SEARCH (optimized)
  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  // 🗂 CATEGORY FILTER
  if (query.category) {
    where.categoryId = query.category;
  }

  // 📊 SORT
  let orderBy: any = { createdAt: "desc" };

  if (query.sort) {
    if (query.sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else {
      const [field, order] = query.sort.split(":");

      const allowedFields = ["price", "createdAt", "title"];

      if (allowedFields.includes(field)) {
        orderBy = {
          [field]: order === "desc" ? "desc" : "asc",
        };
      }
    }
  }

  // 🚀 DATABASE QUERY (OPTIMIZED)
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: limit,

      // 🔥 IMPORTANT CHANGE: use SELECT instead of INCLUDE
      select: {
        id: true,
        title: true,
        price: true,
        thumbnail: true,
        createdAt: true,

        category: {
          select: {
            id: true,
            name: true,
          },
        },

        instructor: {
          select: {
            name: true,
            avatar: true,
          },
        },

        _count: {
          select: {
            enrolledUsers: true,
          },
        },
      },
    }),

    prisma.course.count({ where }),
  ]);
  const result={
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
  await redis.setex(cacheKey, 300, JSON.stringify(result));

  return result;
};
/**
 * Fetch full details of a specific course including its modules and lessons.
 */
const getCourseById = async (id: string, userId?: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      instructor: {
        select: { name: true, avatar: true }
      },
      modules: {
        include: {
          // ✅ assignment and quiz are now on the module level
          assignments: true,
          lessons: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      },
      _count: {
        select: { enrolledUsers: true }
      },
      reviews: {
      
        include: {
          user: {
            select: { name: true, avatar: true }
          }
        },
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

/**
 * Update course information
 */
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

/**
 * Toggle the publish status of a course
 */
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

/**
 * Remove a course and all its related content (cascades)
 */
const deleteCourse = async (id: string) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new CustomAppError(404, "Unable to delete: Course not found");
  }

  await prisma.course.delete({ where: { id } });
  await redis.del(`courses:${id}`);
  return { message: "Course has been successfully deleted from the server" };
};

/**
 * Mark a specific lesson as completed for the authenticated user
 */
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

/**
 * Get all courses the current user is enrolled in with progress stats
 */
export const getMyCourses = async (userId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: {
            select: { name: true, avatar: true }
          },
          modules: {
            include: {
              lessons: {
                include: {
                  completedByUsers: {
                    where: { userId }
                  }
                }
              },
            },
          },
        },
      },
    },
    orderBy: {
      lastActivity: "desc",
    },
  });

  // 🔥 FLATTEN DATA AND CALCULATE PROGRESS
  const courses = enrollments.map((enrollment) => {
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

      // course flatten
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      thumbnail: enrollment.course.thumbnail,
      price: enrollment.course.price,
      instructorId: enrollment.course.instructorId,
      instructor: enrollment.course.instructor,
      isPublished: enrollment.course.isPublished,
      categoryId: enrollment.course.categoryId,

      // progress stats needed by frontend
      totalModules: enrollment.course.modules?.length || 0,
      totalLessons,
      completedLessonsCount,
      progressPercentage,
    };
  });

  return courses;
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
};
