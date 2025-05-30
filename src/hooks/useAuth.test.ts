import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabaseClient';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

// Mock the supabase client
// We need to be able to capture and invoke the onAuthStateChange callback
let onAuthStateChangeCallback: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockImplementation((callback) => {
        onAuthStateChangeCallback = callback; // Capture the callback
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }), // Initial session is null
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }), // For getCurrentUser
    },
  },
}));

// Helper to clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset onAuthStateChangeCallback
  onAuthStateChangeCallback = null;
  // Default mock for getSession for initial load. Tests can override this.
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
  // Default mock for getUser
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
   // Default mock for onAuthStateChange, important to re-assign the callback catcher
   (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
    onAuthStateChangeCallback = callback;
    return {
      data: { subscription: { unsubscribe: jest.fn() } },
    };
  });
});

describe('useAuth Hook', () => {
  it('should initially be loading and have no user, then finish loading', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    // Wait for useEffect to run (getSession and onAuthStateChange setup)
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull(); // Based on default getSession mock
  });

  it('should set user from initial session if available', async () => {
    const mockUser: User = { id: 'user1', app_metadata: {}, user_metadata: {}, aud: 'authenticated', email: 'test@example.com' };
    const mockSession: Session = { access_token: 'token', token_type: 'bearer', user: mockUser, expires_in: 3600, refresh_token: 'refresh' };
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: mockSession }, error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle signUp correctly', async () => {
    const mockCredentials = { email: 'test@example.com', password: 'password123' };
    const mockUser: User = { id: 'signup-user', app_metadata: {}, user_metadata: {}, aud: 'authenticated', email: mockCredentials.email };
    const mockResponse = { data: { user: mockUser, session: null }, error: null }; // signUp might not return a session immediately
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth());

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp(mockCredentials);
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith(mockCredentials);
    expect(signUpResult).toEqual(mockResponse);
    // User state might not change until onAuthStateChange is triggered or if signUp implies login
  });
  
  it('should handle signIn correctly and update user state via onAuthStateChange', async () => {
    const mockCredentials = { email: 'test@example.com', password: 'password123' };
    const mockUser: User = { id: 'signin-user', app_metadata: {}, user_metadata: {}, aud: 'authenticated', email: mockCredentials.email };
    const mockSession: Session = { access_token: 'token', token_type: 'bearer', user: mockUser, expires_in: 3600, refresh_token: 'refresh' };
    const mockSignInResponse = { data: { user: mockUser, session: mockSession }, error: null };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce(mockSignInResponse);
    
    const { result } = renderHook(() => useAuth());

    // Ensure initial loading is done
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const signInResult = await result.current.signIn(mockCredentials);
      expect(signInResult).toEqual(mockSignInResponse);
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(mockCredentials);

    // Simulate onAuthStateChange event after successful sign-in
    if (onAuthStateChangeCallback) {
      await act(async () => {
        onAuthStateChangeCallback('SIGNED_IN', mockSession);
      });
    }
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should handle signOut correctly and update user state via onAuthStateChange', async () => {
    // First, simulate a logged-in user
    const mockUser: User = { id: 'user-to-signout', app_metadata: {}, user_metadata: {}, aud: 'authenticated', email: 'test@example.com' };
    const mockSession: Session = { access_token: 'token', token_type: 'bearer', user: mockUser, expires_in: 3600, refresh_token: 'refresh' };
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: mockSession }, error: null });


    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Simulate onAuthStateChange after initial load for consistency
    if (onAuthStateChangeCallback) {
        await act(async () => {
            onAuthStateChangeCallback('INITIAL_SESSION', mockSession);
        });
    }
    expect(result.current.user).toEqual(mockUser); // User is initially set

    // Mock signOut
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    await act(async () => {
      await result.current.signOut();
    });
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);

    // Simulate onAuthStateChange event after successful sign-out
    if (onAuthStateChangeCallback) {
      await act(async () => {
        onAuthStateChangeCallback('SIGNED_OUT', null);
      });
    }
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should update user state when onAuthStateChange is triggered', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false)); // Initial load

    expect(result.current.user).toBeNull();

    // Simulate SIGNED_IN event
    const mockUserSignedIn: User = { id: 'new-user', app_metadata: {}, user_metadata: {}, aud: 'authenticated', email: 'new@example.com' };
    const mockSessionSignedIn: Session = { access_token: 'new-token', token_type: 'bearer', user: mockUserSignedIn, expires_in: 3600, refresh_token: 'new-refresh' };
    
    if (onAuthStateChangeCallback) {
      await act(async () => {
        onAuthStateChangeCallback('SIGNED_IN', mockSessionSignedIn);
      });
    }
    expect(result.current.user).toEqual(mockUserSignedIn);
    expect(result.current.loading).toBe(false);

    // Simulate SIGNED_OUT event
    if (onAuthStateChangeCallback) {
      await act(async () => {
        onAuthStateChangeCallback('SIGNED_OUT', null);
      });
    }
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should call unsubscribe on cleanup', async () => {
    const unsubscribeMock = jest.fn();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValueOnce({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });

    const { unmount } = renderHook(() => useAuth());
    await waitFor(() => expect(supabase.auth.onAuthStateChange).toHaveBeenCalled());
    
    act(() => {
      unmount();
    });

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
  
  it('getCurrentUser should call supabase.auth.getUser and return user', async () => {
    const mockUser: User = { id: 'get-user', app_metadata: {}, user_metadata: {}, aud: 'authenticated', email: 'get@example.com' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: mockUser }, error: null });
    
    const { result } = renderHook(() => useAuth());
    
    let currentUserResult;
    await act(async () => {
      currentUserResult = await result.current.getCurrentUser();
    });
    
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1); // Note: getUser might be called during initial load by onAuthStateChange depending on its internal behavior
    expect(currentUserResult).toEqual({ user: mockUser, error: null });
  });

  it('signUp should return error if supabase.auth.signUp fails', async () => {
    const mockCredentials = { email: 'fail@example.com', password: 'password123' };
    const mockError = { name: 'AuthApiError', message: 'Sign up failed' };
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: {user: null, session: null}, error: mockError });

    const { result } = renderHook(() => useAuth());
    
    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp(mockCredentials);
    });

    expect(signUpResult?.error).toEqual(mockError);
  });

  it('signIn should return error if supabase.auth.signInWithPassword fails', async () => {
    const mockCredentials = { email: 'fail@example.com', password: 'password123' };
    const mockError = { name: 'AuthApiError', message: 'Sign in failed' };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: {user: null, session: null}, error: mockError });

    const { result } = renderHook(() => useAuth());
    
    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn(mockCredentials);
    });

    expect(signInResult?.error).toEqual(mockError);
  });

  it('signOut should return error if supabase.auth.signOut fails', async () => {
    const mockError = { name: 'AuthApiError', message: 'Sign out failed' };
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: mockError });
    
    const { result } = renderHook(() => useAuth());
        
    let signOutResult;
    await act(async () => {
      signOutResult = await result.current.signOut();
    });

    expect(signOutResult?.error).toEqual(mockError);
  });

});
