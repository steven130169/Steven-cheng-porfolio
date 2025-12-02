import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Blog from './Blog';
import React from 'react';

describe('Blog', () => {
  it('renders correctly', () => {
    const { container } = render(<Blog />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
