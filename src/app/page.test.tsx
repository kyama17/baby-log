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

  test('Test Case 4: Form input changes', async () => {
    // Mock initial fetch to avoid errors during rendering
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [], 
    });

    render(<BabyLogPage />);

    // Wait for the page to potentially finish initial loading effects
    await waitFor(() => expect(screen.getByText('📝 新しい記録')).toBeInTheDocument());

    // Test "type" select dropdown
    const typeSelect = screen.getByRole('combobox'); // Assuming only one select/combobox
    fireEvent.change(typeSelect, { target: { value: 'defecation' } });
    expect(typeSelect).toHaveValue('defecation');

    // Test "datetime-local" input
    const datetimeInput = screen.getByLabelText('日時');
    const testDateTime = '2023-03-15T10:30'; // YYYY-MM-DDTHH:mm
    fireEvent.change(datetimeInput, { target: { value: testDateTime } });
    expect(datetimeInput).toHaveValue(testDateTime);
  });

  test('Test Case 5: Successful log entry submission', async () => {
    // Mock initial fetch to return no entries
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BabyLogPage />);
    
    // Wait for the page to potentially finish initial loading effects
    await waitFor(() => expect(screen.getByText('📝 新しい記録')).toBeInTheDocument());

    const newEntryType = 'urination';
    // For datetime-local, the value should be in "YYYY-MM-DDTHH:MM" format
    // Let's use a fixed date for predictability
    const submissionDateTimeValue = '2023-04-01T14:00'; 
    // The component converts this to a full ISO string for the POST body
    const expectedTimestampInPostBody = new Date(submissionDateTimeValue).toISOString();

    const mockSubmittedEntry = {
      id: 100, // Example ID from backend
      type: newEntryType,
      timestamp: expectedTimestampInPostBody,
    };

    // Mock fetch for the POST request
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201, // Typical for successful POST creating a resource
      json: async () => mockSubmittedEntry,
    });

    // Get form elements
    const typeSelect = screen.getByRole('combobox');
    const datetimeInput = screen.getByLabelText('日時');
    const recordButton = screen.getByRole('button', { name: /記録/i });
    
    const initialDatetimeValue = (datetimeInput as HTMLInputElement).value;

    // Simulate user input
    fireEvent.change(typeSelect, { target: { value: newEntryType } });
    fireEvent.change(datetimeInput, { target: { value: submissionDateTimeValue } });

    // Simulate form submission
    fireEvent.click(recordButton);

    // Wait for the new entry to appear in the document
    // The displayed text will be like "おしっこ at 2023/4/1 14:00:00"
    // We need to be careful with how the date is formatted by toLocaleString('ja-JP')
    const expectedDisplayedDate = new Date(expectedTimestampInPostBody).toLocaleString('ja-JP');
    
    await waitFor(() => {
      expect(screen.getByText(newEntryType === 'urination' ? 'おしっこ' : 'うんち')).toBeInTheDocument();
      expect(screen.getByText(expectedDisplayedDate)).toBeInTheDocument();
    });

    // Verify fetch call for POST
    expect(fetch).toHaveBeenCalledTimes(2); // 1 for initial load, 1 for POST
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/baby-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: newEntryType,
        timestamp: expectedTimestampInPostBody,
      }),
    });

    // Verify datetime input has been reset
    // It should not be the value we submitted, and should be close to the current time.
    // A precise check for "current time" is hard without more date mocking.
    // We'll check it's not the submitted value and not empty.
    await waitFor(() => {
        const currentDatetimeValue = (datetimeInput as HTMLInputElement).value;
        expect(currentDatetimeValue).not.toBe(submissionDateTimeValue);
        expect(currentDatetimeValue).not.toBe('');
        // Check if it's a valid datetime-local string (YYYY-MM-DDTHH:MM)
        expect(currentDatetimeValue).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });

  test('Test Case 6: API error during log entry submission', async () => {
    // Mock initial fetch to return no entries
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BabyLogPage />);
    
    // Wait for the page to potentially finish initial loading effects
    await waitFor(() => expect(screen.getByText('📝 新しい記録')).toBeInTheDocument());
    // Ensure the list is initially empty
    expect(screen.getByText('まだ記録がありません。上のフォームから記録を追加してください。')).toBeInTheDocument();

    // Spy on window.alert and console.error
    // jest.restoreAllMocks() in beforeEach will handle restoring them
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const submissionType = 'defecation';
    const submissionDateTimeValue = '2023-05-01T10:00';
    const apiErrorResponse = { error: "Simulated server error from POST" };

    // Mock fetch for the POST request to simulate an error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => apiErrorResponse, // This is what the component tries to parse
    });

    // Get form elements
    const typeSelect = screen.getByRole('combobox');
    const datetimeInput = screen.getByLabelText('日時');
    const recordButton = screen.getByRole('button', { name: /記録/i });

    // Simulate user input
    fireEvent.change(typeSelect, { target: { value: submissionType } });
    fireEvent.change(datetimeInput, { target: { value: submissionDateTimeValue } });

    // Simulate form submission
    fireEvent.click(recordButton);

    // Wait for async operations like fetch and state updates to complete
    await waitFor(() => {
      // Check that alert was called with the specific message
      expect(alertSpy).toHaveBeenCalledWith('データの保存に失敗しました。Supabaseの設定を確認してください。');
    });

    // Check that console.error was called
    // The component logs: console.error('Error submitting baby log:', error);
    // where error is new Error(`HTTP error! status: ${response.status}`)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error submitting baby log:',
      expect.objectContaining({ message: 'HTTP error! status: 500' })
    );
    
    // Verify fetch call for POST
    expect(fetch).toHaveBeenCalledTimes(2); // 1 for initial load, 1 for POST
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/baby-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: submissionType,
        timestamp: new Date(submissionDateTimeValue).toISOString(),
      }),
    });

    // Verify that the log entry was NOT added to the list
    // The list should still be empty and display the "no entries" message
    expect(screen.getByText('まだ記録がありません。上のフォームから記録を追加してください。')).toBeInTheDocument();
    // Check that no list items (log entries) are rendered
    const listItems = screen.queryAllByRole('listitem'); // Assuming entries are in <li>
    // If the parent list is present but empty, it might not have <li>. 
    // It's safer to check for the text of an actual entry.
    expect(screen.queryByText(submissionType === 'urination' ? 'おしっこ' : 'うんち')).not.toBeInTheDocument();
    expect(screen.queryByText(new Date(submissionDateTimeValue).toLocaleString('ja-JP'))).not.toBeInTheDocument();

    // Spies are restored by jest.restoreAllMocks() in beforeEach
  });

  test('Test Case 7: Successful initial load with entries', async () => {
    const initialMockEntries = [
      { id: 3, type: 'urination', timestamp: '2023-06-01T10:00:00.000Z' },
      { id: 4, type: 'defecation', timestamp: '2023-06-01T11:00:00.000Z' },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => initialMockEntries,
    });

    render(<BabyLogPage />);

    await waitFor(() => {
      // Check for the first entry
      expect(screen.getByText('おしっこ')).toBeInTheDocument();
      expect(screen.getByText(new Date(initialMockEntries[0].timestamp).toLocaleString('ja-JP'))).toBeInTheDocument();
      // Check for the second entry
      expect(screen.getByText('うんち')).toBeInTheDocument();
      expect(screen.getByText(new Date(initialMockEntries[1].timestamp).toLocaleString('ja-JP'))).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/baby-log');
    // Ensure the "no records" message is NOT displayed
    expect(screen.queryByText('まだ記録がありません。上のフォームから記録を追加してください。')).not.toBeInTheDocument();
  });

  test('Test Case 8: Initial load with no entries (empty state)', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty array
    });

    render(<BabyLogPage />);

    await waitFor(() => {
      expect(screen.getByText('まだ記録がありません。上のフォームから記録を追加してください。')).toBeInTheDocument();
    });

    // Verify no log entries are rendered
    expect(screen.queryByText('おしっこ')).not.toBeInTheDocument();
    expect(screen.queryByText('うんち')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/baby-log');
  });

  test('Test Case 9: API error during initial load', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const apiErrorMessage = 'Simulated API error during initial load';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      // The component's fetch logic throws an error like `new Error(HTTP error! status: ${response.status})`
      // It doesn't try to parse JSON from the error response for the initial load's error handling.
      // So, we don't need json: async () => ({ error: apiErrorMessage }) here for the error object itself.
      // The error object caught by the component is created by the component itself.
    });

    render(<BabyLogPage />);

    await waitFor(() => {
      // The component logs "Error fetching baby log:" and the error object
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching baby log:',
        expect.objectContaining({ message: 'HTTP error! status: 500' })
      );
    });

    // Verify that the page displays an empty state as a fallback
    expect(screen.getByText('まだ記録がありません。上のフォームから記録を追加してください。')).toBeInTheDocument();
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/baby-log');
    // Spies are restored by jest.restoreAllMocks() in beforeEach
  });

  test('Test Case 10: Displays only the latest 20 entries when more than 20 exist', async () => {
    const generateMockEntries = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        type: (i % 2 === 0) ? 'urination' : 'defecation',
        // Timestamps should be newest first as per API, so subtract index from a base date
        timestamp: new Date(2023, 0, 25 - i, 12, 0, 0).toISOString(), 
      }));
    };
    const mockEntriesOver20 = generateMockEntries(25);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntriesOver20,
    });

    render(<BabyLogPage />);

    // Wait for entries to load and be displayed
    await waitFor(() => {
      // Check for any entry text to ensure loading is complete
      expect(screen.getByText(new Date(mockEntriesOver20[0].timestamp).toLocaleString('ja-JP'))).toBeInTheDocument();
    });
    
    // The component contains entry text (type and timestamp) and a delete button for each.
    // We can count how many delete buttons are rendered within the log list.
    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    expect(deleteButtons.length).toBe(20);

    // Verify the message about displaying 20 out of 25 entries
    expect(screen.getByText('最新の20件を表示しています（全25件）')).toBeInTheDocument();

    // Spot-check: Verify the 20th entry (index 19) is visible
    expect(screen.getByText(new Date(mockEntriesOver20[19].timestamp).toLocaleString('ja-JP'))).toBeInTheDocument();
    
    // Spot-check: Verify the 21st entry (index 20) is NOT visible
    expect(screen.queryByText(new Date(mockEntriesOver20[20].timestamp).toLocaleString('ja-JP'))).not.toBeInTheDocument();
  });

  test('Test Case 11: Displays correct total count (no message) when less than 20 entries exist', async () => {
    const generateMockEntries = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        type: (i % 2 === 0) ? 'urination' : 'defecation',
        timestamp: new Date(2023, 0, 5 - i, 12, 0, 0).toISOString(),
      }));
    };
    const mockEntriesUnder20 = generateMockEntries(5);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntriesUnder20,
    });

    render(<BabyLogPage />);

    // Wait for entries to load
    await waitFor(() => {
      expect(screen.getByText(new Date(mockEntriesUnder20[0].timestamp).toLocaleString('ja-JP'))).toBeInTheDocument();
    });

    // Verify all 5 entries are rendered by counting delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    expect(deleteButtons.length).toBe(5);

    // Verify the specific "displaying 20 out of X" message is NOT present
    expect(screen.queryByText(/最新の20件を表示しています/)).not.toBeInTheDocument();
    
    // Check that the general list title is present
    expect(screen.getByText('最近の記録')).toBeInTheDocument();
  });
});
