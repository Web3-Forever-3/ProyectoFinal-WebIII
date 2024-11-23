import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import "../estilos/Logout.css"; // Importa el CSS

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Has cerrado sesión exitosamente.");
      navigate("/Login");
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      alert(
        "Hubo un problema al cerrar la sesión. Por favor, inténtalo nuevamente."
      );
    }
  };

  return (
    <div className="logout_background">
      <div className="logout-container">
        <h1>¿Estás seguro de que deseas cerrar sesión?</h1>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Logout;
