import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../../firebase/firebaseInit";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Métodos para Firebase Storage
import "../estilos/DatosFaltantesLector.css";

const DatosFaltantesLector = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, nombre, email, fotoURL } = location.state || {};

  const [foto, setFotoPerfil] = useState<File | null>(null);
  const [fotoURLState, setFotoURLState] = useState(fotoURL || ""); // Foto URL opcional desde el componente anterior

  // Subir foto a Firebase Storage
  const subirFoto = async (userId: string, fileName: string) => {
    if (!foto) return null; // Si no hay foto, no hacer nada

    const storageRef = ref(storage, `usuarios/${userId}/${fileName}`); // URL donde se guarda el enlace
    await uploadBytes(storageRef, foto); // Subir archivo
    return await getDownloadURL(storageRef); // Obtener URL pública
  };

  // Guardar datos del usuario en Firestore
  const guardarDatos = async () => {
    try {
      const userDocRef = doc(db, "usuarios", uid);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // Si el usuario ya existe (puede ser un investigador), sobrescribir los datos con los datos de lector
        const fileName = nombre || "fotoPerfil"; // Usar el nombre como nombre del archivo
        const fotoURL = foto ? await subirFoto(uid, fileName) : fotoURLState; // Si se sube una nueva foto, usar la nueva URL

        const userData = userSnapshot.data();

        // Si el usuario es un investigador, limpiamos los campos "grado" y "descripcion"
        if (userData.role === "investigador") {
          await setDoc(
            userDocRef,
            {
              idUsuario: uid,
              nombre,
              email,
              fotoURL,
              role: "lector",
              fechaRegistro: new Date(),
              grado: "", // Limpiar el campo "grado"
              descripcion: "", // Limpiar el campo "descripcion"
            },
            { merge: true }
          );
        } else {
          // Si no es investigador, simplemente actualizamos los datos como lector
          await setDoc(
            userDocRef,
            {
              idUsuario: uid,
              nombre,
              email,
              fotoURL,
              role: "lector",
              fechaRegistro: new Date(),
            },
            { merge: true }
          );
        }

        alert("Datos actualizados exitosamente como Lector.");
      } else {
        // Si el usuario no existe, crear el registro como lector
        const fileName = nombre || "fotoPerfil";
        const fotoURL = foto ? await subirFoto(uid, fileName) : fotoURLState;

        await setDoc(userDocRef, {
          idUsuario: uid,
          nombre,
          email,
          fotoURL,
          role: "lector",
          fechaRegistro: new Date(),
        });

        alert("Usuario registrado exitosamente como Lector.");
      }

      navigate("/Login"); // Redirigir al login o a la siguiente página
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      alert("Hubo un problema al guardar los datos.");
    }
  };

  return (
    <div className="investigador_background">
      <h1>¿Deseas añadir una foto de perfil?</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          guardarDatos();
        }}
      >
        <label htmlFor="foto">Foto de perfil (Opcional)</label>
        <input
          type="file"
          id="foto"
          name="foto"
          className="form-control"
          onChange={(e) => {
            if (e.target.files) {
              setFotoPerfil(e.target.files[0]);
            }
          }}
          style={{ marginBottom: "15px" }}
        />

        <button type="submit" className="submit_button">
          Siguiente
        </button>
      </form>
    </div>
  );
};

export default DatosFaltantesLector;
