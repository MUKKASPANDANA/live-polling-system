import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PollProvider } from './context/PollContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PollProvider>
      <App />
    </PollProvider>
  </React.StrictMode>
);
