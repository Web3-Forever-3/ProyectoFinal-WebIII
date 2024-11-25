import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../firebase/firebaseInit";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../estilos/AddInvestigacion.css";

const AddInvestigacion = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);
  const [conclusion, setConclusion] = useState(""); // Nuevo estado para la conclusión
  const [recomendaciones, setRecomendaciones] = useState(""); // Nuevo estado para las recomendaciones
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);

      if (user) {
        setUsuario(user);
        try {
          const usuarioRef = doc(db, "usuarios", user.uid);
          const usuarioSnap = await getDoc(usuarioRef);

          if (usuarioSnap.exists()) {
            const datosUsuario = usuarioSnap.data();
            alert(
              `Datos del usuario: ${JSON.stringify(datosUsuario, null, 2)}`
            );
            setRol(datosUsuario.role);

            if (datosUsuario.role === "lector") {
              alert(
                "Los lectores no tienen permiso para publicar investigaciones."
              );
              navigate("/Login");
            } else if (datosUsuario.role === "investigador") {
              await cargarCategorias();
            }
          } else {
            alert("Usuario no encontrado en la base de datos.");
            navigate("/Login");
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
          alert("Error al cargar datos del usuario.");
          navigate("/Login");
        }
      } else {
        alert("Debes estar autenticado para acceder a esta página.");
        navigate("/Login");
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const cargarCategorias = async () => {
    try {
      const categoriasRef = collection(db, "categorias");
      const querySnapshot = await getDocs(categoriasRef);
      const categoriasData: any[] = [];
      querySnapshot.forEach((doc) => {
        categoriasData.push(doc.data());
      });
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
    }
  };

  const enviarForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoria) {
      alert("Debes seleccionar una categoría.");
      return;
    }

    if (imagenes.length < 4 || imagenes.length > 6) {
      alert("Debes cargar entre 4 y 6 imágenes.");
      return;
    }

    if (!pdf) {
      alert("Debes cargar un archivo PDF.");
      return;
    }

    setLoading(true);
    try {
      if (!usuario) {
        alert("Debes estar autenticado para añadir una investigación.");
        navigate("/Login");
        return;
      }

      const nuevaInvestigacion = {
        titulo,
        categoria,
        descripcion,
        conclusion, // Incluir la conclusión
        recomendaciones, // Incluir las recomendaciones
        idUsuario: usuario.uid,
        fechaCreacion: new Date(),
      };

      const docRef = await addDoc(
        collection(db, "investigaciones"),
        nuevaInvestigacion
      );

      const imagenUrls = await subirImagenes(docRef.id, titulo);
      const pdfUrl = await subirPdf(docRef.id, titulo);

      const docRefToUpdate = doc(db, "investigaciones", docRef.id);
      await updateDoc(docRefToUpdate, {
        imagenes: imagenUrls,
        pdfUrl,
      });

      alert("Investigación añadida exitosamente.");
      navigate("/");
    } catch (error) {
      console.error("Error al subir la investigación:", error);
      alert("Hubo un problema al añadir la investigación.");
    }
    setLoading(false);
  };

  const subirArchivo = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const subirImagenes = async (id: string, titulo: string) => {
    const imagenUrls: string[] = [];
    for (let i = 0; i < imagenes.length; i++) {
      const file = imagenes[i];
      const fileName = `investigaciones/${id}/${titulo}/imagenes/${file.name}`;
      const url = await subirArchivo(file, fileName);
      imagenUrls.push(url);
    }
    return imagenUrls;
  };

  const subirPdf = async (id: string, titulo: string) => {
    if (!pdf) return "";
    const pdfName = `investigaciones/${id}/${titulo}/pdf/${pdf.name}`;
    return await subirArchivo(pdf, pdfName);
  };

  if (authLoading) return <div>Cargando...</div>;

  return (
    <div className="add-investigacion-container">
      <h1>Añadir Investigación</h1>
      <form onSubmit={enviarForm}>
        <label htmlFor="titulo">Título de la Investigación:</label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label htmlFor="categoria">Categoría:</label>
        <select
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          {categorias.map((cat, index) => (
            <option key={index} value={cat.id_categoria}>
              {cat.nombre_categoria}
            </option>
          ))}
        </select>

        <label htmlFor="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />

        <label htmlFor="conclusion">Conclusión:</label>
        <textarea
          id="conclusion"
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          required
        />

        <label htmlFor="recomendaciones">Recomendaciones Finales:</label>
        <textarea
          id="recomendaciones"
          value={recomendaciones}
          onChange={(e) => setRecomendaciones(e.target.value)}
          required
        />

        <label htmlFor="imagenes">Imágenes (4-6):</label>
        <input
          type="file"
          id="imagenes"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setImagenes(Array.from(e.target.files));
            }
          }}
          required
        />

        <label htmlFor="pdf">Archivo PDF:</label>
        <input
          type="file"
          id="pdf"
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files) {
              setPdf(e.target.files[0]);
            }
          }}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Subiendo..." : "Añadir Investigación"}
        </button>
      </form>
    </div>
  );
};

export default AddInvestigacion;
