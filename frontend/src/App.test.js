import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import App from './App';

jest.mock('./components/API/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { request: { use: jest.fn() } }
  }
}));

test('shows the new sign-in page and opens registration', () => {
  const { getByRole, getByLabelText } = render(<App />);

  expect(getByRole('heading', { name: "Let's get you going." })).toBeInTheDocument();
  fireEvent.click(getByRole('button', { name: 'Create account' }));
  expect(getByLabelText('Full name')).toBeInTheDocument();
});
