import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export const Successful = (
  type: any,
  isArray?: boolean,
  message?: string,
): MethodDecorator => {
  return ApiResponse({
    type,
    isArray: isArray || false,
    status: HttpStatus.OK,
    description: message || 'Request processed successfully',
  });
};

export const Created = (type: any, message?: string): MethodDecorator => {
  return ApiResponse({
    type,
    status: HttpStatus.CREATED,
    description: message || 'Request processed successfully',
  });
};

export const BadRequest = (message?: string): MethodDecorator => {
  return ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: message || 'Bad request',
  });
};

export const Unauthorized = (message?: string): MethodDecorator => {
  return ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: message || 'Unauthorized request',
  });
};

export const NotFound = (message?: string): MethodDecorator => {
  return ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: message || 'Not found',
  });
};

export const InternalServerError = (message?: string): MethodDecorator => {
  return ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: message || 'Internal server error',
  });
};

export const BadGateway = (message?: string): MethodDecorator => {
  return ApiResponse({
    status: HttpStatus.BAD_GATEWAY,
    description: message || 'Internal communication error',
  });
};

export const ServiceUnavailable = (message?: string): MethodDecorator => {
  return ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: message || 'Service unavailable',
  });
};
