import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STATIC_REVIEWS = [
  {
    content: "The platform's infrastructure is incredibly fast. I launched my course in 2 days!",
    rating: 5,
  },
  {
    content: "Outstanding support team. They helped me integrate my local payment gateway seamlessly.",
    rating: 5,
  },
  {
    content: "The analytics dashboard gives me insights I never had before. My sales increased by 40%.",
    rating: 5,
  },
  {
    content: "Best EdTech solution for independent creators. Everything is automated and clean.",
    rating: 5,
  }
];

async function main() {
  console.log("Seeding dummy reviews...");

  // Get a user and a course
  const user = await prisma.user.findFirst();
  const course = await prisma.course.findFirst();

  if (!user || !course) {
    console.log("No user or course found. Cannot seed reviews. Please create a user and course first.");
    return;
  }

  // Create reviews
  for (const r of STATIC_REVIEWS) {
    await prisma.review.create({
      data: {
        content: r.content,
        rating: r.rating,
        userId: user.id,
        courseId: course.id,
      }
    });
  }

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
