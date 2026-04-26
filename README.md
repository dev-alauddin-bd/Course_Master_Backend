# 🚀 CourseMaster — Backend API

> A robust, modular, and scalable RESTful API powering the CourseMaster Learning Management System (LMS). Built with **Express 5**, **Prisma 7**, **PostgreSQL**, and **Advanced AI Orchestration**.

---

## 📖 About The Project

The CourseMaster Backend serves as the foundational engine for a full-featured online education platform. It provides a secure, efficient, and flexible architecture to handle everything from user authentication and role management to complex course structures, progress tracking, and secure financial transactions. 

By integrating modern technologies like LangChain for AI features and Cloudinary for media management, the backend ensures an optimized and intelligent experience for both students seeking knowledge and instructors building their audiences.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📚 **Complete Course CRUD** | Manage Categories, Courses, Modules, and Lessons with rich metadata, search, and pagination capabilities. |
| 🔐 **Advanced Authentication** | Secure JWT-based authentication (access/refresh tokens) combined with Firebase integration for social logins. |
| 👥 **Role-Based Access Control** | Strictly enforced guards for `student`, `instructor`, and `admin` roles to ensure data security. |
| ☁️ **Media Management** | Integrated with **Cloudinary** and **Multer** for reliable image and video uploads directly from the client or server. |
| 🤖 **AI Orchestration (RAG)** | Context-aware AI Mentor, smart semantic search, and automated MCQ generation using **LangChain** and **OpenRouter**. |
| 💳 **Secure Payments** | **Stripe** integration for handling checkout sessions and webhooks for success, failure, and refund scenarios. |
| 📊 **Progress Tracking** | Sophisticated enrollment tracking allowing students to follow linear progressions and complete lessons. |
| 🛡️ **Data Validation** | Strict runtime validation of incoming requests and payloads using **Zod**. |
| 🚀 **Performance Optimized** | Rate limiting, Redis caching (optional), and optimized Prisma queries for fast response times. |

---

## 📁 Project Architecture

The application follows a clean, modular architecture:

```
courseMaster-backend/
├── prisma/
│   └── schema.prisma            # Database schema mapping (15+ core models)
├── src/
│   ├── index.ts                 # Express app initialization & middleware stack
│   ├── server.ts                # Entry point & server bootstrap
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton instance
│   │   └── stripe.ts            # Stripe SDK integration
│   └── app/
│       ├── controllers/         # Request handling for Auth, Courses, AI, Users
│       ├── services/            # Core business logic, DB queries, LangChain flows
│       ├── routes/              # Modular API route definitions
│       ├── middlewares/         # Auth verification, Role guards, Error handling
│       ├── validations/         # Zod schemas for rigorous input validation
│       └── utils/               # Utilities (Response formatting, async wrappers)
```

---

## 🔌 Core API Endpoints

### 📚 Course Management
- `GET /api/v1/courses` - Fetch catalog with search, filters, and pagination
- `POST /api/v1/courses` - Create a new course (Instructor/Admin)
- `GET /api/v1/courses/:id` - Get comprehensive course details
- `PUT /api/v1/courses/:id` - Update course information
- `DELETE /api/v1/courses/:id` - Remove a course

### 🤖 AI Integration
- `POST /api/v1/ai/chat` - Interact with the context-aware AI Mentor
- `GET /api/v1/ai/generate-quiz/:lessonId` - Dynamically generate a quiz
- `GET /api/v1/ai/search` - Perform semantic search across the platform

### 🔐 Authentication & Users
- `POST /api/v1/auth/signup` - Register an account
- `POST /api/v1/auth/login` - Authenticate and retrieve JWTs
- `GET /api/v1/users/me` - Retrieve current user profile

### 💳 Payments & Enrollments
- `POST /api/v1/enrollments` - Enroll in free or paid courses (triggers Stripe)
- `POST /api/webhook` - Stripe webhook listener

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/dev-alauddin-bd/Course_Master_Backend.git
cd Course_Master_Backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="1d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
OPENROUTER_API_KEY="your_openrouter_api_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=5000
```

### 3. Database Setup
```bash
npx prisma db push      # Sync schema with PostgreSQL database
npx prisma generate     # Generate Prisma Client types
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🧪 Tech Stack Overview

| Technology | Purpose |
|-----------|---------|
| **Express 5** | Robust, fast, and minimal HTTP web framework |
| **Prisma 7** | Next-generation Node.js and TypeScript ORM |
| **PostgreSQL** | Powerful, open source object-relational database system |
| **LangChain & OpenRouter** | Framework for developing applications powered by language models |
| **Cloudinary** | Cloud-based image and video management |
| **Stripe** | Payment processing infrastructure |
| **Zod** | TypeScript-first schema declaration and validation |
| **TypeScript 5.9** | Static typing for enhanced developer experience and code quality |

---

<p align="center">
  <b>Built with ❤️ for modern education.</b>
</p>
