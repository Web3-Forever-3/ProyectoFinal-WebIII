import React, { useState } from "react";
import "../estilos/Login.css";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleSignIn } from "../../firebase/firebaseInit"; // Asegúrate de tener la función de googleSignIn definida en firebaseInit
import googleLogo from "../estilos/imgs/googleLogo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Manejar el inicio de sesión con correo y contraseña
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Usuario autenticado correctamente
      alert("Inicio de sesión exitoso");
      navigate("/"); // Redirige a home después de iniciar sesión
    } catch (error) {
      console.error("Error al iniciar sesión con email y contraseña:", error);
      alert("Correo o contraseña incorrectos.");
    }
  };

  // Función para manejar el inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await googleSignIn();
      // Guardar datos del usuario en Firestore si es la primera vez
      alert("Inicio de sesión exitoso con Google");
      navigate("/"); // Redirige a home después de iniciar sesión
    } catch (error) {
      console.error("Error en el inicio con Google:", error);
      alert("Hubo un problema al iniciar sesión con Google.");
    }
  };

  return (
    <div className="login-background">
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="contenedor_form">
          <h2 className="text-center mb-4">Iniciar Sesión</h2>

          <form onSubmit={handleEmailPasswordLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn w-100">
              Iniciar Sesión
            </button>
          </form>

          <div className="text-center mt-3">
            <p style={{ fontWeight: "bold" }}>O inicia sesión con Google</p>
            <button className="google_button" onClick={handleGoogleSignIn}>
              <img src={googleLogo} alt="Google Logo" className="google-logo" />
            </button>
          </div>
        </div>
        <br />
        <br />
      </div>
    </div>
  );
};

export default Login;
