import React from 'react';
import ReactDom from 'react-dom';

import { Provider } from 'react-redux';
import configureStore from './configureStore';

import BlockA from './containers/BlockA';
import BlockB from './containers/BlockB';
import BlockC from './containers/BlockC';
import BlockD from './containers/BlockD';

const store = configureStore();

ReactDom.render(
  (
    <Provider store={store}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <BlockA />
        <BlockB />
        <BlockC />
        <BlockD />
      </div>
    </Provider>
  ),
  document.getElementById('main'),
);
