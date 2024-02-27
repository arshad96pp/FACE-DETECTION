import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Home from './pages/Home';
import './styles/app.css'

ReactDOM.render(
  <React.StrictMode>
    {/* <App /> */}
    <Home/>
  </React.StrictMode>,
  document.getElementById('root')
);