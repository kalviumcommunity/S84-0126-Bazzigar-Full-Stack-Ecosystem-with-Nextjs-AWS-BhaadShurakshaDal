# System Architecture

## Overview

BhaadShurakshaDal is a full-stack flood early warning system built with modern web technologies. The architecture follows a layered approach with clear separation of concerns.

## Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React hooks and Server Components
- **Theme**: next-themes for dark/light mode

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **Validation**: Zod schemas
- **Error Handling**: Custom error handler with standardized responses

### Database

- **Primary Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Connection Pooling**: Built-in Prisma connection management

### Caching

- **Cache Layer**: Redis 7+
- **Client**: node-redis
- **Strategy**: Cache-aside pattern
- **TTL**: Configurable per resource type

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud Platforms**: AWS (ECS, RDS, ElastiCache) or Azure (App Service, PostgreSQL, Redis)
- **Monitoring**: CloudWatch / Application Insights

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Load Balancer                     │
│                    (CloudFront / Azure CDN)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer (Next.js)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Frontend (React Components)              │   │
│  │  • Pages (App Router)                                 │   │
│  │  • Components (Hero, Navbar, Dashboard, etc.)        │   │
│  │  • Client-side state management                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Backend (API Routes)                     │   │
│  │  • /api/auth/* - Authentication                       │   │
│  │  • /api/alerts/* - Alert management                   │   │
│  │  • /api/members/* - Member management                 │   │
│  │  • /api/users/* - User management                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│     Cache Layer          │  │    Database Layer        │
│       (Redis)            │  │     (PostgreSQL)         │
│                          │  │                          │
│  • Session storage       │  │  • User data             │
│  • Alert cache           │  │  • Alert records         │
│  • Weather data cache    │  │  • Location data         │
│  • Rate limiting         │  │  • Team management       │
│  • TTL: 5-60 minutes     │  │  • Audit logs            │
└──────────────────────────┘  └──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AWS SNS    │  │  Email SMTP  │  │  Weather API │      │
│  │ Notifications│  │   Service    │  │   (Future)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer

**Location**: `frontend/app/`, `frontend/components/`

**Responsibilities**:

- Render UI components
- Handle user interactions
- Client-side routing
- Form validation
- Theme management

**Key Components**:

```
frontend/
├── app/
│   ├── page.tsx              # Home page
│   ├── alerts/page.tsx       # Alerts listing
│   ├── map/page.tsx          # Map visualization
│   ├── register/page.tsx     # User registration
│   └── resources/page.tsx    # Safety resources
├── components/
│   ├── Hero.tsx              # Landing hero section
│   ├── Navbar.tsx            # Navigation bar
│   ├── Features.tsx          # Feature showcase
│   ├── RiskDashboard.tsx     # Risk visualization
│   └── Footer.tsx            # Footer component
```

### 2. API Layer

**Location**: `frontend/app/api/`

**Responsibilities**:

- Handle HTTP requests
- Input validation (Zod)
- Authentication & authorization
- Business logic orchestration
- Response formatting

**Endpoints**:

```
frontend/app/api/
├── auth/
│   ├── login/route.ts        # POST /api/auth/login
│   └── signup/route.ts       # POST /api/auth/signup
├── alerts/
│   ├── route.ts              # GET, POST /api/alerts
│   └── [id]/route.ts         # GET, PATCH, DELETE /api/alerts/:id
├── members/
│   ├── route.ts              # GET, POST /api/members
│   └── [id]/route.ts         # GET, PATCH /api/members/:id
└── users/
    └── route.ts              # GET /api/users
```

### 3. Service Layer

**Location**: `frontend/services/`, `frontend/lib/`

**Responsibilities**:

- Business logic implementation
- Data transformation
- External API integration
- Caching logic

**Services**:

```
frontend/
├── services/
│   ├── alert.service.ts      # Alert business logic
│   └── cache.service.ts      # Redis caching
├── lib/
│   ├── queries.ts            # Database queries
│   ├── responseHandler.ts    # API response formatting
│   ├── errorCodes.ts         # Error code definitions
│   └── schemas/              # Zod validation schemas
```

### 4. Data Access Layer

**Location**: `frontend/lib/prisma.ts`, `prisma/`

**Responsibilities**:

- Database connections
- Query execution
- Transaction management
- Data modeling

**Structure**:

```
prisma/
├── schema.prisma             # Database schema
├── migrations/               # Migration history
├── seed.ts                   # Seed data
└── examples.ts               # Query examples
```

## Data Flow

### Request Flow (Read Operation)

```
1. User Request
   └─> Browser sends GET /api/alerts

2. API Route Handler
   └─> Validates request
   └─> Checks authentication

3. Cache Check
   └─> Query Redis for cached data
   └─> If found: return cached response
   └─> If not found: continue to database

4. Database Query
   └─> Prisma executes query
   └─> PostgreSQL returns data

5. Cache Update
   └─> Store result in Redis with TTL

6. Response
   └─> Format response using responseHandler
   └─> Return JSON to client

7. Client Update
   └─> React component re-renders with new data
```

### Request Flow (Write Operation)

```
1. User Action
   └─> Browser sends POST /api/alerts

2. API Route Handler
   └─> Validates input using Zod schema
   └─> Checks authorization (admin only)

3. Database Transaction
   └─> Begin transaction
   └─> Insert alert record
   └─> Create related records (notifications, etc.)
   └─> Commit transaction

4. Cache Invalidation
   └─> Delete related cache keys
   └─> Clear affected queries

5. Side Effects
   └─> Trigger notifications (SNS, Email)
   └─> Log audit trail

6. Response
   └─> Return success response with created resource

7. Client Update
   └─> Update UI optimistically or refetch data
```

## Database Schema

### Core Tables

```sql
-- Users and Authentication
User (id, email, password, name, role, createdAt)

-- Geographic Hierarchy
District (id, name, state, riskLevel)
Zone (id, name, districtId, floodProneness)
Location (id, name, zoneId, pincode, latitude, longitude)

-- Alert System
Alert (id, title, description, severity, status, locationId, issuedAt, expiresAt)
Notification (id, userId, alertId, channel, status, sentAt)
SafetyGuidance (id, alertId, instruction, priority)

-- Team Management
Member (id, name, email, phone, role, teamId)
Team (id, name, leaderId, description)
TeamMembership (id, teamId, memberId, joinedAt)

-- Monitoring
WeatherData (id, zoneId, temperature, humidity, rainfall, recordedAt)
Subscription (id, userId, locationId, notifyFor)
```

### Relationships

```
District 1──N Zone 1──N Location 1──N Alert
User 1──N Subscription N──1 Location
User 1──N Notification N──1 Alert
Alert 1──N SafetyGuidance
Member N──N Team (through TeamMembership)
Zone 1──N WeatherData
```

## Caching Strategy

### Cache Layers

1. **Browser Cache**
   - Static assets (CSS, JS, images)
   - Service worker for offline support

2. **CDN Cache**
   - Public pages
   - Static resources
   - TTL: 1 hour - 1 day

3. **Application Cache (Redis)**
   - API responses
   - Session data
   - Rate limiting counters
   - TTL: 5 minutes - 1 hour

### Cache Keys

```typescript
// Alert cache
`alerts:all` - All active alerts
`alerts:location:{locationId}` - Alerts by location
`alerts:severity:{severity}` - Alerts by severity
`alert:{id}` - Single alert details

// User cache
`user:{id}` - User profile
`user:session:{sessionId}` - Session data

// Weather cache
`weather:zone:{zoneId}` - Latest weather data
```

### Cache Invalidation

```typescript
// On alert creation
invalidate(["alerts:all", `alerts:location:{locationId}`]);

// On alert update
invalidate([`alert:{id}`, "alerts:all"]);

// On user update
invalidate([`user:{id}`]);
```

## Security Architecture

### Authentication Flow

```
1. User Login
   └─> POST /api/auth/login
   └─> Validate credentials
   └─> Generate JWT token
   └─> Store session in Redis
   └─> Return token to client

2. Authenticated Request
   └─> Client sends token in Authorization header
   └─> API validates token signature
   └─> Check token expiration
   └─> Verify session in Redis
   └─> Extract user info
   └─> Process request

3. Token Refresh
   └─> Client sends refresh token
   └─> Validate refresh token
   └─> Generate new access token
   └─> Return new token
```

### Authorization Levels

```typescript
enum Role {
  USER = "USER", // View alerts, manage profile
  VOLUNTEER = "VOLUNTEER", // + Report incidents
  COMMANDER = "COMMANDER", // + Manage team
  ADMIN = "ADMIN", // + Create alerts, manage users
}
```

### Security Measures

1. **Input Validation**: Zod schemas on all inputs
2. **SQL Injection**: Prevented by Prisma parameterized queries
3. **XSS**: React auto-escapes output
4. **CSRF**: SameSite cookies, token validation
5. **Rate Limiting**: Redis-based rate limiter
6. **Password Security**: bcrypt hashing
7. **Secrets Management**: Environment variables, AWS Secrets Manager

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    │
    ├─> App Instance 1 ──┐
    ├─> App Instance 2 ──┼─> Shared Redis
    ├─> App Instance 3 ──┤
    └─> App Instance N ──┘
                │
                └─> Database (with read replicas)
```

### Database Optimization

1. **Indexes**: On foreign keys and frequently queried columns
2. **Connection Pooling**: Prisma manages connections
3. **Read Replicas**: For read-heavy operations
4. **Partitioning**: Time-based partitioning for alerts and logs

### Caching Strategy

1. **Cache-aside**: Application manages cache
2. **Write-through**: Update cache on writes
3. **TTL-based expiration**: Automatic cleanup
4. **Cache warming**: Pre-populate on deployment

## Monitoring & Observability

### Metrics

```typescript
// Application Metrics
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Cache hit rate (%)

// Infrastructure Metrics
- CPU usage (%)
- Memory usage (%)
- Database connections (count)
- Redis memory (MB)

// Business Metrics
- Active alerts (count)
- User registrations (count/day)
- Notification delivery rate (%)
```

### Logging

```typescript
// Log Levels
ERROR   - Application errors, exceptions
WARN    - Degraded performance, deprecated usage
INFO    - Important business events
DEBUG   - Detailed diagnostic information

// Log Structure
{
  timestamp: '2026-02-11T10:00:00Z',
  level: 'INFO',
  service: 'api',
  endpoint: '/api/alerts',
  userId: 'user-123',
  duration: 45,
  message: 'Alert created successfully'
}
```

### Health Checks

```typescript
// Endpoints
GET /api/health          - Basic health check
GET /api/health/db       - Database connectivity
GET /api/health/redis    - Redis connectivity
GET /api/health/detailed - Full system status
```

## Deployment Architecture

### Development Environment

```
Local Machine
├── Next.js Dev Server (port 3000)
├── PostgreSQL (Docker, port 5432)
└── Redis (Docker, port 6379)
```

### Production Environment (AWS)

```
Route 53 (DNS)
    │
CloudFront (CDN)
    │
Application Load Balancer
    │
ECS Cluster
├── Task 1 (App Container)
├── Task 2 (App Container)
└── Task N (App Container)
    │
    ├─> RDS PostgreSQL (Multi-AZ)
    └─> ElastiCache Redis (Cluster mode)
```

### CI/CD Pipeline

```
GitHub Push
    │
    ├─> GitHub Actions
    │   ├─> Run tests
    │   ├─> Build Docker image
    │   ├─> Push to ECR
    │   └─> Deploy to ECS
    │
    └─> Deployment
        ├─> Run migrations
        ├─> Update ECS service
        └─> Health check verification
```

## Future Enhancements

1. **Microservices**: Split into separate services (alerts, notifications, users)
2. **Message Queue**: Add RabbitMQ/SQS for async processing
3. **GraphQL**: Alternative API layer for flexible queries
4. **WebSockets**: Real-time alert updates
5. **Mobile Apps**: Native iOS/Android applications
6. **ML Integration**: Predictive flood risk modeling
7. **Multi-region**: Deploy across multiple regions for HA

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
