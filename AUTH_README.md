# JWT Authentication System

This project implements a comprehensive JWT-based authentication system for NestJS applications.

## 📋 Features

- User registration with email and password
- Secure password hashing using bcrypt
- JWT token generation and validation
- Protected routes with JWT authentication guard
- User profile retrieval for authenticated users
- Comprehensive validation and error handling

## 🚀 API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data (invalid email, short password, etc.)
- `409 Conflict` - User with email already exists

#### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid credentials

#### 3. Get User Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token

## 🏗️ Architecture

### Module Structure
```
src/
├── auth/
│   ├── dtos/
│   │   ├── login.dto.ts          # Login validation DTO
│   │   └── register.dto.ts       # Registration validation DTO
│   ├── guards/
│   │   └── jwt-auth.guard.ts     # JWT authentication guard
│   ├── strategies/
│   │   └── jwt.strategy.ts       # JWT validation strategy
│   ├── auth.controller.ts        # Authentication endpoints
│   ├── auth.module.ts           # Auth module configuration
│   └── auth.service.ts          # Authentication business logic
└── user/
    ├── user.schema.ts           # User database schema
    ├── user.service.ts          # User CRUD operations
    └── ...
```

### Key Components

#### AuthService
- Handles user registration with password hashing
- Manages user login with credential validation
- Generates JWT tokens upon successful authentication
- Provides user profile retrieval

#### JwtStrategy
- Validates JWT tokens from Authorization headers
- Extracts user information from token payload
- Integrates with Passport.js for seamless authentication

#### JwtAuthGuard
- Protects routes requiring authentication
- Uses JwtStrategy for token validation
- Returns 401 Unauthorized for invalid/missing tokens

## 🔒 Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Original passwords are never stored in the database
- Password field is excluded from query results by default

### JWT Configuration
- Tokens expire after 24 hours
- Uses secure secret key (configurable via environment variables)
- Token payload includes user ID and email for identification

### Input Validation
- Email format validation
- Password minimum length (6 characters)
- Name minimum length (2 characters)
- Request body validation with class-validator

## 🧪 Testing

The authentication system includes comprehensive unit tests:

### Test Coverage
- **AuthService**: Registration, login, and profile retrieval logic
- **AuthController**: HTTP endpoint handling
- **JwtStrategy**: Token validation and user extraction
- **E2E Tests**: Complete authentication flow (requires MongoDB)

### Running Tests
```bash
# Unit tests
npm test -- --testPathPatterns=auth/

# E2E tests (requires MongoDB)
npm run test:e2e -- --testPathPatterns=auth.e2e-spec.ts
```

## 🚀 Usage Examples

### Frontend Integration (JavaScript/TypeScript)

#### Registration
```javascript
const registerUser = async (userData) => {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return response.json();
};
```

#### Login and Token Storage
```javascript
const loginUser = async (credentials) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  
  // Store token in localStorage or secure storage
  localStorage.setItem('access_token', data.access_token);
  
  return data;
};
```

#### Authenticated Requests
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
};
```

## 🔧 Configuration

### Environment Variables
```env
# JWT Secret (recommended to use a strong, random string in production)
JWT_SECRET=your-super-secret-jwt-key

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/nestjs-learning

# Application Port
PORT=3000
```

### JWT Configuration
The JWT module is configured in `auth.module.ts`:
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'default-secret-key',
  signOptions: { expiresIn: '24h' },
})
```

## 🛡️ Security Best Practices

1. **Use Strong JWT Secrets**: Always use a strong, random secret in production
2. **HTTPS Only**: Use HTTPS in production to protect tokens in transit
3. **Token Expiration**: Tokens expire after 24 hours to limit exposure
4. **Password Hashing**: Passwords are hashed with bcrypt (salt rounds: 10)
5. **Input Validation**: All inputs are validated using class-validator
6. **Error Handling**: Consistent error responses without information leakage

## 🚀 Future Enhancements

- **Refresh Tokens**: Implement refresh token mechanism for better security
- **Role-Based Access Control**: Add user roles and permissions
- **Rate Limiting**: Implement login attempt throttling
- **Email Verification**: Add email confirmation for registration
- **Password Reset**: Implement password reset functionality
- **Two-Factor Authentication**: Add 2FA support

## 📚 Dependencies

- `@nestjs/jwt` - JWT token handling
- `@nestjs/passport` - Authentication middleware
- `passport-jwt` - JWT strategy for Passport
- `bcrypt` - Password hashing
- `class-validator` - Input validation
- `mongoose` - MongoDB ODM

## 🤝 Contributing

This authentication system follows NestJS best practices and is designed to be:
- **Modular**: Easy to integrate into existing projects
- **Secure**: Implements security best practices
- **Testable**: Comprehensive test coverage
- **Scalable**: Ready for production use

The implementation provides a solid foundation for authentication that can be extended based on specific project requirements.