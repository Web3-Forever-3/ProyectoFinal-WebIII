import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Navbar from "./navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./componentes/sesion/Login";
import Register from "./componentes/sesion/Register";
import RegisterInvestigador from "./componentes/sesion/RegisterInvestigador";
import RegisterLector from "./componentes/sesion/RegisterLector";
import Logout from "./componentes/sesion/Logout";
import DatosFaltantes from "./componentes/sesion/DatosFaltantes";
import DatosFaltantesLector from "./componentes/sesion/DatosFaltantesLector";
import Categorias from "./componentes/generales/Categorias";
import AddInvestigacion from "./componentes/generales/AddInvestigacion";
import MostrarInvestigaciones from "./componentes/generales/MostrarInvestigaciones";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <BrowserRouter>
    <Navbar></Navbar>

    <Routes>
      <Route path="/" element={<MostrarInvestigaciones />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/RegisterInvestigador" element={<RegisterInvestigador />} />
      <Route path="/RegisterLector" element={<RegisterLector />} />
      <Route path="/Logout" element={<Logout />} />
      <Route path="/DatosFaltantes" element={<DatosFaltantes />} />
      <Route path="/DatosFaltantesLector" element={<DatosFaltantesLector />} />
      <Route path="/Categorias" element={<Categorias />} />
      <Route path="/AddInvestigacion" element={<AddInvestigacion />} />
      {/* <Route
        path="/MostrarInvestigaciones"
        element={<MostrarInvestigaciones />}
      /> */}
    </Routes>
  </BrowserRouter>

  //<Navbar />
); //Cierra el root render

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
