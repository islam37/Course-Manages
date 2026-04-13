# CourseFlow — Server

Express.js REST API for the CourseFlow Course Management System.

## Setup
```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # development with nodemon
npm start              # production
```

## Key design decisions
- **MongoDB transactions** on enroll/drop to prevent race conditions
- **Compound unique index** `{ userId, courseId }` on Enrollment prevents duplicates at DB level
- **adminOnly middleware** composed after verifyToken — clean separation
- **bcrypt** with salt rounds 12 for password hashing
- **Rate limiting** 100 req / 15 min per IP on all `/api` routes
- Passwords excluded from all responses via `select: false` + `toJSON` override
