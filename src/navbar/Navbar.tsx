import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth } from "../firebase/firebaseInit";
import { User } from "firebase/auth";

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Verificar si hay un usuario autenticado al cargar el componente
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-primary">
      <div className="container">
        {/* Logo de la aplicación */}
        <Link className="navbar-brand" to="/">
          Forever3
        </Link>

        {/* Botón de menú para dispositivos móviles */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido del menú */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {currentUser ? (
              <>
                {/* Mostrar el nombre del usuario autenticado */}
                <li className="nav-item">
                  <span
                    className="nav-link text-white"
                    style={{ fontSize: "20px" }}
                  >
                    {currentUser.displayName || "Usuario"}
                  </span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/logout">
                    Cerrar Sesión
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Opciones si no hay un usuario autenticado */}
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Registrar Usuario
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Iniciar Sesión
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
