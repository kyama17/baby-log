// Environment variables are now set in jest.env.setup.js

// Declare the mock functions that will form the chain
const mockMatch = jest.fn();
const mockOrder = jest.fn(); // Mock for the order method
const mockSelectChain = jest.fn(() => ({ order: mockOrder })); // Mock for the select method that returns order
const mockDeleteChain = jest.fn(() => ({ match: mockMatch }));
const mockInsertChain = jest.fn(() => ({ select: mockSelectChain })); // insert().select() part
const mockFromChain = jest.fn(() => ({ 
  delete: mockDeleteChain,
  insert: mockInsertChain,
  select: mockSelectChain // from().select() part
}));

// This is the function that will be assigned to the mocked createClient
const supabaseClientMockImplementation = () => ({
  from: mockFromChain,
});

// Now, mock the module. The factory function can reference supabaseClientMockImplementation
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => supabaseClientMockImplementation()),
}));

// Import the DELETE, POST, and GET functions to test AFTER mocks are set up.
import { DELETE, POST, GET } from './route';
import { NextResponse } from 'next/server';

describe('DELETE /api/baby-log', () => {
  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    // It's good practice to clear mocks that are module-level like mockMatch, etc.
    // For the createClient mock itself, if you need to check calls to it,
    // you'd import it and clear it:
    // import { createClient } from '@supabase/supabase-js'; (createClient as jest.Mock).mockClear();
    mockFromChain.mockClear();
    mockDeleteChain.mockClear();
    mockMatch.mockClear();
    mockInsertChain.mockClear();
    // mockSelect is now mockSelectChain to avoid confusion if we have a standalone select mock
    mockSelectChain.mockClear(); 
    mockOrder.mockClear(); // Clear order mock
  });

  test('Test Case 1: Successful Deletion', async () => {
    // Mock successful Supabase delete operation
    mockMatch.mockResolvedValueOnce({ error: null });

    const requestBody = { id: 123 };
    const request = new Request('http://localhost/api/baby-log', {
      method: 'DELETE',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await DELETE(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ message: 'Log entry deleted successfully' });
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockDeleteChain).toHaveBeenCalledTimes(1); // This is correct for delete
    expect(mockMatch).toHaveBeenCalledWith({ id: 123 });
  });

  test('Test Case 2: Missing ID', async () => {
    const requestBody = {}; // Missing id
    const request = new Request('http://localhost/api/baby-log', {
      method: 'DELETE',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await DELETE(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({ error: 'Missing id in request body' });
    expect(mockMatch).not.toHaveBeenCalled(); 
    expect(mockDeleteChain).not.toHaveBeenCalled(); 
  });

  test('Test Case 3: Supabase Error', async () => {
    // Mock Supabase delete operation that returns an error
    const supabaseError = { message: 'Supabase error', details: 'Some details', hint: '', code: '50000' };
    mockMatch.mockResolvedValueOnce({ error: supabaseError });

    const requestBody = { id: 456 };
    const request = new Request('http://localhost/api/baby-log', {
      method: 'DELETE',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await DELETE(request);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: 'Failed to delete log entry' });
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockDeleteChain).toHaveBeenCalledTimes(1); // Correct for delete
    expect(mockMatch).toHaveBeenCalledWith({ id: 456 });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting baby log entry:', supabaseError);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

describe('POST /api/baby-log', () => {
  beforeEach(() => {
    mockFromChain.mockClear();
    mockInsertChain.mockClear();
    mockSelectChain.mockClear(); // Was mockSelect
    mockOrder.mockClear(); // Added for consistency, though not directly used by POST's select
  });

  test('Test Case 1: POST with custom timestamp', async () => {
    const mockEntry = { id: 1, type: 'urination', timestamp: '2023-12-25T10:30:00.000Z' };
    // POST uses insert().select(), so mockSelectChain will be called by mockInsertChain
    mockSelectChain.mockResolvedValueOnce({ data: [mockEntry], error: null }); 

    const customTimestamp = '2023-12-25T10:30:00.000Z';
    const requestBody = { type: 'urination', timestamp: customTimestamp };
    const request = new Request('http://localhost/api/baby-log', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual(mockEntry);
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockInsertChain).toHaveBeenCalledWith([{ // Was mockInsert
      type: 'urination',
      timestamp: customTimestamp
    }]);
    expect(mockSelectChain).toHaveBeenCalledTimes(1); // Was mockSelect
  });

  test('Test Case 2: POST without timestamp (uses current time)', async () => {
    const mockEntry = { id: 2, type: 'defecation', timestamp: expect.any(String) };
    // POST uses insert().select(), so mockSelectChain will be called by mockInsertChain
    mockSelectChain.mockResolvedValueOnce({ data: [mockEntry], error: null }); 

    const requestBody = { type: 'defecation' };
    const request = new Request('http://localhost/api/baby-log', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockInsertChain).toHaveBeenCalledWith([{ // Was mockInsert
      type: 'defecation',
      timestamp: expect.any(String)
    }]);
    expect(mockSelectChain).toHaveBeenCalledTimes(1); // Was mockSelect
  });

  test('Test Case 3: Supabase Error on Insert', async () => {
    const supabaseError = { message: 'Supabase insert error', details: 'DB constraint', hint: 'Check data', code: '23505' };
    // POST uses insert().select(), so mockSelectChain (which is the .select() part) 
    // needs to be mocked to return the error.
    mockSelectChain.mockResolvedValueOnce({ data: null, error: supabaseError });

    const requestBody = { type: 'urination', timestamp: '2023-01-01T12:00:00.000Z' };
    const request = new Request('http://localhost/api/baby-log', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: supabaseError.message }); // The route returns error.message
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockInsertChain).toHaveBeenCalledWith([{ // Check that insert was called with correct data
      type: requestBody.type,
      timestamp: requestBody.timestamp,
    }]);
    expect(mockSelectChain).toHaveBeenCalledTimes(1); // Ensure the select part of insert().select() was called
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error inserting baby log entry:', supabaseError);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

// New tests for GET endpoint
describe('GET /api/baby-log', () => {
  beforeEach(() => {
    mockFromChain.mockClear();
    mockSelectChain.mockClear(); // from().select()
    mockOrder.mockClear(); // from().select().order()
     // Clear createClient mock if you need to check calls to it
    // import { createClient } from '@supabase/supabase-js';
    // (createClient as jest.Mock).mockClear();
  });

  test('Test Case 1: Successful retrieval of multiple entries', async () => {
    const sampleLogs = [
      { id: 1, type: 'urination', timestamp: '2023-01-01T10:00:00.000Z' },
      { id: 2, type: 'defecation', timestamp: '2023-01-01T09:00:00.000Z' },
    ];
    // Mock the chain: from -> select -> order
    mockOrder.mockResolvedValueOnce({ data: sampleLogs, error: null });

    const request = new Request('http://localhost/api/baby-log', { method: 'GET' });
    const response = await GET(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(sampleLogs);
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockSelectChain).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('timestamp', { ascending: false });
  });

  test('Test Case 2: Successful retrieval of zero entries', async () => {
    // Mock the chain to return empty data
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    const request = new Request('http://localhost/api/baby-log', { method: 'GET' });
    const response = await GET(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual([]);
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockSelectChain).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('timestamp', { ascending: false });
  });

  test('Test Case 3: Supabase error during fetch', async () => {
    const supabaseError = { message: 'Supabase fetch error', details: 'Some details', hint: '', code: '50001' };
    // Mock the chain to return an error
    mockOrder.mockResolvedValueOnce({ data: null, error: supabaseError });

    const request = new Request('http://localhost/api/baby-log', { method: 'GET' });
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(request);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: supabaseError.message });
    expect(mockFromChain).toHaveBeenCalledWith('baby_log');
    expect(mockSelectChain).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('timestamp', { ascending: false });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching baby log:', supabaseError);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
