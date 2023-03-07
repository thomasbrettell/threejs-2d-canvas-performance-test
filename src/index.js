import acto from '@abcnews/alternating-case-to-object';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

let root;
let appProps;

function renderApp() {
  root.render(<App />);
}

whenOdysseyLoaded.then(() => {
  const [appMountEl] = selectMounts('indiathreejscharts');

  if (appMountEl) {
    root = createRoot(appMountEl);
    appProps = acto(getMountValue(appMountEl));
    renderApp();
  }
});

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      renderApp();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        root.render(<ErrorBox error={err} />);
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[india-threejs-charts] public path: ${__webpack_public_path__}`);
}
