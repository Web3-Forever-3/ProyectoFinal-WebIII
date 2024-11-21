import React, { useState } from "react";
import '../estilos/RegisterInvestigador.css';
import { useNavigate } from "react-router-dom";
import { registerWithEmailPassword, googleSignIn, saveUserData } from "../../firebase/firebaseInit";
import googleLogo from '../estilos/imgs/googleLogo.png';

const RegisterInvestigador = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [grado, setGrado] = useState("");
  const [descripcion, setWhoIAm] = useState("");
  const [foto, setProfilePicture] = useState("");
  const navigate = useNavigate();

  // Enviar el formulario y registrar el usuario en Firebase
  const enviarForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      // Registrar usuario con Firebase Auth
      const userCredential = await registerWithEmailPassword(email, password);
      const user = userCredential.user;
      alert(user);

      // Guardar datos adicionales en Firestore
      await saveUserData(user.uid, {
        idUsuario: user.uid,
        nombre,
        email,
        grado,
        descripcion,
        role: "investigador", // Si es investigador
      });

      alert("Registro exitoso!");
      navigate("/Login");
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Hubo un problema al registrar el usuario.");
    }
  };

  // Enviar el registro con Google
  const handleGoogleSignUp = async () => {
    try {
      const userCredential = await googleSignIn();
      const user = userCredential.user;

      // Guardar datos en Firestore si es la primera vez que el usuario se registra
      if (userCredential.additionalUserInfo?.isNewUser) {
        await saveUserData(user.uid, {
          idUsuario: user.uid,
          nombre: user.displayName || "",
          email: user.email || "",
          grado: "",
          descripcion: "",
          role: "investigador", // Asignar rol de investigador
        });
      }
      
      alert("Registro con Google exitoso!");

      //prueba de datos del usuario, con exito GGG
      //faltaria guardarlo en el firestore database
      console.log(user);
      localStorage.setItem("firebaseUser", JSON.stringify(user));


      navigate("/Login");
    } catch (error) {
      console.error("Error en el registro con Google:", error);
      alert("Hubo un problema al registrar el usuario con Google.");
    }
  };

  return (
    <div className="investigador_background">
      <h1>Registrándote como Investigador</h1>
      <form onSubmit={enviarForm}>
        <label htmlFor="nombre">Nombre Completo:</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          placeholder="Nombre"
          className="form-control"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ marginBottom: "15px" }}
        />

        <label htmlFor="email">Correo Electrónico:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Correo Electrónico"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "15px" }}
        />

        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          placeholder="Contraseña"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "15px" }}
        />

        <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          placeholder="Confirmar Contraseña"
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ marginBottom: "15px" }}
        />

        <label htmlFor="grado">Grado:</label>
        <input
          type="text"
          id="grado"
          name="grado"
          required
          placeholder="Grado"
          className="form-control"
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
          style={{ marginBottom: "15px" }}
        />

        <label htmlFor="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          name="descripcion"
          required
          placeholder="Una breve descripción de quién eres."
          className="form-control"
          value={descripcion}
          onChange={(e) => setWhoIAm(e.target.value)}
          style={{ marginBottom: "15px" }}
        />

        <button type="submit" className="submit_button">
          Registrar
        </button>

        <div className="text-center mt-4">
          <p>O regístrate con</p>
          <button type="button" className="google_button" onClick={handleGoogleSignUp}>
            <img src={googleLogo} alt="Google Logo" className="google-logo" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterInvestigador;
