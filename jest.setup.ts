// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for Web APIs in Node.js test environment
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock Request and Response for API route tests
global.Request = class Request {
  constructor(public url: string, public init?: RequestInit) {}
  
  async json() {
    return JSON.parse(this.init?.body as string || '{}');
  }
  
  async text() {
    return this.init?.body as string || '';
  }
} as any;

global.Response = class Response {
  constructor(public body?: BodyInit, public init?: ResponseInit) {}
  
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }
} as any;

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: init?.headers || {},
    }),
  },
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock next/headers for cookieStore
export const mockCookieStore = {
  getAll: jest.fn().mockImplementation(() => []),
  set: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => mockCookieStore),
}));

// Mock authenticated user session
import { createClient } from './src/utils/supabase/server';
jest.mock('./src/utils/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        },
        error: null
      })
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ 
        data: { id: 1, timestamp: "2025-06-01T06:08:04.501Z", type: "urination", user_id: "test-user-id" },
        error: null
      })
    }),
    delete: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ 
      data: { id: 1, timestamp: "2025-06-01T06:08:04.501Z", type: "urination", user_id: "test-user-id" },
      error: null
    })
  }))
}));
