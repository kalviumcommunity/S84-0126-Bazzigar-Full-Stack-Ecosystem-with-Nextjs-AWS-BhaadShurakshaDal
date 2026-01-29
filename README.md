# 🌊 BhaadShurakshaDal

### 🚨 AI-Powered Flood Early Warning & Community Alert System

**By Team Baazigaar**

BhaadShurakshaDal is a full-stack web platform that provides real-time flood risk monitoring and early alerts to help communities prepare before disasters strike.  
It uses free weather APIs, intelligent risk logic, and cloud notifications.

---

## 🎯 Problem Statement

Floods cause massive damage every year due to:

- Late warnings
- Poor local awareness
- Lack of real-time accessible data

Most people don’t receive early alerts or understand risk levels clearly.

---

## 💡 Solution

The platform provides:

✅ Live weather monitoring  
✅ Flood risk prediction  
✅ Location-based alerts  
✅ Map visualization  
✅ Emergency safety guidance  
✅ Admin alert broadcasting

---

## 🚀 Features

### 👤 User Features

- 📍 Select district / pincode
- 🌧️ View real-time rainfall & forecast
- 🚦 Risk level indicator
- 🗺️ Map visualization
- 📢 Alerts via SMS / Email / In-app
- 🧭 Safety tips and emergency contacts

### 🛠️ Admin Features

- Add flood-prone zones
- Broadcast alerts
- View registered users
- Monitor alerts

## Understanding Cloud Deployments: Docker → CI/CD → AWS/Azure

### Overview

This assignment explores how we deployed **BhaadShurakshaDal** from local development to the cloud using **Docker**, **CI/CD**, and **AWS/Azure**. The goal was to ensure consistent environments, automate deployment, and handle secrets securely.

### Dockerization

We containerized the app for reliable environments.

**Dockerfile** highlights:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose** for local dev (Next.js + Postgres + Redis):

```yaml
version: "3.8"
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, redis]
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bhaad
  redis:
    image: redis:7
```

---

### CI/CD Pipeline

Automated with **GitHub Actions**:

- Build Docker image
- Run unit tests & linting
- Push image to cloud registry
- Deploy to AWS ECS / Azure App Service

Snippet:

```yaml
name: CI/CD Pipeline
on: [push]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: node-version: '18'
      - run: npm install
      - run: npm test
      - run: docker build -t bhaadshurakshadal .
      - run: ./deploy.sh
```

---

### Cloud Deployment

**AWS:** ECS + RDS + SNS
**Azure:** App Service + PostgreSQL + Communication Services

Secrets and environment variables were securely managed via GitHub Secrets and environment configs.

---

### Reflection

**Challenges:** Docker networking, CI/CD build errors, secure secrets handling
**Successes:** Consistent environments, automated deployments, simplified infrastructure
**Future:** Add monitoring/logging and rollback strategies, explore IaC (Terraform/Bicep)

## 🏗️ High-Level Design (HLD)

### Overview

BhaadShurakshaDal is designed with a **Next.js frontend**, **API backend**, **PostgreSQL database**, and **Redis cache**, deployed on **AWS/Azure** for scalability and reliability.

### Architecture

- **Frontend (Next.js + TypeScript):**
  - Pages: `/login`, `/dashboard`, `/alerts`, `/map`
  - Data Fetching: Client-side fetch for public data, Server Actions / API Routes for sensitive requests

- **Backend (Next.js API Routes / Server Actions):**
  - Handles authentication, alert broadcasting, risk computation
  - Request validation and error handling

- **Database (PostgreSQL + Prisma):**
  - Tables: Users, Alerts, Locations
  - Read/write via Prisma ORM
  - Conceptual migrations for schema updates

- **Cache (Redis):**
  - Stores sessions, frequently accessed alerts
  - Cache-aside strategy with TTL for freshness

- **External Services:**
  - Auth: NextAuth
  - Notifications: AWS SNS / Email
  - File Storage: S3 / Azure Blob

- **Cloud Deployment (AWS/Azure):**
  - App: ECS / App Service
  - DB: RDS / Azure Database for PostgreSQL
  - Cache: ElastiCache / Azure Cache
  - CDN: CloudFront / Azure CDN

- **CI/CD (GitHub Actions):**
  - Build → Test → Migrate → Deploy
  - Dev / Stage / Prod environments

### Data Flow

Client → CDN → Frontend → Backend API → DB / Redis → External Services

### Security & Observability

- Secrets in AWS Secrets Manager / Azure Key Vault
- Logging: CloudWatch / App Insights
- Error tracking: Sentry

## Branch Naming Convention

Our team follows a structured Git branch naming pattern:

- feature/<name> → for new features
- fix/<name> → for bug fixes
- chore/<name> → for configuration or maintenance
- docs/<name> → for documentation updates

### Examples

- feature/flood-alert-ui
- feature/user-auth
- fix/api-timeout
- docs/readme-update

---

## 📊 Database Schema Design

This section documents the normalized PostgreSQL relational schema for the **BhaadShurakshaDal** flood alert system.

### 🎯 Core Entities (9 Primary Tables)

The system normalizes data across these core models:

1. **User** - System users and administrators
2. **District** - Geographic regions/states
3. **Zone** - Flood-prone zones within districts
4. **Location** - Specific user locations
5. **Alert** - Flood warnings and advisories
6. **Subscription** - User location monitoring preferences
7. **WeatherData** - Real-time weather measurements
8. **Notification** - Sent notifications (Email, SMS, In-app)
9. **SafetyGuidance** - Emergency instructions per alert

**Supporting Tables:** UserPreference, EmergencyContact, DistrictRiskProfile, AuditLog

### 🔗 Relational Model

```
User (1) ──── (Many) Subscription ──── (Many) Location
 |                                         |
 |                                         └─── (1) Zone ──── (1) District
 |
 ├──── (Many) UserAlert ──── (Many) Alert ──── (1) Location
 │
 ├──── (Many) Notification
 │
 ├──── (1) UserPreference
 │
 └──── (Many) EmergencyContact

Zone ──── (Many) WeatherData ──── (Optional) Location
District ──── (Many) DistrictRiskProfile
Alert ──── (Many) SafetyGuidance
```

### 🗂️ Normalization Analysis

#### ✅ First Normal Form (1NF)

All attributes are **atomic** and indivisible:

- WeatherData stores temperature, humidity, rainfall as separate columns (not composite "weather_info")
- Location.pincode is single atomic value
- No repeating groups stored as strings

#### ✅ Second Normal Form (2NF)

All non-key attributes depend on **entire primary key**:

- All tables use single-column UUID PKs
- Zone.floodProneness depends only on Zone.id (not on District.id)
- No partial dependencies

#### ✅ Third Normal Form (3NF)

No **transitive dependencies** between non-key attributes:

- District data NOT repeated in Zone or Location
- UserPreference separated from User (independent entity)
- DistrictRiskProfile separated from District (historical vs. current)
- SafetyGuidance separated from Alert (independent content)

#### ❌ Redundancy Avoided

- User info never duplicated across Notification, UserAlert, Subscription tables
- Risk scores computed on-demand, never pre-calculated/stored redundantly
- Historical data (DistrictRiskProfile, AuditLog) properly versioned/isolated

### 📈 Indexes for Query Performance

**Strategic index coverage for common patterns:**

```sql
-- User lookup (< 1ms)
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_phone ON "User"(phone);

-- Geographic queries (< 5ms)
CREATE INDEX idx_zone_districtId ON "Zone"(districtId);
CREATE INDEX idx_location_zoneId ON "Location"(zoneId);
CREATE INDEX idx_location_pincode ON "Location"(pincode);

-- Alert filtering (< 10ms)
CREATE INDEX idx_alert_locationId ON "Alert"(locationId);
CREATE INDEX idx_alert_severity ON "Alert"(severity);
CREATE INDEX idx_alert_status ON "Alert"(status);
CREATE INDEX idx_alert_issuedAt ON "Alert"(issuedAt);

-- Weather time-series (< 20ms for 24-hr range)
CREATE INDEX idx_weatherData_zoneId ON "WeatherData"(zoneId);
CREATE INDEX idx_weatherData_recordedAt ON "WeatherData"(recordedAt);

-- Notification delivery tracking (< 5ms)
CREATE INDEX idx_notification_userId ON "Notification"(userId);
CREATE INDEX idx_notification_status ON "Notification"(status);
```

### 🚀 Key Design Decisions

**Why This Schema Scales:**

1. **UUID Primary Keys**
   - Enable distributed databases and horizontal sharding
   - Support replication without ID conflicts

2. **Time-based Partitioning Ready**
   - Alert table partitionable by issuedAt (time-series)
   - WeatherData by recordedAt (compress old data)
   - AuditLog by createdAt (compliance retention)

3. **Cascade Deletes**
   - Maintain referential integrity automatically
   - Delete zone → auto-remove zones, locations, alerts

4. **Unique Constraints**
   - Subscription(userId, locationId) → prevents duplicate monitoring
   - UserAlert(userId, alertId) → prevents duplicate notifications

5. **Soft Deletes Support**
   - User.deletedAt allows account deactivation without data loss

### 💡 Real-World Query Examples

```sql
-- 1. Dashboard: User's active alerts
SELECT a.* FROM "Alert" a
JOIN "Subscription" s ON a.locationId = s.locationId
WHERE s.userId = 'user-123' AND a.status = 'ACTIVE'
ORDER BY a.severity DESC;

-- 2. Risk Calculation: Recent weather in zone
SELECT * FROM "WeatherData"
WHERE zoneId = 'zone-456' AND recordedAt > NOW() - INTERVAL '6 hours'
ORDER BY recordedAt DESC;

-- 3. Notification Engine: Users to alert
SELECT DISTINCT u.* FROM "User" u
JOIN "Subscription" s ON u.id = s.userId
JOIN "Alert" a ON s.locationId = a.locationId
WHERE a.id = 'alert-789' AND s.notifyFor @> ARRAY[a.severity];

-- 4. Admin: Districts with recent floods
SELECT d.*, COUNT(a.id) as active_alerts
FROM "District" d
LEFT JOIN "Zone" z ON d.id = z.districtId
LEFT JOIN "Location" l ON z.id = l.zoneId
LEFT JOIN "Alert" a ON l.id = a.locationId AND a.status = 'ACTIVE'
GROUP BY d.id ORDER BY active_alerts DESC;
```

### ✅ Setup & Verification

**1. Apply Migrations**

```bash
cd frontend
npx prisma migrate dev --name init_schema
```

**2. Seed Sample Data**

```bash
npx prisma db seed
```

**3. View in Prisma Studio**

```bash
npx prisma studio  # Opens http://localhost:5555
```

**4. Manual Verification**

```bash
psql -U postgres -d bhaad
\dt  -- List all 14 tables
SELECT count(*) FROM "User";  -- Should show seeded users
SELECT count(*) FROM "Alert";  -- Should show seeded alerts
```

### 📊 Seeded Data Summary

| Entity          | Count | Details                              |
| --------------- | ----- | ------------------------------------ |
| Districts       | 3     | Mumbai, Pune, Kolkata                |
| Zones           | 5     | Mix of HIGH/MEDIUM/LOW risk          |
| Locations       | 6     | Dadar, Colaba, Bandra, Andheri, etc. |
| Users           | 3     | 1 Admin, 2 Regular Users             |
| Alerts          | 3     | CRITICAL, HIGH, MEDIUM severity      |
| Weather Records | 4     | Real-time readings per zone          |
| Subscriptions   | 3     | User → Location monitoring           |
| Notifications   | 3     | Sent via Email, SMS, In-app          |
| Audit Logs      | 3     | User login & alert creation          |

### 🎯 Why This Design Fits BhaadShurakshaDal

1. **Real-time Alerting**: Alert + UserAlert tables enable instant push to subscribed users
2. **Geographic Drill-down**: District → Zone → Location hierarchy supports region-level monitoring
3. **Risk Calculation**: WeatherData + DistrictRiskProfile enable intelligent flood risk scoring
4. **User Personalization**: UserPreference + Subscription allow custom alert channels and thresholds
5. **Emergency Response**: EmergencyContact + SafetyGuidance provide quick access to help resources
6. **Compliance**: AuditLog ensures all critical actions are tracked for disaster management audits

---
