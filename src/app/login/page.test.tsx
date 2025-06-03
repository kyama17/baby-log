import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import '@testing-library/jest-dom';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders all form elements correctly', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Check for the title
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();

    // Check for email input
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();

    // Check for password input
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();

    // Check for Log in button
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();

    // Check for Sign up button
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
  });
});
