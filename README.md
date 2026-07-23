# EduSphere - Multi-Tenant Student Information & Learning Management System

EduSphere is a production-ready, multi-tenant Student Information and Learning Management System (LMS) built on the MERN stack. It implements secure authentication, role-based access control, local media uploads, course/lesson planning, student progress tracking, and class attendance logs.

---

## Technical Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Express Validator, Cookie Parser, Multer, Express Rate Limit.
- **Frontend**: React (Vite), Axios, TailwindCSS v4, React Hook Form, React Hot Toast, React Icons, React Router v6.

---

## Folder Structure

```
edusphere/
├── client/                      # Frontend Vite React App
│   ├── src/
│   │   ├── components/          # Common and dashboard subcomponents
│   │   ├── context/             # Global AuthContext provider
│   │   ├── hooks/               # useAuth custom wrapper hook
│   │   ├── layouts/             # Dashboard shell layout
│   │   ├── pages/               # Page components
│   │   ├── services/            # consolidated apiCollection.js
│   │   ├── utils/               # axiosInstance.js with interceptors
│   │   ├── App.jsx              # Routing and Provider bindings
│   │   ├── index.css            # Tailwind directive loading
│   │   └── main.jsx
│   ├── vite.config.js           # Configuration with Tailwind & backend proxy
│   └── package.json
│
├── server/                      # Backend Express Server
│   ├── src/
│   │   ├── config/              # MongoDB Mongoose configurations
│   │   ├── middlewares/         # Auth, error, upload, validation layers
│   │   ├── modules/             # Modular Domain Folders
│   │   │   ├── auth/            # Controllers, validations, and routes
│   │   │   ├── user/            # Schema model for system logins
│   │   │   ├── student/         # Profiles, CRUD, and image uploads
│   │   │   ├── course/          # Courses, lessons, and progress tracking
│   │   │   ├── attendance/      # Bulk registers and statistics
│   │   │   └── institute/       # School organizational tenants
│   │   ├── utils/               # AppError, catchAsync, JWT token helpers
│   │   ├── seed.js              # Auto-seeder for Super Admin accounts
│   │   ├── app.js               # Express application router assembly
│   │   └── server.js            # Server entry point
│   ├── .env                     # Local settings
│   └── package.json
```

---

## Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Backend Setup
1. Open a terminal in the `server` directory.
2. Verify or create the `.env` file (copying from `.env.example`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database with the default Super Admin user:
   ```bash
   npm run seed
   ```
   *Seeded credentials:*
   - **Email:** `superadmin@edusphere.com`
   - **Password:** `SuperAdmin123!`
5. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will start listening on port `5000`.

### 2. Frontend Setup
1. Open a terminal in the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The client will start running on port `3000`.

---

## API Documentation

### 1. Authentication & Tenant Setup
- **`POST /api/auth/register`** (Public)
  - Registers a new `Institute` and creates the `Institute Admin` login user.
  - *Payload:* `{ name, email, password, instituteName, instituteCode, address }`
- **`POST /api/auth/login`** (Public)
  - Verifies credentials. Returns the `accessToken` in the JSON response body and places the `refreshToken` in an `httpOnly`, `sameSite: 'strict'` cookie.
  - *Payload:* `{ email, password }`
- **`POST /api/auth/refresh-token`** (Public)
  - Reads the refresh token cookie and issues a new access token.
- **`POST /api/auth/logout`** (Authenticated)
  - Overwrites the refresh token cookie with an expired date to sign the user out.
- **`GET /api/auth/me`** (Authenticated)
  - Returns the authenticated user's profile and populated institute details.

### 2. Student Management
- **`POST /api/students`** (Institute Admin / Super Admin)
  - Registers a student. Automatically creates a User login with role `'Student'` and password set to their `admissionNumber`. Supports profile image upload.
  - *Payload (FormData):* `firstName`, `lastName`, `email`, `phone`, `dateOfBirth`, `gender`, `course`, `admissionNumber`, `status`, `profileImage` (File)
- **`GET /api/students`** (Super Admin, Institute Admin, Teacher)
  - Returns all students. Filters by `search` (name/email/admission), `course`, `status` with page-based `pagination`. Scoped to the user's institute.
- **`GET /api/students/:id`** (Authenticated)
  - Retrieves student profile by ID.
- **`PUT /api/students/:id`** (Institute Admin / Super Admin)
  - Updates profile details. Automatically synchronizes updates with their User account. Supports profile image modification.
- **`DELETE /api/students/:id`** (Institute Admin / Super Admin)
  - Deletes student profile and matching User login account.

### 3. Teacher Management
- **`POST /api/users/teachers`** (Institute Admin / Super Admin)
  - Creates a Teacher User login account inside their institute.
  - *Payload:* `{ name, email, password }`
- **`GET /api/users/teachers`** (Institute Admin / Super Admin)
  - Lists all teachers belonging to the user's institute.

### 4. Course & LMS Modules
- **`POST /api/courses`** (Teacher, Institute Admin, Super Admin)
  - Creates a course. Supports thumbnail image upload.
  - *Payload (FormData):* `title`, `description`, `category`, `status`, `instructor` (optional for admins), `thumbnail` (File)
- **`GET /api/courses`** (All roles)
  - Lists courses. Students see only `'Published'` status. Scoped to the user's institute.
- **`GET /api/courses/:id`** (All roles)
  - Retrieves course details including the array of lessons.
- **`PUT /api/courses/:id`** (Teacher [Own courses only], Admin, Super Admin)
  - Updates course metadata and thumbnail.
- **`DELETE /api/courses/:id`** (Teacher [Own courses only], Admin, Super Admin)
  - Deletes course and cleans up course progress files.
- **`POST /api/courses/:courseId/lessons`** (Teacher [Own courses], Admin, Super Admin)
  - Adds a lesson to the course.
  - *Payload:* `{ title, videoUrl, description, duration, order }`
- **`DELETE /api/courses/:courseId/lessons/:lessonId`** (Teacher [Own courses], Admin, Super Admin)
  - Removes a lesson and pulls it from completed progresses.
- **`POST /api/courses/:courseId/lessons/:lessonId/complete`** (Student only)
  - Toggles a lesson as completed to update course progress.
- **`GET /api/courses/:courseId/progress`** (All roles)
  - Returns completion statistics for a student in a course.

### 5. Attendance Registers
- **`POST /api/attendance`** (Teacher, Admin, Super Admin)
  - Logs attendance in bulk. Standardizes dates to UTC start-of-day.
  - *Payload:* `{ courseId, date, records: [{ studentId, status }, ...] }`
- **`GET /api/attendance/student/:studentId`** (All roles)
  - Returns logs list and statistics (Total classes, Present, Absent, Leave, Attendance Percentage) for the student. Student roles are locked to their own ID.

---

## Quality Design Highlights
1. **Multi-Tenant Data Isolation**: Database queries are automatically restricted using `req.user.institute` so that no institution can inspect another's information.
2. **Double Model Onboarding Sync**: Creating a Student profile automatically seeds a corresponding User authentication credential, and deletion/status updates are automatically synchronized to prevent orphan accounts.
3. **Axios Token Refresh Interceptor**: Catches failed requests on 401 token expiration, queries the refresh token cookie, saves the new access token in-memory (preventing XSS access), and retries the queue.
4. **Rich Tailwind Light Theme**: Styled using slate backgrounds, white cards, indigo accents, status badges, responsive navigation structures, empty state representations, and micro-interaction animations.
