# Products & Categories API

A modern, production-ready TypeScript/Express.js RESTful API for managing products, categories, and users with PostgreSQL database, OAuth authentication, comprehensive error handling, and structured logging.

## 🚀 Features

- ✅ **TypeScript** - Fully typed codebase with strict configuration
- ✅ **PostgreSQL + Drizzle ORM** - Type-safe database operations with migrations
- ✅ **OAuth Authentication** - Google OAuth integration with JWT tokens
- ✅ **Zod Validation** - Schema validation for all endpoints
- ✅ **Custom Error Handling** - Comprehensive error classes with HTTP status mapping
- ✅ **Winston Logging** - Structured logging with file and console outputs
- ✅ **Security** - Helmet, CORS, rate limiting, and authentication middleware
- ✅ **Clean Architecture** - Repository pattern with dependency injection
- ✅ **Database Migrations** - Version-controlled schema changes
- ✅ **Testing Suite** - Unit and integration tests with Jest
- ✅ **Development Tools** - ESLint, Prettier, tsx with watch mode

## 🏗️ Architecture

### Clean Architecture Pattern

```
Routes → Validation → Controllers → Services → Repositories → Database
  ↓                     ↓            ↓          ↓             ↓
Response ← Error Handler ← Single Line ← Single Line ← Business Logic
```

```
src/
├── common/
│   └── errors/           # Custom error classes
├── config/
│   ├── database.config.ts # Database configuration
│   ├── env.ts            # Environment validation
│   └── passport.ts       # OAuth configuration
├── controllers/          # Request handlers (pass-through)
├── db/
│   ├── repositories/     # Database operations & business logic
│   ├── schema/           # Drizzle database schemas
│   ├── index.ts          # Database connection
│   ├── migrate.ts        # Migration runner
│   └── reset.ts          # Database reset scripts
├── middleware/
│   ├── auth.middleware.ts # JWT authentication
│   ├── errorHandler.ts   # Global error handling
│   ├── logging.ts        # Request logging
│   └── validation.ts     # Zod validation middleware
├── routes/               # Route definitions
├── schemas/              # Zod validation schemas
├── services/             # Business logic (pass-through)
├── utils/
│   ├── logger.ts         # Winston logger configuration
│   ├── response.ts       # Response utilities
│   └── health.ts         # Health check
├── app.ts                # Express app configuration
├── container.ts          # Dependency injection
└── index.ts              # Server entry point
```

## ✅ Validation Rules

### Category

- `name`: 1-100 characters, required, unique
- `description`: 1-500 characters, required

### Product

- `name`: 1-100 characters, required, unique per category
- `description`: 1-1000 characters, required
- `price`: Positive integer, max 999999, required
- `stock`: Non-negative integer, required
- `categoryId`: Valid UUID, required, must reference existing category

### User

- `email`: Valid email format, max 255 characters, unique
- `name`: 1-255 characters, required
- `picture`: Valid URL format, optional
- `role`: enum('user', 'admin'), default 'user'

## 🛠️ Development Commands

### Basic Development

```bash
npm run dev          # Start development server with watch mode
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
```

### Database Management

```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema changes directly (dev only)
npm run db:check     # Check for schema drift
npm run db:studio    # Open Drizzle Studio (database GUI)
```

### Database Reset & Seeding

```bash
npm run db:reset:data      # Delete
```

### Key Principles

- **Repository Pattern**: All database operations and business logic in repositories
- **Dependency Injection**: Clean separation of concerns via container pattern
- **Error Handling**: Custom error classes with automatic HTTP status mapping
- **Pass-Through Layers**: Controllers and services are ultra-clean single-line calls
- **Type Safety**: End-to-end TypeScript with Zod validation

## 📋 Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v13+ recommended)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd products-categories-api
npm install
```

### 2. Environment Configuration

Create `.env` file:

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=products_categories_db
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_SSL=false

# Database Pool
POSTGRES_POOL_MIN=0
POSTGRES_POOL_MAX=10
POSTGRES_POOL_IDLE_TIMEOUT=10000

# Database URL (for migrations)
DATABASE_URL=postgresql://username:password@localhost:5432/products_categories_db

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=1h

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate migrations from schema
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Reset database and add sample data
npm run db:fresh
```

### 4. Start Development

```bash
# Start development server with watch mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will start on `http://localhost:3000`

## 🌐 API Endpoints

### Health Check

- `GET /health` - Server health status

### Authentication

| Method | Endpoint                    | Description              | Auth Required |
| ------ | --------------------------- | ------------------------ | ------------- |
| `GET`  | `/api/auth/google`          | Initiate Google OAuth    | No            |
| `GET`  | `/api/auth/google/callback` | OAuth callback           | No            |
| `GET`  | `/api/auth/profile`         | Get current user profile | Yes           |
| `POST` | `/api/auth/logout`          | Logout user              | No            |

### Categories

| Method   | Endpoint                       | Description              | Auth Required |
| -------- | ------------------------------ | ------------------------ | ------------- |
| `GET`    | `/api/categories`              | Get all categories       | No            |
| `GET`    | `/api/categories/:id`          | Get category by ID       | No            |
| `GET`    | `/api/categories/:id/products` | Get products in category | No            |
| `POST`   | `/api/categories`              | Create new category      | Yes           |
| `PUT`    | `/api/categories/:id`          | Update category          | Yes           |
| `DELETE` | `/api/categories/:id`          | Delete category          | Yes           |

### Products

| Method   | Endpoint                     | Description               | Auth Required |
| -------- | ---------------------------- | ------------------------- | ------------- |
| `GET`    | `/api/products`              | Get all products          | No            |
| `GET`    | `/api/products/:id`          | Get product by ID         | No            |
| `GET`    | `/api/products/:id/category` | Get product with category | No            |
| `POST`   | `/api/products`              | Create new product        | Yes           |
| `PUT`    | `/api/products/:id`          | Update product            | Yes           |
| `DELETE` | `/api/products/:id`          | Delete product            | Yes           |

### User Management (Admin Only)

| Method   | Endpoint              | Description    | Auth Required |
| -------- | --------------------- | -------------- | ------------- |
| `GET`    | `/api/auth/users`     | Get all users  | Admin         |
| `GET`    | `/api/auth/users/:id` | Get user by ID | Admin         |
| `PUT`    | `/api/auth/users/:id` | Update user    | Admin         |
| `DELETE` | `/api/auth/users/:id` | Delete user    | Admin         |

## 📝 Request/Response Examples

### Authentication Flow

```bash
# 1. Initiate Google OAuth
GET /api/auth/google

# 2. After OAuth success, you'll receive:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}

# 3. Use token in subsequent requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Create Category

```bash
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

### Create Product

```bash
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "iPhone 15",
  "description": "Latest iPhone model",
  "price": 999,
  "stock": 50,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response Formats

#### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

#### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Name is required, Price must be positive",
  "errors": [
    {
      "path": "name",
      "message": "Name is required"
    },
    {
      "path": "price",
      "message": "Price must be positive"
    }
  ]
}
```

## 🔒 Business Rules

- **Categories can exist without products** (partial participation)
- **Products must belong to a category** (total participation)
- **One category can have multiple products** (1:M relationship)
- **Categories with products cannot be deleted**
- **Duplicate category names are not allowed**
- **Duplicate product names within the same category are not allowed**
- **All IDs are UUIDs**
- **All timestamps are ISO 8601 format**
- **Price is stored as integer (no decimal places)**

## 📁 Project Structure

```
src/
├── common/
│   └── errors/           # Custom error classes
├── config/
│   ├── database.config.ts # Database configuration
│   ├── env.ts            # Environment validation
│   └── passport.ts       # OAuth configuration
├── controllers/          # Request handlers (pass-through)
├── db/
│   ├── repositories/     # Database operations & business logic
│   ├── schema/           # Drizzle database schemas
│   ├── index.ts          # Database connection
│   ├── migrate.ts        # Migration runner
│   └── reset.ts          # Database reset scripts
├── middleware/
│   ├── auth.middleware.ts # JWT authentication
│   ├── errorHandler.ts   # Global error handling
│   ├── logging.ts        # Request logging
│   └── validation.ts     # Zod validation middleware
├── routes/               # Route definitions
├── schemas/              # Zod validation schemas
├── services/             # Business logic (pass-through)
├── utils/
│   ├── logger.ts         # Winston logger configuration
│   ├── response.ts       # Response utilities
│   └── health.ts         # Health check
├── app.ts                # Express app configuration
├── container.ts          # Dependency injection
└── index.ts              # Server entry point
```
