// tests/unit/utils/response.test.ts

import { Response } from 'express';
import { sendSuccess, sendError, sendValidationError } from '../../../src/utils/response';

describe('Response Utils Unit Tests', () => {
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnValue('mock-json-result');
    mockStatus = jest.fn().mockReturnValue({
      json: mockJson,
    });
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as Partial<Response>;
  });

  describe('sendSuccess', () => {
    it('should send success response with default values', () => {
      // Arrange
      const testData = { id: '123', name: 'Test' };

      // Act
      sendSuccess(mockResponse as Response, testData);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: testData,
      });
    });

    it('should send success response with custom message and status', () => {
      // Arrange
      const testData = { id: '123', name: 'Test' };
      const customMessage = 'Category created successfully';
      const customStatus = 201;

      // Act
      sendSuccess(mockResponse as Response, testData, customMessage, customStatus);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: customMessage,
        data: testData,
      });
    });

    it('should handle null data', () => {
      // Act
      sendSuccess(mockResponse as Response, null, 'Deleted successfully');

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Deleted successfully',
        data: null,
      });
    });

    it('should handle array data', () => {
      // Arrange
      const arrayData = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];

      // Act
      sendSuccess(mockResponse as Response, arrayData, 'Items retrieved');

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Items retrieved',
        data: arrayData,
      });
    });

    it('should return the response object', () => {
      // Arrange
      const testData = { test: true };

      // Act
      const result = sendSuccess(mockResponse as Response, testData);

      // Assert
      expect(result).toBe('mock-json-result');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('sendError', () => {
    it('should send error response with default values', () => {
      // Act
      sendError(mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred',
        error: undefined,
      });
    });

    it('should send error response with custom message and status', () => {
      // Arrange
      const customMessage = 'Category not found';
      const customStatus = 404;
      const errorDetails = 'Category with ID 123 does not exist';

      // Act
      sendError(mockResponse as Response, customMessage, customStatus, errorDetails);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: customMessage,
        error: errorDetails,
      });
    });

    it('should handle error without error details', () => {
      // Act
      sendError(mockResponse as Response, 'Bad request', 400);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Bad request',
        error: undefined,
      });
    });

    it('should return the response object', () => {
      // Act
      const result = sendError(mockResponse as Response, 'Test error');

      // Assert
      expect(result).toBe('mock-json-result');
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('sendValidationError', () => {
    it('should send validation error with default message', () => {
      // Arrange
      const errors = ['Name is required', 'Description must be at least 10 characters'];

      // Act
      sendValidationError(mockResponse as Response, errors);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        error: 'Name is required, Description must be at least 10 characters',
      });
    });

    it('should send validation error with custom message', () => {
      // Arrange
      const errors = ['Invalid email format', 'Password too weak'];
      const customMessage = 'Input validation errors';

      // Act
      sendValidationError(mockResponse as Response, errors, customMessage);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: customMessage,
        error: 'Invalid email format, Password too weak',
      });
    });

    it('should handle single error', () => {
      // Arrange
      const errors = ['Name is required'];

      // Act
      sendValidationError(mockResponse as Response, errors);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        error: 'Name is required',
      });
    });

    it('should handle empty errors array', () => {
      // Arrange
      const errors: string[] = [];

      // Act
      sendValidationError(mockResponse as Response, errors);

      // Assert
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        error: '',
      });
    });

    it('should return the response object', () => {
      // Arrange
      const errors = ['Test error'];

      // Act
      const result = sendValidationError(mockResponse as Response, errors);

      // Assert
      expect(result).toBe('mock-json-result');
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalled();
    });
  });
}); 