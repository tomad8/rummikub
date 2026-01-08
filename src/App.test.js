import React from 'react';
import { render, screen, shallow } from '@testing-library/react';
import App from './App';

//import { withAuthentication } from './components/Session';

/*
test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
*/

jest.mock("./components/Session", () => ({
  withAuthentication: Component => props => (
    <Component {...props} />
  ),
}));

describe('App', () => {
  test('renders App component', () => {
    //const wrapper = shallow(<InnerMyComponent prop={null} setProps={jest.fn()} />);
    //render(<App />);

    /*const mockProps = {
      navigation: { navigate: jest.fn() }
    }*/
  
    /*shallow(<App />);*/
    expect('Need to actually create some tests').toBe('soon!');

    screen.debug();
  });
});

describe('true is truthy and false is falsy', () => {
  test('true is truthy', () => {
    expect(true).toBe(true);
  });
 
  test('false is falsy', () => {
    expect(false).toBe(false);
  });
});