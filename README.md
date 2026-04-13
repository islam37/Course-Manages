# CourseFlow — Course Management System

A full-stack Course Management System with role-based access control (User & Admin), JWT authentication, and complete CRUD operations.

## Live Demo
- **Client:** [Deploy to Netlify/Vercel]
- **Server:** [Deploy to Render/Railway]

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Firebase (Google OAuth) |
| Fonts | Syne (display) + DM Sans (body) |

---

## Features

### User Role
- Browse & search all courses with category filters and pagination
- View course details with real-time seat availability
- Enroll in courses (max 3 active enrollments enforced atomically)
- Drop enrollments to free up slots
- Protected dashboard showing enrolled courses

### Admin Role
- All user capabilities plus:
- Analytics dashboard (total courses, users, enrollments, seat fill rate)
- Add / edit / delete courses with full form validation
- Manage all users and promote/demote admin roles
- View and remove any enrollment platform-wide

### System
- JWT stored in localStorage with automatic expiry handling
- Axios interceptor auto-attaches token and redirects on 401
- MongoDB transactions prevent race conditions during enrollment
- Compound unique index prevents duplicate enrollments
- Rate limiting (100 req / 15 min) on all API routes
- Skeleton loaders on every async operation
- Toast notifications for all CRUD actions
- Animated page transitions with Framer Motion
- Fully responsive (mobile sidebar with spring animation)
- Custom 404 page
- Dynamic `document.title` per route

---

## Project Structure

```
courseflow/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Sidebar + topbar + mobile drawer
│   │   │   ├── PrivateRoute.jsx  # Auth guard
│   │   │   ├── AdminRoute.jsx    # Admin guard
│   │   │   └── shared.jsx        # CourseCard, Modal, Skeletons, EmptyState, StatCard
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state + login/register/google/logout
│   │   ├── hooks/
│   │   │   └── useApi.js         # useFetch, useEnrollmentCheck, useEnrollmentCount
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Courses.jsx       # Browse + filter + paginate + enroll
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── MyEnrolledCourses.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AddCourse.jsx   # Also exports EditCourse
│   │   │       ├── EditCourse.jsx
│   │   │       ├── ManageCourses.jsx
│   │   │       ├── ManageUsers.jsx
│   │   │       └── ManageEnrollments.jsx
│   │   └── utils/
│   │       ├── api.js            # Axios instance with interceptors
│   │       └── firebase.js       # Firebase app + Google provider
│   └── .env.example
│
└── server/                   # Express backend
    ├── models/
    │   ├── User.js
    │   ├── Course.js
    │   └── Enrollment.js
    ├── middleware/
    │   └── auth.js           # verifyToken + adminOnly + generateToken
    ├── routes/
    │   ├── auth.js           # register, login, google, verify, logout
    │   ├── courses.js        # CRUD + pagination + search
    │   ├── enrollments.js    # enroll/drop with MongoDB transactions
    │   └── admin.js          # dashboard, all-enrollments, users, role management
    ├── index.js
    └── .env.example
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project (for Google OAuth)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/courseflow.git
cd courseflow
```

### 2. Set up the server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Set up the client
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev
```

### 4. Environment Variables

**server/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/courseflow
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/auth/google` | — | Google OAuth |
| GET | `/api/auth/verify` | JWT | Verify token |
| POST | `/api/auth/logout` | — | Logout |

### Courses
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/courses` | — | All courses (paginated) |
| GET | `/api/courses/latest` | — | Latest 6 |
| GET | `/api/courses/popular` | — | Most enrolled 6 |
| GET | `/api/courses/:id` | — | Single course |
| POST | `/api/courses` | Admin | Create course |
| PUT | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |

### Enrollments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/enrollments/my-courses` | JWT | My active enrollments |
| GET | `/api/enrollments/check/:courseId` | JWT | Check if enrolled |
| GET | `/api/enrollments/count` | JWT | My enrollment count |
| POST | `/api/enrollments/:courseId` | JWT | Enroll (max 3, seats checked) |
| DELETE | `/api/enrollments/:id` | JWT | Drop enrollment |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Analytics |
| GET | `/api/admin/all-enrollments` | Admin | All enrollments |
| DELETE | `/api/admin/enrollments/:id` | Admin | Remove any enrollment |
| GET | `/api/admin/users` | Admin | All users + enrollment counts |
| PUT | `/api/admin/users/:id/role` | Admin | Update role |

---

## Deployment

### Server (Render)
1. Create new Web Service, connect repo, set root to `server/`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all environment variables from `.env`

### Client (Netlify)
1. Create new site, connect repo, set base to `client/`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `_redirects` file in `public/` with: `/* /index.html 200`
5. Add all `VITE_*` environment variables
6. Add the Netlify domain to Firebase authorized domains

---

## NPM Packages

### Frontend
`react-router-dom` `axios` `framer-motion` `react-hot-toast` `react-icons` `firebase`

### Backend
`express` `mongoose` `jsonwebtoken` `bcryptjs` `cors` `dotenv` `express-rate-limit`
