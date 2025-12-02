import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './About';
import React from 'react';

describe('About', () => {
  it('renders correctly', () => {
    const { container } = render(<About />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
