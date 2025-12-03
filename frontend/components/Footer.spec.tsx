import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from './Footer';
import React from 'react';

describe('Footer', () => {
  it('renders correctly', () => {
    const { container } = render(<Footer />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
