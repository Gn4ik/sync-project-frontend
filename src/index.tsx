import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './index.css';
import App from './components/app/App';
import './styles/styles.css'

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
