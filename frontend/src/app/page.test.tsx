import { render, screen } from '@testing-library/react';
import Home from './page';
import { describe, it, expect, vi } from 'vitest';

// Mock components to avoid rendering the full tree and dealing with their internal logic/fetches in a unit test for the Page.
// This is a common practice for testing Page composition.
vi.mock('../components/Hero', () => ({ default: () => <div>Hero Section</div> }));
vi.mock('../components/About', () => ({ default: () => <div>About Section</div> }));
vi.mock('../components/Blog', () => ({ default: () => <div>Blog Section</div> }));
vi.mock('../components/Event', () => ({ default: () => <div>Event Section</div> }));
vi.mock('../components/Speak', () => ({ default: () => <div>Speak Section</div> }));

describe('Home Page', () => {
  it('renders all sections successfully', () => {
    render(<Home />);
    expect(screen.getByText('Hero Section')).toBeInTheDocument();
    expect(screen.getByText('About Section')).toBeInTheDocument();
    expect(screen.getByText('Blog Section')).toBeInTheDocument();
    expect(screen.getByText('Event Section')).toBeInTheDocument();
    expect(screen.getByText('Speak Section')).toBeInTheDocument();
  });
});