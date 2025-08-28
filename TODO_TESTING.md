# Testing Protection Routes - TODO

## Test Scenarios to Cover

### 1. Valid Authentication Tests
- [ ] Valid token allows access to protected routes
- [ ] User information is correctly attached to request
- [ ] Tasks can be created with valid authentication
- [ ] User can only access their own tasks

### 2. Invalid Authentication Tests
- [ ] No token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Malformed token returns 401

### 3. Authorization Tests
- [ ] User cannot access other users' tasks
- [ ] User cannot update other users' tasks
- [ ] User cannot delete other users' tasks

### 4. Edge Cases
- [ ] Empty Authorization header
- [ ] Authorization header without "Bearer" prefix
- [ ] Authorization header with empty token
