import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Home from './pages/Home';
import './styles/app.css'
import Dictaphone from './pages/Dictaphone';

ReactDOM.render(
  <React.StrictMode>
    {/* <App /> */}
    <Home/>
    {/* <Dictaphone/> */}
  </React.StrictMode>,
  document.getElementById('root')
);