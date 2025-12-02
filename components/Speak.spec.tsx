import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Speak from './Speak';
import React from 'react';

describe('Speak', () => {
  it('renders correctly', () => {
    const { container } = render(<Speak />);
    expect(container).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
