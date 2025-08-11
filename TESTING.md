# Testing Guide

This document explains how to run and understand the comprehensive test suite for the Products & Categories API.

## 🧪 Test Structure

```
tests/
├── setup/
│   └── testSetup.ts           # Global test configuration and utilities
├── unit/                      # Unit tests (test individual functions)
│   ├── data/
│   │   ├── categoryStore.test.ts    # Category store functions
│   │   └── productStore.test.ts     # Product store functions
│   ├── controllers/
│   │   └── categoryController.test.ts # Category controller logic
│   └── utils/
│       └── response.test.ts         # Response utility functions
└── integration/               # Integration tests (test full request/response)
    └── routes/
        ├── categories.integration.test.ts  # Category endpoints
        └── products.integration.test.ts    # Product endpoints
```

## 🚀 Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode (re-runs tests on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Run Individual Test Files

```bash
# Run specific test file
npx jest tests/unit/data/categoryStore.test.ts

# Run tests matching pattern
npx jest --testNamePattern="create category"

# Run tests in specific directory
npx jest tests/unit/
```

## 📊 Test Coverage

The test suite provides comprehensive coverage:

### Unit Tests (70% of tests)

- **Data Store Functions**: CRUD operations, validation, relationships
- **Controllers**: Business logic, error handling, response formatting
- **Utilities**: Response helpers, validation functions
- **Middleware**: Async handling, validation middleware

### Integration Tests (30% of tests)

- **API Endpoints**: Full request/response cycle
- **Middleware Chain**: Validation → Controller → Response
- **Error Scenarios**: Invalid input, missing resources
- **Business Workflows**: Category-Product relationships

## 🎯 What's Being Tested

### Category Store (Unit Tests)

```typescript
✅ Creating categories with valid data
✅ Generating unique IDs
✅ Retrieving all categories
✅ Finding categories by ID
✅ Updating category fields
✅ Deleting categories (with/without products)
✅ Checking category existence
```

### Product Store (Unit Tests)

```typescript
✅ Creating products with valid data
✅ Product-category relationships
✅ Retrieving products by category
✅ Updating product information
✅ Deleting products
✅ Stock and price validation
```

### Controllers (Unit Tests)

```typescript
✅ Request parameter handling
✅ Business logic execution
✅ Error response formatting
✅ Success response formatting
✅ Validation error handling
```

### API Endpoints (Integration Tests)

```typescript
✅ GET /api/categories - List all categories
✅ POST /api/categories - Create new category
✅ GET /api/categories/:id - Get category by ID
✅ PUT /api/categories/:id - Update category
✅ DELETE /api/categories/:id - Delete category
✅ GET /api/categories/:id/products - Get category products

✅ GET /api/products - List all products
✅ POST /api/products - Create new product
✅ GET /api/products/:id - Get product by ID
✅ PUT /api/products/:id - Update product
✅ DELETE /api/products/:id - Delete product
```

### Business Rules (Integration Tests)

```typescript
✅ Products must belong to existing categories
✅ Categories with products cannot be deleted
✅ Product category can be changed
✅ UUID validation for all IDs
✅ Required field validation
✅ Data type validation (price, stock)
```

## 🔍 Test Examples

### Unit Test Example

```typescript
describe('categoryStore.create', () => {
  it('should create category with valid data', () => {
    // Arrange
    const categoryData = {
      name: 'Electronics',
      description: 'Electronic devices',
    };

    // Act
    const result = categoryStore.create(categoryData);

    // Assert
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Electronics');
    expect(result.createdAt).toBeValidDate();
  });
});
```

### Integration Test Example

```typescript
describe('POST /api/categories', () => {
  it('should create category with valid data', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({
        name: 'Electronics',
        description: 'Electronic devices',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

## 🛠️ Custom Test Utilities

### Custom Matchers

```typescript
expect(uuid).toBeValidUUID(); // Validates UUID format
expect(date).toBeValidDate(); // Validates Date object
```

### Test Data Factories

```typescript
createTestCategory({ name: 'Custom Name' }); // Creates test category
createTestProduct(categoryId, { price: 100 }); // Creates test product
```

### Mock Data

```typescript
mockCategory; // Pre-defined category object
mockProduct; // Pre-defined product object
```

## 🐛 Debugging Tests

### Run Tests in Debug Mode

```bash
# Debug specific test
npx jest --runInBand --no-cache tests/unit/data/categoryStore.test.ts

# Verbose output
npx jest --verbose

# Only failed tests
npx jest --onlyFailures
```

### Common Issues & Solutions

#### Test Isolation Issues

```typescript
// ❌ Problem: Tests affecting each other
describe('category tests', () => {
  const category = categoryStore.create({ name: 'Test' }); // Shared state
});

// ✅ Solution: Create fresh data in each test
describe('category tests', () => {
  beforeEach(() => {
    // Fresh data for each test
  });
});
```

#### Async Test Issues

```typescript
// ❌ Problem: Not waiting for async operations
it('should create category', () => {
  createCategory(); // Missing await
});

// ✅ Solution: Proper async/await
it('should create category', async () => {
  await createCategory();
});
```

## 📈 Coverage Goals

Current coverage targets:

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

### View Coverage Report

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🔄 Continuous Integration

Tests run automatically on:

- Every commit (pre-commit hook)
- Pull requests
- Main branch pushes

### CI Configuration

```bash
# Run in CI environment
NODE_ENV=test npm test
```

## 📝 Writing New Tests

### Adding Unit Tests

1. Create test file: `tests/unit/path/to/module.test.ts`
2. Follow AAA pattern: Arrange, Act, Assert
3. Test happy path and edge cases
4. Mock external dependencies

### Adding Integration Tests

1. Create test file: `tests/integration/routes/endpoint.integration.test.ts`
2. Use supertest for HTTP requests
3. Test full request/response cycle
4. Include error scenarios

### Test Naming Convention

```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should do something when condition', () => {
      // Test implementation
    });
  });
});
```

## 🚨 Test Failures

When tests fail:

1. **Read the error message carefully**
2. **Check if data is properly isolated**
3. **Verify mock configurations**
4. **Run single test to isolate issue**
5. **Check for async/await issues**

Example failure debugging:

```bash
# Run failing test in isolation
npx jest --testNamePattern="should create category" --verbose
```

This comprehensive test suite ensures your API is reliable, maintainable, and bug-free! 🎉
