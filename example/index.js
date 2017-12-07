import React from 'react';
import ReactDom from 'react-dom';

import { Provider } from 'react-redux';
import configureStore from './configureStore';

import Block from './containers/Block';

const store = configureStore();

ReactDom.render(
  <Provider store={store}>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Block facetName="blockA" />
      <Block facetName="blockB" />
      <Block facetName="blockC" />
      <Block facetName="blockD" />
    </div>
  </Provider>,
  document.getElementById('main'),
);
