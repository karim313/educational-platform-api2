# 🎓 Educational Platform API Documentation

Welcome to the official API documentation for the Educational Platform.

---

## 🚀 Environment Details

| Environment | Base URL |
| :--- | :--- |
| **Production** | `https://educational-platform-api2-production.up.railway.app` |
| **Development** | `http://localhost:8080` |

---

## 🔐 Authentication
Protected routes require a **JWT Bearer Token**: `Authorization: Bearer <token>`

---

## 🛒 Enrollment & Payment System

### 1. Purchase/Enroll in Course
`POST /api/enrollments/purchase/:courseId` - **Protected**

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `paymentMethod` | String | Yes | `stripe` or `vodafone_cash` |
| `transactionId` | String | If VC | Required for Vodafone Cash after transfer |

#### A. Stripe Flow (Visa/Mastercard)
1. Send `paymentMethod: "stripe"`.
2. API returns a Stripe `url`.
3. Redirect user to this `url` for payment.
4. After success, Stripe handles the webhook (or manual verification) to mark as `completed`.

**Response (200 OK):**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

#### B. Vodafone Cash Flow
1. Transfer the course price to our number: `${process.env.VODAFONE_CASH_NUMBER}`.
2. Send `paymentMethod: "vodafone_cash"` and `transactionId: "..."`.
3. Enrollment status will be `completed` automatically (Auto-Approved).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Enrollment successful. You can now access the course.",
  "data": { ... }
}
```

---

### 2. Get My Enrolled Courses
`GET /api/enrollments/my-courses` - **Protected**
Returns only courses where `paymentStatus` is `completed`.

---

### 3. Verify Enrollment (Admin Only)
`PUT /api/enrollments/verify/:enrollmentId` - **Admin Protected**

**Request Body:**
```json
{
  "status": "completed" 
}
```

---

## 📚 Course Management

### 1. Create a Course
`POST /api/courses` - **Admin/Teacher Protected**

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Course title |
| `description` | String | Yes | Course description |
| `instructor` | String | Yes | Instructor name |
| `price` | Number | Yes | Course price |
| `category` | String | Yes | Course category |
| `level` | String | Yes | `Beginner`, `Intermediate`, `Advanced`, `All Levels` |
| `image` | String | Yes | Image URL |
| `imageCover` | String | No | Cover image URL (defaults to `image` if not provided) |
| `hours` | Number | Yes | Total duration in hours |
| `lessons` | Number | Yes | Total number of lessons |
| `rating` | Number | No | Course rating (default 0) |
| `reviews` | Number | No | Total reviews (default 0) |
| `tag` | String | No | Optional tag (e.g., "Bestseller") |
| `videos` | Array | No | Array of video objects `{title, videoUrl, duration}` |
| `playlists` | Array | No | Array of playlist objects `{title, videos: []}` |

**Response (201 Created):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 2. Update Course
`PUT /api/courses/:courseId` - **Admin/Teacher Protected**

Update any course field (title, price, image, etc).

---

### 3. Add Video to Course
`POST /api/courses/:courseId/videos` - **Admin/Teacher Protected**

**Request Body:**
```json
{
  "title": "Introduction",
  "videoUrl": "https://...",
  "duration": 10
}
```

---

### 4. Delete Video from Course
`DELETE /api/courses/:courseId/videos/:videoId` - **Admin/Teacher Protected**

---

### 5. Delete Course
`DELETE /api/courses/:courseId` - **Admin Protected Only**

---

### Video Management
- `POST /api/courses/:courseId/videos`: Add video directly to course.
- `POST /api/courses/:courseId/playlists/:playlistId/videos`: Add video to specific playlist.
- `DELETE /api/courses/:courseId/videos/:videoId`: Delete specific video.
- `DELETE /api/courses/:courseId/videos`: Delete all videos from a course.

### Instructor Dashboard
- `GET /api/instructor/users`: Get list of all users and their enrollment stats (Admin/Teacher only).

### Bulk Actions
- `DELETE /api/courses`: Delete all courses (Admin only).

## Standard Error Codes
| Code | Description |
| --- | --- |
| `400` | Bad Request (Validation error or already enrolled) |
| `401` | Unauthorized (Missing or invalid token) |
| `403` | Forbidden (Insufficient permissions) |
| `404` | Not Found (Resource doesn't exist) |
| `500` | Internal Server Error |
