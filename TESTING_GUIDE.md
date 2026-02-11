# Testing Guide

This guide covers testing strategies and best practices for BhaadShurakshaDal.

## Testing Philosophy

We follow a comprehensive testing approach:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **End-to-End Tests**: Test complete user workflows
- **Manual Testing**: Test UI/UX and edge cases

## Test Structure

```
project/
├── frontend/
│   ├── __tests__/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── jest.config.js
└── prisma/
    └── __tests__/
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

### Specific Test File

```bash
npm test -- path/to/test.spec.ts
```

## Unit Testing

### Testing Utilities

Example: Testing a utility function

```typescript
// lib/utils.ts
export function calculateFloodRisk(rainfall: number, humidity: number): string {
  if (rainfall > 100 && humidity > 80) return "CRITICAL";
  if (rainfall > 50 && humidity > 60) return "HIGH";
  if (rainfall > 20) return "MEDIUM";
  return "LOW";
}

// __tests__/lib/utils.test.ts
import { calculateFloodRisk } from "@/lib/utils";

describe("calculateFloodRisk", () => {
  it("should return CRITICAL for high rainfall and humidity", () => {
    expect(calculateFloodRisk(150, 85)).toBe("CRITICAL");
  });

  it("should return HIGH for moderate conditions", () => {
    expect(calculateFloodRisk(60, 70)).toBe("HIGH");
  });

  it("should return MEDIUM for low-moderate rainfall", () => {
    expect(calculateFloodRisk(30, 50)).toBe("MEDIUM");
  });

  it("should return LOW for minimal rainfall", () => {
    expect(calculateFloodRisk(10, 40)).toBe("LOW");
  });
});
```

### Testing React Components

```typescript
// __tests__/components/AlertCard.test.tsx
import { render, screen } from '@testing-library/react';
import AlertCard from '@/components/AlertCard';

describe('AlertCard', () => {
  const mockAlert = {
    id: '1',
    title: 'Heavy Rainfall Warning',
    severity: 'HIGH',
    description: 'Expected rainfall 100mm',
    issuedAt: new Date('2026-02-11T10:00:00Z'),
  };

  it('should render alert title', () => {
    render(<AlertCard alert={mockAlert} />);
    expect(screen.getByText('Heavy Rainfall Warning')).toBeInTheDocument();
  });

  it('should display severity badge', () => {
    render(<AlertCard alert={mockAlert} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<AlertCard alert={mockAlert} />);
    expect(screen.getByText(/Feb 11, 2026/)).toBeInTheDocument();
  });
});
```

## Integration Testing

### Testing API Routes

```typescript
// __tests__/api/alerts.test.ts
import { createMocks } from "node-mocks-http";
import handler from "@/app/api/alerts/route";

describe("/api/alerts", () => {
  it("GET should return all alerts", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("POST should create new alert", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        title: "Test Alert",
        severity: "MEDIUM",
        locationId: "location-123",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.title).toBe("Test Alert");
  });

  it("should return 400 for invalid data", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        title: "", // Invalid: empty title
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
  });
});
```

### Testing Database Operations

```typescript
// __tests__/lib/queries.test.ts
import { PrismaClient } from "@prisma/client";
import { getAlertsByLocation } from "@/lib/queries";

const prisma = new PrismaClient();

describe("Database Queries", () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear test data
    await prisma.alert.deleteMany();
  });

  it("should fetch alerts by location", async () => {
    // Create test data
    await prisma.alert.create({
      data: {
        title: "Test Alert",
        severity: "HIGH",
        locationId: "loc-1",
        status: "ACTIVE",
      },
    });

    const alerts = await getAlertsByLocation("loc-1");

    expect(alerts).toHaveLength(1);
    expect(alerts[0].title).toBe("Test Alert");
  });

  it("should return empty array for location with no alerts", async () => {
    const alerts = await getAlertsByLocation("loc-999");
    expect(alerts).toHaveLength(0);
  });
});
```

### Testing Redis Cache

```typescript
// __tests__/services/cache.test.ts
import { cacheService } from "@/services/cache.service";

describe("Cache Service", () => {
  beforeEach(async () => {
    await cacheService.clear();
  });

  it("should set and get cached value", async () => {
    await cacheService.set("test-key", { data: "test" }, 60);
    const value = await cacheService.get("test-key");

    expect(value).toEqual({ data: "test" });
  });

  it("should return null for non-existent key", async () => {
    const value = await cacheService.get("non-existent");
    expect(value).toBeNull();
  });

  it("should delete cached value", async () => {
    await cacheService.set("test-key", "value", 60);
    await cacheService.delete("test-key");
    const value = await cacheService.get("test-key");

    expect(value).toBeNull();
  });
});
```

## End-to-End Testing

### Using Playwright

```typescript
// e2e/alert-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Alert Flow", () => {
  test("user can view alerts on dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Navigate to alerts page
    await page.click("text=Alerts");

    // Wait for alerts to load
    await page.waitForSelector('[data-testid="alert-card"]');

    // Verify alerts are displayed
    const alerts = await page.$$('[data-testid="alert-card"]');
    expect(alerts.length).toBeGreaterThan(0);
  });

  test("admin can create new alert", async ({ page }) => {
    // Login as admin
    await page.goto("http://localhost:3000/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Navigate to create alert
    await page.goto("http://localhost:3000/admin/alerts/new");

    // Fill form
    await page.fill('input[name="title"]', "E2E Test Alert");
    await page.selectOption('select[name="severity"]', "HIGH");
    await page.fill('textarea[name="description"]', "Test description");

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator("text=Alert created successfully")).toBeVisible();
  });
});
```

## Testing Best Practices

### 1. Test Naming Convention

```typescript
// Good
it("should return 404 when alert not found", () => {});
it("should validate email format", () => {});

// Bad
it("test1", () => {});
it("works", () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it("should calculate total correctly", () => {
  // Arrange
  const items = [10, 20, 30];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(60);
});
```

### 3. Mock External Dependencies

```typescript
// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    alert: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: "mocked" }),
  }),
);
```

### 4. Test Edge Cases

```typescript
describe("validateEmail", () => {
  it("should accept valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("should reject email without @", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("should reject email without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });

  it("should handle empty string", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("should handle null", () => {
    expect(validateEmail(null)).toBe(false);
  });
});
```

### 5. Use Test Fixtures

```typescript
// __tests__/fixtures/alerts.ts
export const mockAlerts = [
  {
    id: "1",
    title: "Alert 1",
    severity: "HIGH",
    status: "ACTIVE",
  },
  {
    id: "2",
    title: "Alert 2",
    severity: "MEDIUM",
    status: "ACTIVE",
  },
];

// Use in tests
import { mockAlerts } from "./fixtures/alerts";

it("should filter alerts by severity", () => {
  const filtered = filterBySeverity(mockAlerts, "HIGH");
  expect(filtered).toHaveLength(1);
});
```

## Test Coverage Goals

Aim for the following coverage:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### View Coverage Report

```bash
npm test -- --coverage
```

Open `coverage/lcov-report/index.html` in browser for detailed report.

## Continuous Integration

Tests run automatically on:

- Every pull request
- Every push to main branch
- Before deployment

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Manual Testing Checklist

### User Registration

- [ ] Valid email and password
- [ ] Duplicate email handling
- [ ] Password strength validation
- [ ] Email verification (if implemented)

### Alert System

- [ ] View all alerts
- [ ] Filter by severity
- [ ] Filter by location
- [ ] Alert details page
- [ ] Real-time updates

### Admin Functions

- [ ] Create new alert
- [ ] Update alert status
- [ ] Delete alert
- [ ] View all users
- [ ] Broadcast notifications

### Performance

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Caching working correctly

### Security

- [ ] Authentication required for protected routes
- [ ] Authorization checks working
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS prevention

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "test name"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

### Verbose Output

```bash
npm test -- --verbose
```

## Common Testing Issues

### Issue: Tests timeout

**Solution**: Increase timeout

```typescript
jest.setTimeout(10000); // 10 seconds
```

### Issue: Database connection errors

**Solution**: Use test database

```typescript
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
```

### Issue: Flaky tests

**Solution**:

- Avoid time-dependent tests
- Use proper async/await
- Clear state between tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
