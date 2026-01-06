import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Event from './Event';
import React from 'react';

// Mock data
const mockEvents = [
  { id: '1', title: 'Event 1', role: 'Role 1', date: '2023', description: 'Desc 1', tags: [], status: 'Upcoming' },
  { id: '2', title: 'Event 2', role: 'Role 2', date: '2023', description: 'Desc 2', tags: [], status: 'Upcoming' },
  { id: '3', title: 'Event 3', role: 'Role 3', date: '2023', description: 'Desc 3', tags: [], status: 'Upcoming' },
  { id: '4', title: 'Event 4', role: 'Role 4', date: '2023', description: 'Desc 4', tags: [], status: 'Upcoming' },
];

// Constants
const API_EVENTS_URL = '/api/events';
const LOADING_TEXT = 'Loading events...';

describe('Event', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url, options: RequestInit | undefined) => {
        if (url === API_EVENTS_URL && (!options || !options.method || options.method === 'GET')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockEvents),
            } as Response);
        }
        if (url === API_EVENTS_URL && options.method === 'POST') {
             const body = JSON.parse(options.body as string) as unknown;
             return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ ...body, id: '999', tags: ['New'], status: 'Upcoming' }),
             } as Response);
        }
        return Promise.reject(new Error(`Unknown URL: ${url}`));
    });
  });

  afterEach(() => {
      vi.restoreAllMocks();
  });

  it('renders correctly', async () => {
    const { container } = render(<Event />);
    // Wait for loading to disappear
    await waitFor(() => expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument());
    expect(container).toBeInTheDocument();
  });

  it('allows adding a new event', async () => {
    render(<Event />);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument());

    const addButton = screen.getByRole('button', { name: /add event/i });
    await user.click(addButton);

    await user.type(screen.getByLabelText(/title/i), 'React 19 Launch Party');
    await user.type(screen.getByLabelText(/role/i), 'Test Speaker');
    await user.type(screen.getByLabelText(/description/i), 'Deep dive.');
    await user.type(screen.getByLabelText(/date/i), 'Dec 2025');
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('React 19 Launch Party')).toBeInTheDocument();
        expect(screen.getByText('Test Speaker')).toBeInTheDocument();
    });
  });

  it('displays a maximum of 3 events', async () => {
    render(<Event />);
    await waitFor(() => expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument());

    expect(screen.getAllByTestId('event-item')).toHaveLength(3); 
    expect(screen.getByRole('button', { name: /View All Events/i })).toBeInTheDocument(); 
  });

  it('does not display the "View All Events" button when there are 3 or fewer events', async () => {
    // Mock fetch to return only 3 events
    global.fetch = vi.fn((url, options: RequestInit | undefined) => {
      if (url === API_EVENTS_URL && (!options || !options.method || options.method === 'GET')) {
          return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockEvents.slice(0, 3)), // Only 3 events
          } as Response);
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });

    render(<Event />);
    await waitFor(() => expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument());
    
    expect(screen.getAllByTestId('event-item')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /View All Events/i })).not.toBeInTheDocument();
  });
});
