import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import '@testing-library/jest-dom';

describe('LoginPage', () => {
  it('renders all form elements correctly', () => {
    render(<LoginPage />);

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
