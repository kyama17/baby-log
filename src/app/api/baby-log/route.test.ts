import { GET, POST, DELETE } from './route';
import { NextResponse } from 'next/server';

// Mock supabase client
jest.mock("@/utils/supabase/server", () => ({
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

describe("API /api/baby-log", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return user logs if authenticated", async () => {
      const request = new Request('http://localhost/api/baby-log', { method: 'GET' });
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe("POST", () => {
    it("should create a log entry if authenticated", async () => {
      const requestBody = { type: "urination", timestamp: "2025-06-01T06:08:04.501Z" };
      const request = new Request('http://localhost/api/baby-log', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request);
      expect(response.status).toBe(201);
    });
  });

  describe("DELETE", () => {
    it("should delete a log entry if authenticated", async () => {
      const requestBody = { id: 1 };
      const request = new Request('http://localhost/api/baby-log', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await DELETE(request);
      expect(response.status).toBe(200);
    });
  });
});
