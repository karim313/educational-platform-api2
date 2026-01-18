# 🎓 Educational Platform API Documentation

Welcome to the official API documentation for the Educational Platform.

---

## 🚀 Environment Details

| Environment | Base URL |
| :--- | :--- |
| **Production** | `https://educational-platform-api2-production-75ed.up.railway.app` |
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
3. Enrollment status will be `pending` until admin verifies.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Enrollment request submitted. Pending admin verification.",
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

## ⚠️ Standard Error Codes
- **400**: Missing fields or invalid choice.
- **401**: Unauthorized (Login required).
- **403**: Forbidden (Admin required).
- **404**: Course not found.
