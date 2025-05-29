/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BabyLogPage from './page'; // Adjust path if your page.tsx is elsewhere

// Mock global fetch
global.fetch = jest.fn();

const mockInitialEntries = [
  { id: 1, type: 'urination', timestamp: new Date().toISOString() },
  { id: 2, type: 'defecation', timestamp: new Date().toISOString() },
];

describe('BabyLogPage Frontend Tests', () => {
  beforeEach(() => {
    // Clear all previous mock calls and implementations
    (fetch as jest.Mock).mockClear();
    // Reset console.error spy if it was used
    jest.restoreAllMocks(); 
  });

  test('Test Case 1: Displaying Delete Buttons', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInitialEntries,
    });

    render(<BabyLogPage />);

    // Wait for entries to load and be displayed
    await waitFor(() => {
      expect(screen.getByText(/おしっこ at/)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    expect(deleteButtons.length).toBe(mockInitialEntries.length);
    mockInitialEntries.forEach(entry => {
      const entryText = entry.type === 'urination' ? /おしっこ at/ : /うんち at/;
      const listItem = screen.getByText(entryText).closest('li');
      expect(listItem).not.toBeNull();
      if (listItem) {
        const deleteButton = listItem.querySelector('button');
        expect(deleteButton).toHaveTextContent('削除');
      }
    });
  });

  test('Test Case 2: Successful Deletion', async () => {
    // Mock initial fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockInitialEntries[0]], // Load one entry
    });

    // Mock successful DELETE fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Log entry deleted successfully' }),
    });

    render(<BabyLogPage />);

    // Wait for the initial entry to load
    const entryTextRegex = /おしっこ at/;
    await waitFor(() => {
      expect(screen.getByText(entryTextRegex)).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    fireEvent.click(deleteButton);

    // Wait for the entry to be removed
    await waitFor(() => {
      expect(screen.queryByText(entryTextRegex)).not.toBeInTheDocument();
    });

    // Check fetch call for DELETE
    expect(fetch).toHaveBeenCalledTimes(2); // 1 for initial load, 1 for delete
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/baby-log', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: mockInitialEntries[0].id }),
    });
  });

  test('Test Case 3: Deletion Fails (API Error)', async () => {
    // Mock initial fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockInitialEntries[1]], // Load one entry (defecation)
    });

    // Mock failed DELETE fetch
    const errorResponse = { error: 'Failed to delete' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => errorResponse,
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<BabyLogPage />);

    // Wait for the initial entry to load
    const entryTextRegex = /うんち at/;
    await waitFor(() => {
      expect(screen.getByText(entryTextRegex)).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    fireEvent.click(deleteButton);

    // Wait a bit to ensure no UI change happens and error is logged
    await screen.findByText(entryTextRegex); // Entry should still be there

    expect(screen.getByText(entryTextRegex)).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete entry:', errorResponse);
    
    // Check fetch call for DELETE
    expect(fetch).toHaveBeenCalledTimes(2); // 1 for initial load, 1 for delete
     expect(fetch).toHaveBeenNthCalledWith(2, '/api/baby-log', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: mockInitialEntries[1].id }),
    });

    consoleErrorSpy.mockRestore();
  });
});
