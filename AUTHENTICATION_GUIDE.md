# Authentication Guide

Complete guide for authentication and authorization in BhaadShurakshaDal.

## Overview

The application uses a custom JWT-based authentication system with the following features:

- Email/password authentication
- Session management with Redis
- Role-based access control (RBAC)
- Token refresh mechanism
- OAuth integration (Google, GitHub) - Coming soon

## Authentication Flow

### Registration Flow

```
1. User fills signup form
   └─> Name, Email, Phone, Password

2. Client validates input
   └─> Zod schema validation
   └─> Password confirmation check

3. POST /api/auth/signup
   └─> Server validates input
   └─> Check if email exists
   └─> Hash password (bcrypt)
   └─> Create user in database
   └─> Return user data (without password)

4. Redirect to login page
```

### Login Flow

```
1. User enters credentials
   └─> Email, Password

2. Client validates input
   └─> Zod schema validation

3. POST /api/auth/login
   └─> Server validates input
   └─> Find user by email
   └─> Verify password (bcrypt.compare)
   └─> Check if account is active
   └─> Generate JWT token
   └─> Store session in Redis
   └─> Return token + user data

4. Client stores token
   └─> localStorage (Remember me)
   └─> sessionStorage (Default)

5. Redirect to dashboard
```

## API Endpoints

### POST /api/auth/signup

Register a new user account.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "SecurePass123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2026-02-11T10:00:00Z"
    },
    "message": "Account created successfully"
  }
}
```

**Error Response (409):**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "User with this email already exists"
  }
}
```

### POST /api/auth/login

Authenticate user and create session.

**Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Login successful"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

### POST /api/auth/logout

Logout user and invalidate session.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### POST /api/auth/refresh

Refresh access token.

**Request:**

```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

## Frontend Implementation

### Login Page

**Location:** `frontend/app/login/page.tsx`

**Features:**

- Email/password input with validation
- Show/hide password toggle
- Remember me checkbox
- Error message display
- Loading states
- Redirect after successful login

**Usage:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem("auth_token", data.data.token);
    router.push("/alerts");
  }
};
```

### Signup Page

**Location:** `frontend/app/register/page.tsx`

**Features:**

- Full name, email, phone, password inputs
- Password confirmation
- Show/hide password toggles
- Real-time validation
- Success message
- Auto-redirect to login

**Usage:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });

  const data = await response.json();

  if (data.success) {
    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }
};
```

## Validation Schemas

**Location:** `frontend/lib/schemas/auth.schema.ts`

### Login Schema

```typescript
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
```

### Signup Schema

```typescript
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});
```

## Protected Routes

### Middleware Approach

Create `middleware.ts` in the root:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  // Protected routes
  const protectedPaths = ["/alerts", "/map", "/resources"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/alerts/:path*", "/map/:path*", "/resources/:path*"],
};
```

### Component-Level Protection

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return <div>Protected Content</div>;
}
```

## Role-Based Access Control

### User Roles

```typescript
enum Role {
  USER = "USER", // Basic user access
  VOLUNTEER = "VOLUNTEER", // Can report incidents
  COMMANDER = "COMMANDER", // Can manage teams
  ADMIN = "ADMIN", // Full system access
}
```

### Permission Checking

```typescript
// lib/auth.ts
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    USER: 0,
    VOLUNTEER: 1,
    COMMANDER: 2,
    ADMIN: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Usage in API route
if (!hasPermission(user.role, "ADMIN")) {
  return handleError(
    ERROR_CODES.FORBIDDEN,
    "Insufficient permissions",
    null,
    403,
  );
}
```

## Token Management

### JWT Token Structure

```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1707648000,
  "exp": 1707734400
}
```

### Token Generation (Production)

```typescript
import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role,
  },
  process.env.JWT_SECRET!,
  { expiresIn: "24h" },
);
```

### Token Verification

```typescript
import jwt from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: "Invalid token" };
  }
}
```

## Session Management

### Redis Session Storage

```typescript
// Store session
await redis.set(
  `session:${userId}`,
  JSON.stringify({
    userId,
    email,
    role,
    loginAt: new Date().toISOString(),
  }),
  "EX",
  86400, // 24 hours
);

// Retrieve session
const session = await redis.get(`session:${userId}`);

// Delete session (logout)
await redis.del(`session:${userId}`);
```

## Password Security

### Hashing (Production)

```typescript
import bcrypt from "bcrypt";

// Hash password during signup
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password during login
const isValid = await bcrypt.compare(password, user.password);
```

### Password Requirements

- Minimum 6 characters (increase to 8+ in production)
- Mix of uppercase and lowercase (recommended)
- Include numbers and special characters (recommended)
- Not a common password (implement password strength checker)

## Security Best Practices

### 1. Environment Variables

```env
# .env
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_REFRESH_SECRET="different-secret-for-refresh"
SESSION_SECRET="session-encryption-key"
```

### 2. HTTPS Only

```typescript
// Set secure cookies in production
const isProduction = process.env.NODE_ENV === "production";

response.cookies.set("auth_token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  maxAge: 86400,
});
```

### 3. Rate Limiting

```typescript
// Implement rate limiting for auth endpoints
const loginAttempts = await redis.incr(`login:${email}`);
await redis.expire(`login:${email}`, 900); // 15 minutes

if (loginAttempts > 5) {
  return handleError(
    ERROR_CODES.TOO_MANY_REQUESTS,
    "Too many login attempts. Try again later.",
    null,
    429,
  );
}
```

### 4. CSRF Protection

```typescript
// Generate CSRF token
const csrfToken = crypto.randomBytes(32).toString("hex");
await redis.set(`csrf:${userId}`, csrfToken, "EX", 3600);

// Verify CSRF token
const storedToken = await redis.get(`csrf:${userId}`);
if (csrfToken !== storedToken) {
  return handleError(ERROR_CODES.FORBIDDEN, "Invalid CSRF token", null, 403);
}
```

## Testing Authentication

### Manual Testing

1. **Signup Flow:**
   - Navigate to `/register`
   - Fill form with valid data
   - Submit and verify redirect to login
   - Check database for new user

2. **Login Flow:**
   - Navigate to `/login`
   - Enter credentials
   - Verify token storage
   - Check redirect to dashboard

3. **Protected Routes:**
   - Try accessing `/alerts` without login
   - Verify redirect to login page
   - Login and access again
   - Verify successful access

### Automated Testing

```typescript
// __tests__/auth/login.test.ts
describe("Login API", () => {
  it("should login with valid credentials", async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
  });

  it("should reject invalid credentials", async () => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });

    expect(response.status).toBe(401);
  });
});
```

## Troubleshooting

### Issue: Token not persisting

**Solution:** Check if localStorage/sessionStorage is accessible. Use cookies for better security.

### Issue: CORS errors on auth endpoints

**Solution:** Configure CORS in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/auth/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL },
      ],
    },
  ];
}
```

### Issue: Session expires too quickly

**Solution:** Adjust token expiration and implement refresh token mechanism.

## Future Enhancements

1. **OAuth Integration**
   - Google Sign-In
   - GitHub OAuth
   - Social login buttons

2. **Two-Factor Authentication (2FA)**
   - SMS OTP
   - Email verification
   - Authenticator app support

3. **Password Reset**
   - Forgot password flow
   - Email verification
   - Secure token generation

4. **Account Management**
   - Email verification
   - Profile updates
   - Password change
   - Account deletion

## References

- [JWT Best Practices](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Zod Validation](https://zod.dev/)
