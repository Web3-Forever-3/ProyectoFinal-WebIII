import React, { useState } from "react";
import "../estilos/RegisterInvestigador.css";
import { useNavigate } from "react-router-dom";
import {
  registerWithEmailPassword,
  googleSignIn,
  db,
  storage,
} from "../../firebase/firebaseInit";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Métodos para Firebase Storage
import googleLogo from "../estilos/imgs/googleLogo.png";

const RegisterInvestigador = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [grado, setGrado] = useState("");
  const [descripcion, setWhoIAm] = useState("");
  const [foto, setFotoPerfil] = useState<File | null>(null);
  const navigate = useNavigate();

  // Subir foto a Firebase Storage
  const subirFoto = async (userId: string, fileName: string) => {
    if (!foto) return null;

    const storageRef = ref(storage, `usuarios/${userId}/${fileName}`); //url donde se guarda el enlace
    await uploadBytes(storageRef, foto); // Subir archivo
    return await getDownloadURL(storageRef); // Obtener URL pública
  };

  // Enviar formulario de registro (Correo y Contraseña)
  const enviarForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await registerWithEmailPassword(email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "usuarios", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        const fileName = nombre; // Usamos el campo "nombre" como nombre del archivo
        const fotoURL = await subirFoto(user.uid, fileName);

        await setDoc(userDocRef, {
          idUsuario: user.uid,
          nombre,
          email,
          grado,
          descripcion,
          fotoURL: fotoURL || "", // Guardar URL de la foto
          role: "investigador",
          fechaRegistro: new Date(),
        });

        alert("Usuario registrado exitosamente en Firestore.");
      }

      alert("Registro exitoso!");
      navigate("/Login");
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Hubo un problema al registrar el usuario.");
    }
  };

  // Función para registrarse con Google
  const handleGoogleSignUp = async () => {
    try {
      const userCredential = await googleSignIn();
      const user = userCredential.user;

      // Redirige a DatosFaltantes pasando los datos del usuario
      navigate("/DatosFaltantes", {
        state: {
          uid: user.uid,
          nombre: user.displayName || "",
          email: user.email || "",
          fotoURL: user.photoURL || "",
        },
      });
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

        <label htmlFor="foto">Foto de perfil</label>
        <input
          type="file"
          id="foto"
          name="foto"
          className="form-control"
          onChange={(e) => {
            if (e.target.files) {
              setFotoPerfil(e.target.files[0]);
            } else {
              console.error("No file selected.");
            }
          }}
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
          <button
            type="button"
            className="google_button"
            onClick={handleGoogleSignUp}
          >
            <img src={googleLogo} alt="Google Logo" className="google-logo" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterInvestigador;
