import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider 
    domain="dev-najj6v3aj6ujjoj3.us.auth0.com"
      clientId="ARwMsJ5ScpdcWFx9DlmgX6hYdSTb1awd"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}>
    <App />
    </Auth0Provider>
  </React.StrictMode>
);
reportWebVitals();
