# User CRUD API Documentation

This document describes the complete CRUD operations implemented for the User entity in the Acquisitions Express.js application.

## Authentication

All user CRUD endpoints require authentication. Users must include a valid JWT token either:

- As a cookie named `token`
- In the `Authorization` header as `Bearer <token>`

## Endpoints

### 1. GET /api/users

**Get all users**

- **Authentication**: Required
- **Authorization**: Any authenticated user
- **Response**: Array of all users (without passwords)

```json
{
  "message": "Successfully retrieved users",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 2. GET /api/users/:id

**Get user by ID**

- **Authentication**: Required
- **Authorization**: Users can access their own data, admins can access any user's data
- **Validation**: ID must be a positive integer
- **Response**: Single user object

```json
{
  "message": "Successfully retrieved user",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

**Error Responses:**

- `400` - Invalid ID format
- `401` - Not authenticated
- `403` - Access denied (trying to access another user's data without admin privileges)
- `404` - User not found

### 3. PUT /api/users/:id

**Update user by ID**

- **Authentication**: Required
- **Authorization**:
  - Users can update their own information
  - Only admins can change user roles
  - Only admins can update other users' information
- **Validation**:
  - ID must be a positive integer
  - At least one field must be provided for update
  - Email must be valid format and unique
  - Password must be at least 8 characters
  - Name must be 2-255 characters
  - Role must be either 'user' or 'admin'

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "newpassword123",
  "role": "admin"
}
```

**Response:**

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T11:00:00Z"
  }
}
```

**Error Responses:**

- `400` - Validation failed
- `401` - Not authenticated
- `403` - Access denied (insufficient privileges)
- `404` - User not found
- `409` - Email already exists

### 4. DELETE /api/users/:id

**Delete user by ID**

- **Authentication**: Required
- **Authorization**:
  - Users can delete their own account
  - Admins can delete any user account
- **Validation**: ID must be a positive integer

**Response:**

```json
{
  "message": "User deleted successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

- `400` - Invalid ID format
- `401` - Not authenticated
- `403` - Access denied (trying to delete another user without admin privileges)
- `404` - User not found

## Business Rules

### Role Management

- Only admin users can change user roles
- Only admin users can update other users' information
- Users can always update their own information (except role)

### Account Deletion

- Users can delete their own accounts
- Admin users can delete any account
- When an admin deletes their own account, a warning is logged

### Data Validation

- All user inputs are validated using Zod schemas
- Passwords are automatically hashed when updated
- Email uniqueness is enforced across all users
- Timestamps are automatically managed

### Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- Comprehensive logging of all operations

## Implementation Details

### Files Modified/Created:

1. `src/validations/users.validation.js` - Validation schemas
2. `src/middleware/auth.middleware.js` - Authentication middleware
3. `src/services/users.service.js` - Extended with CRUD operations
4. `src/controllers/users.controller.js` - Extended with CRUD controllers
5. `src/routes/users.routes.js` - Updated with proper endpoints

### Service Functions:

- `getAllUsers()` - Retrieve all users
- `getUserById(id)` - Retrieve user by ID
- `updateUser(id, updates)` - Update user information
- `deleteUser(id)` - Delete user

### Controller Functions:

- `fetchAllUsers()` - Handle GET /users
- `fetchUserById()` - Handle GET /users/:id
- `updateUserById()` - Handle PUT /users/:id
- `deleteUserById()` - Handle DELETE /users/:id

### Validation Schemas:

- `userIdSchema` - Validates user ID parameters
- `updateUserSchema` - Validates user update requests

### Middleware:

- `authenticate` - Verifies JWT tokens and loads user data
- `requireSelfOrAdmin` - Ensures users can only access their own data or admin access
- `requireAdmin` - Ensures only admin users can access endpoint

## Testing Examples

### Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get All Users

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User by ID

```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

All endpoints include comprehensive error handling with:

- Proper HTTP status codes
- Detailed error messages
- Request validation
- Database error handling
- Authentication and authorization checks
- Comprehensive logging

The implementation follows REST API best practices and maintains consistency with the existing authentication system.
