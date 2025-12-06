import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Hero from './Hero';
import React from 'react';

describe('Hero', () => {
  it('renders correctly', () => {
    const { container } = render(<Hero />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
