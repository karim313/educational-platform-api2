# 🎓 Educational Platform API Documentation

Welcome to the official API documentation for the Educational Platform. This document provides all the details needed to integrate the frontend with the backend services.

---

## 🚀 Environment Details

| Environment | Base URL |
| :--- | :--- |
| **Production** | `https://educational-platform-api2-production-75ed.up.railway.app` |
| **Development** | `http://localhost:8080` |

> [!IMPORTANT]
> All API endpoints are prefixed with `/api`. For compatibility, `/api/v1` is also supported.

---

## 🔐 Global Configuration

### Headers
All requests must include the following headers for proper communication:

```http
Content-Type: application/json
Accept: application/json
```

### Authentication
Protected routes require a **JWT Bearer Token** in the authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 🔑 Authentication Endpoints

### 1. User Registration
`POST /api/auth/register` - Creates a new user account.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Full name of the user |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Minimum 6 characters |
| `role` | String | No | `student` (default) or `admin` |

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

### 2. User Login
`POST /api/auth/login` - Authenticates user and returns a token.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User's email |
| `password` | String | Yes | User's password |

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

## 📚 Course Endpoints

### 1. Get All Courses
`GET /api/courses` - Public access to all available courses.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65a...",
      "title": "Advanced TypeScript",
      "description": "Master TS...",
      "price": 99.99,
      "playlists": []
    }
  ]
}
```

---

### 2. Get Single Course
`GET /api/courses/:courseId` - Public access to full course details including playlists and videos.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65a...",
    "title": "...",
    "playlists": [
      {
        "title": "Introduction",
        "videos": [
          { "title": "Welcome", "videoUrl": "...", "duration": 10 }
        ]
      }
    ]
  }
}
```

---

### 3. Create Course (Admin Only)
`POST /api/courses` - Create a new course.

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Course title |
| `description` | String | Yes | Detailed description |
| `price` | Number | Yes | Price in USD/Default currency |

---

## 🛒 Enrollment & Purchase

### 1. Purchase/Enroll in Course
`POST /api/enrollments/purchase/:courseId` - **Protected**
Enrolls the logged-in user into a specific course.

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "user": "userid...",
    "course": "courseid...",
    "enrolledAt": "2024-01-18..."
  }
}
```

---

### 2. Get My Enrolled Courses
`GET /api/enrollments/my-courses` - **Protected**
Returns a list of all courses the current user has purchased.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "_id": "...", "title": "TypeScript Masterclass", "price": 99 }
  ]
}
```

---

## ⚠️ Error Handling

The API uses standard HTTP status codes:

| Code | Meaning | Description |
| :--- | :--- | :--- |
| **400** | Bad Request | Invalid input or duplicate enrollment |
| **401** | Unauthorized | Missing or invalid token |
| **403** | Forbidden | Admin privileges required |
| **404** | Not Found | Resource does not exist |
| **500** | Server Error | Internal server issue |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description here"
}
```
