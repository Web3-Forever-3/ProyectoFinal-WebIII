import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Navbar from './navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './componentes/sesion/Login';
import Register from './componentes/sesion/Register';
import RegisterInvestigador from './componentes/sesion/RegisterInvestigador';
import RegisterLector from './componentes/sesion/RegisterLector';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>

    <Navbar></Navbar>
      
    <Routes>
      <Route path='/' element={<App/>} /> 
      <Route path='/Login' element={<Login/>} /> 
      <Route path='/Register' element={<Register/>} /> 
      <Route path='/RegisterInvestigador' element={<RegisterInvestigador/>} /> 
      <Route path='/RegisterLector' element={<RegisterLector/>} /> 

    
    </Routes>
  </BrowserRouter>
  
  //<Navbar />
  
);//Cierra el root render

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
