// src/app/api/baby-log/route.test.ts
import { GET, POST, DELETE } from './route';
import { NextResponse } from 'next/server'; // NextResponse is used by the route handlers

// Define mock implementations
const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockMatch = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();

// Chainable mock structure
const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
  },
  from: mockFrom.mockReturnThis(),
  select: mockSelect.mockReturnThis(), 
  insert: mockInsert.mockReturnThis(), // insert().select() needs insert to be chainable
  delete: mockDelete.mockReturnThis(), 
  match: mockMatch.mockResolvedValue({ data: [{}], error: null }), 
  eq: mockEq.mockReturnThis(),
  order: mockOrder.mockReturnThis(), 
};

// Mock @supabase/auth-helpers-nextjs
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => mockSupabaseClient),
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(), 
    set: jest.fn(),
  })),
}));

describe('API /api/baby-log', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mocks, including those on mockSupabaseClient methods

    // Reset to default behaviors for mockSupabaseClient methods directly
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null }); // Default: no user
    
    // For GET: from('baby_log').select('*').eq('user_id', user.id).order('timestamp', { ascending: false })
    // Default for a successful GET returning empty array.
    // The chain needs to be re-mocked for specific return values in tests.
    mockSupabaseClient.from.mockReturnThis();
    mockSupabaseClient.select.mockReturnThis(); // For POST, insert().select()
    mockSupabaseClient.eq.mockReturnThis();
    mockSupabaseClient.order.mockResolvedValue({ data: [], error: null }); // Default for GET

    // For POST: from('baby_log').insert(entry).select()
    // Default for a successful POST
    mockSupabaseClient.insert.mockReturnThis(); // insert() is chainable before select()
    // mockSupabaseClient.select.mockResolvedValueOnce({ data: [createdEntry], error: null }) // This will be set in specific POST tests

    // For DELETE: from('baby_log').delete().match({ id, user_id })
    // Default for a successful DELETE
    mockSupabaseClient.delete.mockReturnThis();
    mockSupabaseClient.match.mockResolvedValue({ error: null });
  });

  describe('GET', () => {
    it('should return 401 if no user is authenticated', async () => {
      // mockGetUser is already set to return no user by default in beforeEach
      const request = new Request('http://localhost/api/baby-log', { method: 'GET' });
      const response = await GET(request);
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('should return user logs if authenticated', async () => {
      const mockUser = { id: 'test-user-id', email: 'user@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
      
      const sampleLogs = [{ id: 1, type: 'urination', timestamp: 'sometime', user_id: mockUser.id }];
      // Specific mock for GET: from('baby_log').select('*').eq('user_id', user.id).order('timestamp', { ascending: false })
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(), 
        eq: jest.fn().mockReturnThis(),    
        order: jest.fn().mockResolvedValueOnce({ data: sampleLogs, error: null }), 
      });

      const request = new Request('http://localhost/api/baby-log', { method: 'GET' });
      const response = await GET(request);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(sampleLogs);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('baby_log');
      const fromResult = mockSupabaseClient.from.mock.results[0].value;
      expect(fromResult.select).toHaveBeenCalledWith('*');
      expect(fromResult.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(fromResult.order).toHaveBeenCalledWith('timestamp', { ascending: false });
    });
  });

  describe('POST', () => {
    it('should return 401 if no user is authenticated', async () => {
      // mockGetUser is already set to return no user by default in beforeEach
      const requestBody = { type: 'urination', timestamp: new Date().toISOString() };
      const request = new Request('http://localhost/api/baby-log', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('should create a log entry if authenticated', async () => {
      const mockUser = { id: 'test-user-id', email: 'user@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

      const requestBody = { type: 'urination', timestamp: new Date().toISOString() };
      const createdEntry = { ...requestBody, id: 1, user_id: mockUser.id };
      
      // Specific mock for POST: from('baby_log').insert(...).select()
      // Ensure 'select' is a separate mock that can be controlled after 'insert'
      const mockSelectAfterInsert = jest.fn().mockResolvedValueOnce({ data: [createdEntry], error: null });
      mockSupabaseClient.from.mockReturnValueOnce({ 
        insert: jest.fn().mockReturnThis(), 
        select: mockSelectAfterInsert,
      });

      const request = new Request('http://localhost/api/baby-log', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual(createdEntry);
      
      const fromResult = mockSupabaseClient.from.mock.results[0].value;
      expect(fromResult.insert).toHaveBeenCalledWith([expect.objectContaining({ type: requestBody.type, user_id: mockUser.id })]);
      expect(mockSelectAfterInsert).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid data (e.g. missing type)', async () => {
      const mockUser = { id: 'test-user-id', email: 'user@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
      
      const requestBody = { timestamp: new Date().toISOString() }; // Missing type
      const request = new Request('http://localhost/api/baby-log', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Missing 'type' in request body");
    });
  });

  describe('DELETE', () => {
    it('should return 401 if no user is authenticated', async () => {
      // mockGetUser is already set to return no user by default in beforeEach
      const requestBody = { id: 1 };
      const request = new Request('http://localhost/api/baby-log', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('should delete a log entry if authenticated and owns the log', async () => {
      const mockUser = { id: 'test-user-id', email: 'user@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
      
      // Specific mock for DELETE: from('baby_log').delete().match(...)
      const mockMatchAfterDelete = jest.fn().mockResolvedValueOnce({ error: null });
      mockSupabaseClient.from.mockReturnValueOnce({ 
        delete: jest.fn().mockReturnThis(), 
        match: mockMatchAfterDelete, 
      });

      const requestBody = { id: 1 };
      const request = new Request('http://localhost/api/baby-log', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Log entry deleted successfully");

      const fromResult = mockSupabaseClient.from.mock.results[0].value;
      expect(fromResult.delete).toHaveBeenCalledTimes(1);
      expect(mockMatchAfterDelete).toHaveBeenCalledWith({ id: requestBody.id, user_id: mockUser.id });
    });
    
    it('should return 500 if delete fails in DB', async () => {
      const mockUser = { id: 'test-user-id', email: 'user@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
      
      const dbError = { message: "DB delete error" };
      const mockMatchAfterDelete = jest.fn().mockResolvedValueOnce({ error: dbError });
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        match: mockMatchAfterDelete,
      });

      const requestBody = { id: 1 };
      const request = new Request('http://localhost/api/baby-log', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toContain("Failed to delete log entry");
    });

     it('should return 400 if no id is provided', async () => {
      const mockUser = { id: 'test-user-id', email: 'user@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
      
      const requestBody = {}; // Missing id
      const request = new Request('http://localhost/api/baby-log', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Missing id in request body");
    });
  });
});
