# Authentication Testing Guide

This guide explains how to test the authentication implementation in your task management API.

## Overview

The authentication system has been implemented with:
- JWT-based authentication middleware
- User-specific task management
- Protected routes for all task operations
- Comprehensive test coverage

## Files Modified

1. **`src/models/Task.ts`** - Added user association to tasks
2. **`src/controllers/taskController.ts`** - Updated to handle user-specific operations
3. **`src/routes/taskRoutes.ts`** - Added authentication to GET route
4. **`src/tests/auth.test.ts`** - New comprehensive authentication tests
5. **`src/tests/tasks.test.ts`** - Updated existing tests with authentication

## Testing the Implementation

### 1. Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- src/tests/auth.test.ts
npm test -- src/tests/tasks.test.ts
```

### 2. Manual Testing with API Clients

#### Getting an Authentication Token

First, register a user or login to get a JWT token:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response for subsequent requests.

#### Testing Protected Routes

```bash
# Get tasks (requires authentication)
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a task (requires authentication)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Task",
    "description": "Task description",
    "priority": "high"
  }'

# Test authentication endpoint
curl -X GET http://localhost:3000/api/tasks/test-auth \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Testing Authentication Failure

```bash
# Without token
curl -X GET http://localhost:3000/api/tasks

# With invalid token
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer invalid-token"

# With expired token (wait for it to expire)
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

### 3. Test Scenarios Covered

#### Authentication Middleware Tests
- ✅ Valid token allows access
- ✅ No token denies access
- ✅ Invalid token denies access
- ✅ Expired token denies access

#### Task Operation Tests
- ✅ Create task with valid authentication
- ✅ Get only user's tasks (not other users')
- ✅ Cannot create task without authentication
- ✅ Cannot update other user's tasks
- ✅ Cannot delete other user's tasks
- ✅ Cannot get tasks without authentication

### 4. Testing User Isolation

The system ensures that users can only access their own tasks:
- User A cannot see User B's tasks
- User A cannot update User B's tasks
- User A cannot delete User B's tasks

### 5. Edge Cases Tested

- **Missing Authorization Header**: Returns 401 with proper message
- **Malformed Token**: Returns 401 with "Invalid token" message
- **Expired Token**: Returns 401 with "Invalid token" message
- **Non-existent User Token**: Returns 401 with "User not found" message
- **Cross-user Access Attempts**: Returns 404 with "Task not found or access denied"

### 6. Swagger Documentation

The API documentation includes security schemas:
- All protected routes show the `bearerAuth` security requirement
- OpenAPI spec includes JWT bearer token definition

### 7. Environment Variables

For testing, ensure these environment variables are set:

```bash
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=604800  # 7 days in seconds
MONGODB_URI=mongodb://localhost:27017/task-app-test
```

## Troubleshooting

### Common Issues

1. **"Cannot find name 'jwt'" error**: Ensure jsonwebtoken is installed
2. **"User not found" error**: Check if user exists in database
3. **Token validation issues**: Verify JWT_SECRET matches between server and client

### Debug Tips

1. Enable debug logging in auth middleware (already implemented)
2. Check console logs for authentication process
3. Verify token expiration times
4. Test with different users to confirm isolation

## Security Considerations

- Tokens are validated on every protected request
- User credentials are never stored in tokens
- Password hashing is handled by the User model
- Token expiration prevents long-term access if compromised
- User isolation prevents cross-user data access

The implementation follows security best practices for JWT authentication and user data isolation.
