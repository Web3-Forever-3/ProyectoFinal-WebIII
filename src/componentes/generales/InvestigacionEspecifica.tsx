import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, storage } from "../../firebase/firebaseInit";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc, // Aquí es donde añades la importación de addDoc
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import "../estilos/InvestigacionEspecifica.css";

import fullStar from "../estilos/imgs/full star.png";
import emptyStar from "../estilos/imgs/empty star.png";
import anonymousPicture from "../estilos/imgs/anonymous-man.png";

const InvestigacionEspecifica = () => {
  const { id } = useParams();
  const [investigacion, setInvestigacion] = useState<any | null>(null);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any | null>(null);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [comentario, setComentario] = useState<string>("");
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarioLogueado, setUsuarioLogueado] = useState<any | null>(null);

  // Cargar investigación y sus datos relacionados
  useEffect(() => {
    const cargarInvestigacion = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, "investigaciones", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const imagenUrls = await cargarImagenes(data.imagenes);
          const pdf = data.pdfUrl ? await cargarPdf(data.pdfUrl) : null;

          const usuarioRef = doc(db, "usuarios", data.idUsuario);
          const usuarioSnap = await getDoc(usuarioRef);
          const usuarioData = usuarioSnap.exists() ? usuarioSnap.data() : null;

          const categoriaRef = doc(db, "categorias", data.categoria);
          const categoriaSnap = await getDoc(categoriaRef);
          const categoriaData = categoriaSnap.exists()
            ? categoriaSnap.data()
            : null;

          setInvestigacion(data);
          setImagenes(imagenUrls);
          setPdfUrl(pdf);
          setUsuario(usuarioData);
          setCategoria(
            categoriaData?.nombre_categoria || "Categoría no encontrada"
          );
        } else {
          console.log("Investigación no encontrada");
        }
      } catch (error) {
        console.error("Error al cargar la investigación:", error);
      }
      setLoading(false);
    };

    cargarInvestigacion();
  }, [id]);

  // Cargar comentarios en tiempo real
  useEffect(() => {
    const cargarComentarios = () => {
      try {
        if (!id) return;
        const comentariosQuery = query(
          collection(db, "comentarios"),
          where("id_investigacion", "==", id)
        );

        // Usar onSnapshot para escuchar cambios en tiempo real
        const unsubscribe = onSnapshot(
          comentariosQuery,
          async (comentariosSnap) => {
            const comentariosData = comentariosSnap.docs.map((doc) =>
              doc.data()
            );

            const comentariosConUsuario = await Promise.all(
              comentariosData.map(async (comentario) => {
                const usuarioRef = doc(db, "usuarios", comentario.id_usuario);
                const usuarioSnap = await getDoc(usuarioRef);
                const usuarioData = usuarioSnap.exists()
                  ? usuarioSnap.data()
                  : null;

                let fotoDescargada = "";
                const fotoURL = usuarioData?.fotoURL || anonymousPicture;

                // Verificar si la URL de la foto es válida
                if (fotoURL && fotoURL !== "") {
                  if (fotoURL.includes("firebasestorage")) {
                    // Si la URL es de Firebase Storage, obtener la URL de la imagen
                    fotoDescargada = await getDownloadURL(
                      ref(storage, fotoURL)
                    );
                  } else {
                    // Si la URL no es de Firebase Storage (por ejemplo, URL externa), usarla directamente
                    fotoDescargada = fotoURL;
                  }
                } else {
                  // Si no hay foto, asignar una URL de imagen predeterminada
                  fotoDescargada = "ruta-a-imagen-predeterminada.jpg"; // Cambiar por la ruta de una imagen predeterminada
                }

                return {
                  ...comentario,
                  nombre_usuario:
                    usuarioData?.nombre || "Usuario no encontrado",
                  fotoURL: fotoDescargada || "",
                };
              })
            );

            setComentarios(comentariosConUsuario);
          }
        );

        return unsubscribe; // Esto se llama para limpiar la suscripción cuando el componente se desmonte
      } catch (error) {
        console.error("Error al cargar los comentarios:", error);
      }
    };

    const unsubscribe = cargarComentarios();

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  const cargarImagenes = async (imagenes: string[]) => {
    const imagenUrls: string[] = [];
    for (const imagen of imagenes) {
      const imageRef = ref(storage, imagen);
      const url = await getDownloadURL(imageRef);
      imagenUrls.push(url);
    }
    return imagenUrls;
  };

  const cargarPdf = async (pdfUrl: string) => {
    const pdfRef = ref(storage, pdfUrl);
    return await getDownloadURL(pdfRef);
  };

  const agregarComentario = async () => {
    if (comentario.trim() && calificacion !== null && usuarioLogueado) {
      try {
        const user = usuarioLogueado;

        await addDoc(collection(db, "comentarios"), {
          id_investigacion: id,
          id_usuario: user.idUsuario,
          contenido_comentario: comentario,
          fecha_comentario: new Date(),
          calificacion: calificacion,
        });

        setComentario("");
        setCalificacion(null);
      } catch (error) {
        console.error("Error al agregar comentario:", error);
      }
    } else {
      alert("Debe estar logueado para comentar.");
    }
  };

  const obtenerUsuarioLogueado = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUsuarioLogueado({
        idUsuario: user.uid,
        nombre: user.displayName || "Usuario sin nombre",
        fotoURL: user.photoURL || "",
      });
    }
  };

  useEffect(() => {
    obtenerUsuarioLogueado();
  }, []);

  const handleStarClick = (index: number) => {
    setCalificacion(index + 1);
  };

  if (loading) {
    return <div className="loading-container">Cargando investigación...</div>;
  }

  if (!investigacion) {
    return (
      <div className="error-container">No se encontró la investigación.</div>
    );
  }

  return (
    <div className="background_imagen">
      <div className="investigacion-especifica-container">
        <h1 className="investigacion-especifica-titulo">
          {investigacion.titulo}
        </h1>

        {usuario && (
          <div className="investigacion-especifica-info-container">
            <h4>
              Investigador:
              {usuario.fotoURL ? (
                <img
                  src={usuario.fotoURL}
                  alt="Foto del investigador"
                  className="foto-usuario"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
              ) : (
                <span>No hay foto disponible</span>
              )}
              {usuario.nombre}
            </h4>
            <p>
              <strong>Sobre el propietario:</strong> {usuario.descripcion}
            </p>
            <p>
              <strong>Grado: </strong>
              {usuario.grado}
            </p>
            <p>
              <strong>Email: </strong>
              {usuario.email}
            </p>
            <div className="investigacion-especifica-descripcion-info">
              <h4>Descripción:</h4>
              <p>{investigacion.descripcion}</p>
            </div>
          </div>
        )}

        <div className="imagenes-container">
          {imagenes.length > 0 ? (
            imagenes.map((imagenUrl, index) => (
              <img
                key={index}
                src={imagenUrl}
                alt={`Imagen de investigación ${index + 1}`}
                className="imagen-investigacion"
              />
            ))
          ) : (
            <p>No hay imágenes disponibles.</p>
          )}
        </div>

        {pdfUrl ? (
          <div className="pdf-container">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Ver o descargar el PDF
            </a>
          </div>
        ) : (
          <p>No hay PDF disponible.</p>
        )}

        <div className="categoria-container">
          <strong>Categoría: </strong>
          <p>{categoria}</p>
        </div>

        <h3 className="investigacion-especifica-titulo">
          ¿Deseas agregar un comentario?
          <br />
          <p>¡Recuerda iniciar sesión para comentar!</p>
        </h3>

        <div>
          <label>Calificación:</label>
          <div className="stars-container">
            {[...Array(5)].map((_, index) => (
              <img
                key={index}
                src={index < (calificacion || 0) ? fullStar : emptyStar}
                alt={
                  index < (calificacion || 0)
                    ? "Estrella llena"
                    : "Estrella vacía"
                }
                className="star-icon"
                onClick={() => handleStarClick(index)}
                style={{
                  width: "30px",
                  cursor: "pointer", // Para indicar que es clickeable
                }}
              />
            ))}
          </div>
        </div>

        {/* Mostrar el textarea y el botón siempre */}
        <div className="comentario-input-container">
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe tu comentario..."
            disabled={!usuarioLogueado} // Deshabilitar si no hay usuario logueado
          />
          <button onClick={agregarComentario} disabled={!usuarioLogueado}>
            {" "}
            {/* Deshabilitar si no hay usuario logueado */}
            {usuarioLogueado
              ? "Agregar comentario"
              : "Inicia sesión para comentar"}
          </button>
        </div>

        <h3>Comentarios:</h3>
        <br />
        {comentarios.length > 0 ? (
          comentarios.map((comentario, index) => (
            <div key={index} className="comentario">
              <h4>
                <img
                  src={comentario.fotoURL || anonymousPicture}
                  alt="Foto de perfil"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
                {comentario.nombre_usuario}
              </h4>
              <p>{comentario.contenido_comentario}</p>
              <p>Calificación: {comentario.calificacion} estrellas</p>
              <p>
                {new Date(
                  comentario.fecha_comentario.toDate()
                ).toLocaleDateString()}
              </p>
              <hr />
            </div>
          ))
        ) : (
          <p>No hay comentarios aún.</p>
        )}
      </div>
    </div>
  );
};

export default InvestigacionEspecifica;
