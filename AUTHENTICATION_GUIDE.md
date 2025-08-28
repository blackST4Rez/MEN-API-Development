# Authentication System - Usage Guide

Your authentication system is already fully implemented and ready to use! Here's how to test it:

## 🚀 Quick Start

1. **Server is already running** at http://localhost:3000
2. **API Documentation** available at http://localhost:3000/api-docs

## 📋 Available Endpoints

### 1. Register a New User
**Endpoint:** `POST /api/auth/register`
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login User
**Endpoint:** `POST /api/auth/login`
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🧪 Testing the Authentication

### Method 1: Using Swagger UI (Recommended)
1. Open http://localhost:3000/api-docs
2. Scroll to the "Authentication" section
3. Click on "POST /api/auth/register"
4. Click "Try it out"
5. Enter user details and click "Execute"
6. Copy the returned JWT token
7. Use the token for authenticated requests

### Method 2: Using curl commands

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## 🔐 JWT Token Usage

After successful login/register, you'll receive a JWT token:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id_here",
      "name": "Test User",
      "email": "test@example.com"
    }
  }
}
```

**Use the token in requests:**
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## ⚙️ Environment Variables

Make sure your `.env` file has:
```
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=604800  # 7 days in seconds
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- JWT tokens with expiration
- Input validation using Zod schemas
- Unique email validation
- Password minimum length enforcement (6 characters)

## 📊 Response Examples

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

## 🎯 Next Steps

1. Test the registration and login endpoints
2. Use the returned JWT token for authenticated task operations
3. Explore the Swagger documentation for detailed API information
4. Consider adding role-based authentication if needed
