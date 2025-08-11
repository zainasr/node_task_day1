# Products & Categories API

A TypeScript/Express.js RESTful API for managing products and categories with robust validation and error handling.

## Features

- ✅ **TypeScript** - Fully typed codebase with strict TypeScript configuration
- ✅ **Express.js** - Fast and minimal web framework
- ✅ **Zod Validation** - Schema validation for all endpoints
- ✅ **In-Memory Storage** - Stateless application with Map-based storage
- ✅ **Error Handling** - Global error handling with async wrapper
- ✅ **Security** - Helmet and CORS middleware
- ✅ **Development Tools** - ESLint, Prettier, and tsx with watch mode

## Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server with watch mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | Get all categories |
| `GET` | `/api/categories/:id` | Get category by ID |
| `GET` | `/api/categories/:id/products` | Get products in category |
| `POST` | `/api/categories` | Create new category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get product by ID |
| `POST` | `/api/products` | Create new product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

## Request/Response Examples

### Create Category
```bash
POST /api/categories
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

### Create Product
```bash
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15",
  "description": "Latest iPhone model",
  "price": 999.99,
  "stock": 50,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### API Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Business Rules

- **Categories can exist without products** (partial participation)
- **Products must belong to a category** (total participation)
- **One category can have multiple products** (1:M relationship)
- **Categories with products cannot be deleted**
- **All IDs are UUIDs**
- **All timestamps are ISO 8601 format**

## Project Structure

```
src/
├── controllers/        # Request handlers
├── data/              # In-memory data store
├── middleware/        # Custom middleware
├── routes/            # Route definitions
├── schemas/           # Zod validation schemas
├── types/             # TypeScript interfaces
├── utils/             # Utility functions
├── app.ts             # Express app configuration
└── index.ts           # Server entry point
```

## Validation Rules

### Category
- `name`: 1-100 characters, required
- `description`: 1-500 characters, required

### Product
- `name`: 1-100 characters, required
- `description`: 1-1000 characters, required
- `price`: Positive number, max 999999.99, required
- `stock`: Non-negative integer, required
- `categoryId`: Valid UUID, required

## Development Notes

- Uses `tsx` for running TypeScript files directly
- Watch mode automatically restarts on file changes
- Strict TypeScript configuration for better code quality
- ESLint with TypeScript rules for code consistency
- Prettier for automatic code formatting
- Global async error handling wrapper 