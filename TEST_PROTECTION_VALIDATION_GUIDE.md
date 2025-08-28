# How to Check Test Protection and Data Validation

## Route Protection Testing

### 1. Authentication Middleware Tests
The authentication middleware (`src/middleware/auth.ts`) is tested to ensure:
- ✅ **No token provided**: Returns 401 with "Access denied. No token provided."
- ✅ **Invalid token format**: Returns 401 with "Invalid token."
- ✅ **Expired token**: Returns 401 with "Invalid token."
- ✅ **Token for non-existent user**: Returns 401 with "Invalid token. User not found."

### 2. Protected Route Access
Test that protected routes require authentication:
```bash
# Test without token (should fail)
curl -X GET http://localhost:3000/api/tasks

# Test with valid token (should succeed)
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer your-valid-token"
```

## Data Validation Testing

### 1. Task Validation Rules
The task schema (`src/schemas/taskSchemas.ts`) validates:
- **Title**: Required, min 1 char, max 100 chars
- **Description**: Optional string
- **Completed**: Boolean, defaults to false
- **Priority**: Enum of ["low", "medium", "high"], defaults to "medium"
- **DueDate**: Optional date

### 2. Validation Test Scenarios
Tests verify these validation scenarios:

#### Title Validation
```bash
# Empty title (should fail)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'

# Title too long (should fail)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title": "a".repeat(101)}'

# Missing title (should fail)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Priority Validation
```bash
# Invalid priority (should fail)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "priority": "invalid"}'

# Valid priorities (should succeed)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "priority": "low"}'

curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "priority": "medium"}'

curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "priority": "high"}'
```

## Running the Tests

### 1. Run All Tests
```bash
npm test
```

### 2. Run Specific Test Suites
```bash
# Run only authentication tests
npm test -- src/tests/auth.test.ts

# Run only task tests
npm test -- src/tests/tasks.test.ts
```

### 3. Test Coverage Verification
The current test suite covers:
- ✅ **Authentication**: All scenarios (register, login, token validation)
- ✅ **Route Protection**: All protected endpoints
- ✅ **Data Validation**: All validation rules for tasks
- ✅ **Error Handling**: Proper error responses for invalid requests
- ✅ **Edge Cases**: Various invalid input scenarios

## Manual Testing Steps

### Step 1: Start the Server
```bash
npm run dev
```

### Step 2: Test Authentication
```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Step 3: Test Protected Routes
```bash
# Use the token from login response
TOKEN="your-jwt-token-here"

# Test protected route with token
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Test without token (should fail)
curl -X GET http://localhost:3000/api/tasks
```

### Step 4: Test Data Validation
```bash
# Test valid task creation
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Valid Task","priority":"high"}'

# Test invalid task (missing title)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test invalid priority
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","priority":"invalid"}'
```

## Expected Responses

### Successful Response (201/200)
```json
{
  "success": true,
  "data": { ... }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

The testing framework ensures that both route protection and data validation are working correctly through automated tests and provides clear error messages for manual testing.
