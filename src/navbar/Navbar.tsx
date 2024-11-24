import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth } from "../firebase/firebaseInit";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseInit"; // Asegúrate de importar correctamente tu Firestore
import { User } from "firebase/auth";

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Verificar si hay un usuario autenticado al cargar el componente
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Obtener el rol del usuario desde Firestore
          const userDocRef = doc(db, "usuarios", user.uid); // Asegúrate de que "usuarios" sea el nombre correcto de tu colección
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Datos del usuario desde Firestore:", userData); // Depuración
            setRole(userData.role || "Sin rol definido");
          } else {
            console.warn(
              `El documento del usuario con UID ${user.uid} no existe en Firestore.`
            );
            setRole("Refrescar con F5 :P");
          }
        } catch (error) {
          console.error(
            "Error al obtener el rol del usuario desde Firestore:",
            error
          );
          setRole("Error al cargar rol");
        }
      } else {
        setRole(null);
      }
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
                  {role && (
                    <span
                      className="nav-link"
                      style={{
                        color: "#58fb27",
                        fontSize: "16px",
                        marginTop: "-10px",
                      }}
                    >
                      {role}
                    </span>
                  )}
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
