/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

// Test suite for the LoginPage
describe('LoginPage', () => {
  // The individual test case
  it('renders the sign-in form correctly', () => {
    // --- ARRANGE ---
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    // --- ACT ---
    const headingElement = screen.getByRole('heading', { name: /sign in/i });

    // --- ASSERT ---
    expect(headingElement).toBeInTheDocument();
  });
});