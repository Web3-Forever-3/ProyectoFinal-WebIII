import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, storage } from "../../firebase/firebaseInit";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";
import "../estilos/DatosFaltantesInvestigador.css";

const DatosFaltantes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Datos iniciales provenientes de Google SignIn
  const { uid, nombre, email, fotoURL } = location.state || {};

  const [grado, setGrado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const handleGuardarDatos = async () => {
    try {
      let finalFotoURL = fotoURL;

      // Si se seleccionó una nueva foto, subirla a Storage
      if (foto) {
        const storageRef = ref(storage, `usuarios/${uid}/profilePicture.jpg`);
        await uploadBytes(storageRef, foto);
        finalFotoURL = await getDownloadURL(storageRef);
      }

      // Guardar datos en Firestore
      await setDoc(doc(db, "usuarios", uid), {
        idUsuario: uid,
        nombre,
        email,
        grado,
        descripcion,
        fotoURL: finalFotoURL,
        role: "investigador",
        fechaRegistro: new Date(),
      });

      alert("Datos completados y guardados exitosamente!");
      navigate("/Login");
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      alert("Hubo un problema al guardar los datos.");
    }
  };

  return (
    <div className="datos_faltantes_background">
      <h1>Completar Datos de Investigador</h1>
      <form>
        <label htmlFor="grado">Grado:</label>
        <input
          type="text"
          id="grado"
          required
          placeholder="Grado o Año Lectivo"
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
        />

        <label htmlFor="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          required
          placeholder="Una breve descripción sobre ti"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <label htmlFor="foto">Foto de perfil (opcional):</label>
        <input
          type="file"
          id="foto"
          onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
        />

        <button
          type="button"
          className="boton_subir"
          onClick={handleGuardarDatos}
        >
          Guardar
        </button>
      </form>
    </div>
  );
};

export default DatosFaltantes;
