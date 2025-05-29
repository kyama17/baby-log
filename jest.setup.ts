// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for Web APIs in Node.js test environment
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
