# Educational Platform API

A complete backend API for an educational platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- JWT Authentication
- Role-Based Access Control (Student/Admin Only logic)
- Course Management (Playlists & Videos)
- Production-ready structure

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JSON Web Tokens (JWT) & bcryptjs

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Run in development:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Documentation
- **Swagger UI:** [https://educational-platform-api2-production.up.railway.app/api-docs](https://educational-platform-api2-production.up.railway.app/api-docs)
- **Postman Collection:** A file named `educational-platform.postman_collection.json` is provided in the root directory for easy testing.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user (Student by default)
- `POST /api/auth/login` - Login and get JWT

### Courses (Public)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:courseId` - Get single course details

### Courses (Admin Only)
- `POST /api/courses` - Create a new course
- `DELETE /api/courses/:courseId` - Delete a course
- `POST /api/courses/:courseId/playlists` - Add a playlist to a course
- `POST /api/courses/:courseId/playlists/:playlistId/videos` - Add a video to a playlist

## Logic Notes
- **Admin Limit:** The register logic only allows the first admin to be created if no admin exists. If an admin already exists, new registrations are forced to `student` role.
- **Embedded Documents:** Playlists are embedded in Courses, and Videos are embedded in Playlists.

## License
MIT
