import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Navbar from './Navbar';
import React from 'react';

describe('Navbar', () => {
  it('renders correctly', () => {
    const { container } = render(<Navbar />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
