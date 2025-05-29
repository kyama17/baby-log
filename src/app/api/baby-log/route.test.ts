// Environment variables are now set in jest.env.setup.js

// Declare the mock functions that will form the chain
const mockMatch = jest.fn();
const mockDeleteChain = jest.fn(() => ({ match: mockMatch }));
const mockFromChain = jest.fn(() => ({ delete: mockDeleteChain }));

// This is the function that will be assigned to the mocked createClient
const supabaseClientMockImplementation = () => ({
  from: mockFromChain,
});

// Now, mock the module. The factory function can reference supabaseClientMockImplementation
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => supabaseClientMockImplementation()),
}));

// Import the DELETE function to test AFTER mocks are set up.
import { DELETE } from './route';
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
    expect(mockDeleteChain).toHaveBeenCalledTimes(1);
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
    expect(mockMatch).not.toHaveBeenCalled(); // Match should not be called if ID is missing
    expect(mockDeleteChain).not.toHaveBeenCalled(); // Delete should not be called
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
    expect(mockDeleteChain).toHaveBeenCalledTimes(1);
    expect(mockMatch).toHaveBeenCalledWith({ id: 456 });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting baby log entry:', supabaseError);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
