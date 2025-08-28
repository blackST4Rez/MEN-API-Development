# Testing Guide: Authentication and Route Protection

## Overview
This guide explains how to test the authentication middleware and route protection in your task management API.

## Prerequisites
- Node.js and npm installed
- MongoDB (or MongoDB Memory Server for tests)
- Test dependencies: Jest, Supertest

## Step-by-Step Testing Process

### 1. Running All Tests
```bash
npm test
```

### 2. Running Specific Test Files
```bash
# Run only authentication tests
npm test -- src/tests/auth.test.ts

# Run only task-related tests  
npm test -- src/tests/tasks.test.ts
```

### 3. Test Categories

#### Authentication Tests (`src/tests/auth.test.ts`)
- **User Registration**: Tests for creating new users with valid/invalid data
- **User Login**: Tests for login with valid/invalid credentials
- **Access Control**: Tests for accessing protected routes without authentication

#### Task Tests (`src/tests/tasks.test.ts`)
- **Task Creation**: Tests for creating tasks with authentication
- **Task Retrieval**: Tests for getting user-specific tasks
- **Validation**: Tests for data validation errors
- **Authentication**: Tests for accessing task routes without tokens

### 4. Manual Testing with curl

#### Test Authentication Flow
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Copy the token from the response and use it:
TOKEN="your-jwt-token-here"

# Access protected route with token
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Try accessing without token (should fail)
curl -X GET http://localhost:3000/api/tasks
```

### 5. Testing Edge Cases

#### Invalid Token Scenarios
```bash
# Malformed token
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer invalid.token.here"

# Expired token (if you have one)
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer expired.token.here"

# Missing Bearer prefix
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: validtokenwithoutbearer"
```

#### Validation Error Testing
```bash
# Invalid task data
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"invalid","password":"short"}'
```

### 6. Test Coverage Verification

The current test suite covers:
- ✅ All authentication scenarios (register, login, token validation)
- ✅ Route protection for task endpoints
- ✅ Data validation for both auth and task endpoints
- ✅ Error handling for invalid requests
- ✅ User-specific data isolation

### 7. Adding New Tests

When adding new tests, follow these patterns:

#### For Authentication Tests
```typescript
it("should [test scenario]", async () => {
  const response = await request(app)
    .post("/api/auth/endpoint")
    .send(testData)
    .expect(expectedStatus);

  expect(response.body.success).toBe(expectedResult);
});
```

#### For Protected Route Tests
```typescript
it("should [test scenario]", async () => {
  const response = await request(app)
    .get("/api/protected-route")
    .set("Authorization", `Bearer ${authToken}`)
    .expect(expectedStatus);

  expect(response.body.success).toBe(expectedResult);
});
```

### 8. Debugging Tips

1. **Check console logs**: The authentication middleware logs detailed information
2. **Verify environment variables**: Ensure JWT_SECRET is set
3. **Database connection**: Verify MongoDB is running for manual testing
4. **Test isolation**: Each test runs in isolation with clean database state

### 9. Common Test Scenarios to Verify

- [x] User can register successfully
- [x] User cannot register with duplicate email
- [x] User can login with valid credentials
- [x] User cannot login with invalid credentials
- [x] Protected routes require authentication
- [x] Tasks are user-specific (user can only see their own tasks)
- [x] Validation errors are properly handled
- [x] Invalid tokens are rejected
- [x] Missing tokens are rejected
