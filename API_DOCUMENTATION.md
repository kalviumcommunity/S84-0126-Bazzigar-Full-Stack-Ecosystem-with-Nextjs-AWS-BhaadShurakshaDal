# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication Endpoints

### POST /api/auth/signup

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

### POST /api/auth/login

Authenticate user and create session.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-here"
  }
}
```

## Alert Endpoints

### GET /api/alerts

Retrieve all active alerts.

**Query Parameters:**

- `status` (optional): Filter by status (ACTIVE, RESOLVED, EXPIRED)
- `severity` (optional): Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `limit` (optional): Number of results (default: 50)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "alert-uuid",
      "title": "Heavy Rainfall Warning",
      "description": "Expected rainfall 150mm in next 6 hours",
      "severity": "HIGH",
      "status": "ACTIVE",
      "location": {
        "district": "Mumbai",
        "zone": "Dadar"
      },
      "issuedAt": "2026-02-11T10:00:00Z",
      "expiresAt": "2026-02-11T22:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 50
  }
}
```

### GET /api/alerts/:id

Get specific alert details.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "alert-uuid",
    "title": "Heavy Rainfall Warning",
    "description": "Expected rainfall 150mm in next 6 hours",
    "severity": "HIGH",
    "status": "ACTIVE",
    "location": {
      "district": "Mumbai",
      "zone": "Dadar",
      "pincode": "400014"
    },
    "weatherData": {
      "rainfall": 45.5,
      "temperature": 28.3,
      "humidity": 85
    },
    "safetyGuidance": [
      "Stay indoors if possible",
      "Avoid low-lying areas",
      "Keep emergency contacts ready"
    ],
    "issuedAt": "2026-02-11T10:00:00Z",
    "expiresAt": "2026-02-11T22:00:00Z"
  }
}
```

### POST /api/alerts

Create a new alert (Admin only).

**Request Body:**

```json
{
  "title": "Flood Warning",
  "description": "River water level rising rapidly",
  "severity": "CRITICAL",
  "locationId": "location-uuid",
  "expiresAt": "2026-02-12T00:00:00Z"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "alert-uuid",
    "title": "Flood Warning",
    "status": "ACTIVE",
    "issuedAt": "2026-02-11T12:00:00Z"
  }
}
```

### PATCH /api/alerts/:id

Update alert status (Admin only).

**Request Body:**

```json
{
  "status": "RESOLVED"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "alert-uuid",
    "status": "RESOLVED",
    "updatedAt": "2026-02-11T15:00:00Z"
  }
}
```

## Member Endpoints

### GET /api/members

Get all registered members (Admin only).

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "VOLUNTEER",
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ]
}
```

### GET /api/members/:id

Get specific member details.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "VOLUNTEER",
    "teams": [
      {
        "id": "team-uuid",
        "name": "Emergency Response Team"
      }
    ],
    "subscriptions": [
      {
        "locationId": "location-uuid",
        "location": "Dadar, Mumbai"
      }
    ]
  }
}
```

### PATCH /api/members/:id

Update member information.

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "+919876543211"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "name": "John Updated",
    "updatedAt": "2026-02-11T14:00:00Z"
  }
}
```

## User Endpoints

### GET /api/users

Get all users (Admin only).

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "Jane Smith",
      "role": "USER",
      "isActive": true
    }
  ]
}
```

## Error Codes

| Code               | Description               |
| ------------------ | ------------------------- |
| `VALIDATION_ERROR` | Invalid input data        |
| `UNAUTHORIZED`     | Authentication required   |
| `FORBIDDEN`        | Insufficient permissions  |
| `NOT_FOUND`        | Resource not found        |
| `CONFLICT`         | Resource already exists   |
| `INTERNAL_ERROR`   | Server error              |
| `DATABASE_ERROR`   | Database operation failed |
| `CACHE_ERROR`      | Redis cache error         |

## Rate Limiting

- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 500 requests per 15 minutes
- Admin endpoints: 1000 requests per 15 minutes

## Response Format

All API responses follow this structure:

**Success Response:**

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "meta": {
    /* optional metadata */
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      /* optional error details */
    }
  }
}
```

## Authentication

Most endpoints require authentication via JWT token:

```
Authorization: Bearer <your-jwt-token>
```

Include this header in all authenticated requests.

## Pagination

List endpoints support pagination:

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)

**Response includes:**

```json
{
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```
