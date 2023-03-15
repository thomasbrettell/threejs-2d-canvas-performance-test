import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

let root;

function renderApp() {
  root.render(<App />);
}

whenOdysseyLoaded.then(() => {
  const [appMountEl] = selectMounts('indiathreejscharts');

  if (appMountEl) {
    root = createRoot(appMountEl);
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
