import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Event from './Event';
import React from 'react';

describe('Event', () => {
  it('renders correctly', () => {
    const { container } = render(<Event />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
