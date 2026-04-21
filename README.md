# 🚀 CourseMaster — Backend API

> A production-ready, modular REST API for a full-featured online learning platform — built with **Express 5**, **Prisma 7**, **PostgreSQL**, and **Advanced AI Orchestration**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat (RAG)** | Context-aware learning assistant using **LangChain** & **OpenRouter** |
| 🔍 **AI Semantic Search** | Intelligent course discovery beyond simple keyword matching |
| 📝 **AI Quiz Engine** | Automated MCQ generation based on lesson content |
| 🎯 **Smart Recs** | Category-based course recommendations for personalized learning |
| 🔐 **JWT Authentication** | Secure signup, login, refresh token flow with HTTP-only cookies |
| 👥 **Role-Based Access** | `student`, `instructor`, `admin` roles with route-level guards |
| 📚 **Course Management** | Full CRUD with categories, modules, lessons, search & pagination |
| 💳 **Stripe Payments** | Checkout sessions, webhook handling for success/fail/refund |
| 📊 **Student Progress** | Lesson completion tracking with linear unlock progression |

---

## 📁 Project Structure

```
courseMaster-backend/
├── prisma/
│   └── schema.prisma            # Database schema (15+ models)
├── src/
│   ├── index.ts                 # Express app setup, middleware, routes
│   ├── server.ts                # Server bootstrap
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── stripe.ts            # Stripe client instance
│   └── app/
│       ├── controllers/         # Handles logic for AI, Auth, Courses, etc.
│       ├── services/            # AI logic (LangChain), Prisma queries
│       ├── routes/              # Centralized route definitions
│       ├── middlewares/         # Auth, Role Guards, Error Handlers
│       ├── validations/         # Zod schemas
│       └── utils/               # Helpers (Response format, Async handler)
```

---

## 🔌 API Endpoints

### 🤖 AI Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ai/chat` | Chat with the AI Mentor (requires history) |
| `GET` | `/api/v1/ai/generate-quiz/:lessonId` | Generate a 5-question quiz for a lesson |
| `GET` | `/api/v1/ai/search?query=...` | Semantic search with AI insights |
| `GET` | `/api/v1/ai/recommendations` | Get personalized course recommendations |

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/signup` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login + get JWT tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |

### 📚 Courses & Content
| Resource | Endpoints |
|----------|-----------|
| Courses | `/api/v1/courses` (CRUD + Progress Tracking) |
| Enrollments | `/api/v1/enrollments` (Free/Paid flow) |
| Submissions | `/api/v1/submissions` (Assignments & Quizzes) |
| Payments | `/api/webhook` (Stripe integration) |

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd courseMaster-backend
npm install
```

### 2. Environment Variables
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-jwt-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
OPENROUTER_API_KEY="your_openrouter_api_key"
PORT=5000
```

### 3. Database Setup
```bash
npx prisma db push      # Push schema to database
npx prisma generate      # Generate Prisma Client
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🧠 AI Orchestration (LangChain)
The backend uses **LangChain** to orchestrate AI workflows:
- **Retrieval Augmented Generation (RAG):** The AI Mentor fetches relevant course/lesson data from PostgreSQL before generating responses.
- **OpenRouter Integration:** Flexible LLM support (Gemma, Llama 3, etc.) via a single API.
- **Strict Output Parsing:** Quizzes are generated as structured JSON for immediate consumption by the frontend.

---

## 🧪 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Express 5 | HTTP framework |
| LangChain | AI Orchestration & RAG |
| OpenRouter | AI LLM Provider |
| Prisma 7 | ORM + migrations |
| PostgreSQL | Relational database |
| Stripe | Payment processing |
| Zod | Runtime validation |
| TypeScript 5.9 | Type safety |

---

<p align="center">
  <b>Built with ❤️ for CourseMaster</b>
</p>
