import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RadioAppProvider } from './context/RadioAppContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RadioAppProvider>
      <App />
    </RadioAppProvider>
  </StrictMode>,
);
