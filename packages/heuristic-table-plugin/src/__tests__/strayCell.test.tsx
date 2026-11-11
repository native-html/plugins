import React from 'react';
import { render } from '@testing-library/react-native';
import { RenderHTML } from '@native-html/render';
import renderers from '../index';

describe('cell renderers reached outside a plugin table', () => {
  it('renders a stray td rather than throwing', () => {
    const { getByText } = render(
      <RenderHTML
        contentWidth={300}
        source={{ html: '<td>Hello</td>' }}
        renderers={renderers as any}
      />
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders when a document registers td without the table renderer', () => {
    const { getByText } = render(
      <RenderHTML
        contentWidth={300}
        source={{ html: '<table><tr><td>A</td></tr></table>' }}
        renderers={{ td: renderers.td } as any}
      />
    );
    expect(getByText('A')).toBeTruthy();
  });
});
