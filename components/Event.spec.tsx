import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import Event from './Event';
import React from 'react';

describe('Event', () => {
  it('renders correctly', () => {
    const { container } = render(<Event />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('allows adding a new event', async () => {
    render(<Event />);
    const user = userEvent.setup();

    // 1. Click "Add Event" button (This button doesn't exist yet -> RED)
    const addButton = screen.getByRole('button', { name: /add event/i });
    await user.click(addButton);

    // 2. Fill in the form (Inputs don't exist yet -> RED)
    await user.type(screen.getByLabelText(/title/i), 'React 19 Launch Party');
    await user.type(screen.getByLabelText(/role/i), 'Speaker');
    await user.type(screen.getByLabelText(/description/i), 'Deep dive into server actions.');
    await user.type(screen.getByLabelText(/date/i), 'Dec 2025');
    
    // 3. Submit
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    // 4. Verify list update
    await waitFor(() => {
        expect(screen.getByText('React 19 Launch Party')).toBeInTheDocument();
        expect(screen.getByText('Speaker')).toBeInTheDocument();
        expect(screen.getByText('Dec 2025')).toBeInTheDocument();
    });
  });
});
