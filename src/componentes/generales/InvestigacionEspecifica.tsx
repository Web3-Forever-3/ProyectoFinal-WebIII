import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, storage } from "../../firebase/firebaseInit";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import "../estilos/InvestigacionEspecifica.css";

const InvestigacionEspecifica = () => {
  const { id } = useParams();
  const [investigacion, setInvestigacion] = useState<any | null>(null);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any | null>(null);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

          // Obtener el usuario que es el propietario de la investigación
          const usuarioRef = doc(db, "usuarios", data.idUsuario);
          const usuarioSnap = await getDoc(usuarioRef);
          const usuarioData = usuarioSnap.exists() ? usuarioSnap.data() : null;

          // Obtener la categoría de la investigación
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
        {/* Información del propietario y descripción */}
        {usuario && (
          <div className="investigacion-especifica-info-container">
            <h4>Investigador: {usuario.nombre}</h4>
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
        {/* Categoría */}
        <div className="investigacion-especifica-categoria-info">
          <h4>Categoría:</h4>
          <p>{categoria}</p>
        </div>
        {/* Carrusel de imágenes */}
        <div className="investigacion-especifica-imagenes-container">
          <h4>Imágenes relacionadas:</h4>
          <div className="row">
            {imagenes.slice(0, 6).map((imagen, index) => (
              <div className="col-md-4 col-sm-6" key={index}>
                <div className="investigacion-especifica-imagen-item">
                  <img
                    src={imagen}
                    alt={`Imagen ${index + 1}`}
                    className="investigacion-especifica-imagen img-fluid"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <h3 style={{ color: "Black", textAlign: "center" }}>
          ¿Interesado en la investigacion?
        </h3>
        {/* Visualización del PDF */}
        {pdfUrl && (
          <div className="investigacion-especifica-pdf-container">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Ver PDF
            </a>
          </div>
        )}
        {/* Recomendaciones y Conclusiones */}
        <div className="investigacion-especifica-recomendaciones-container">
          <h4>Recomendaciones:</h4>
          <p>{investigacion.recomendaciones || "No disponibles"}</p>
        </div>
        <div className="investigacion-especifica-conclusiones-container">
          <h4>Conclusión:</h4>
          <p>{investigacion.conclusion || "No disponible"}</p>
        </div>
      </div>
    </div>
  );
};

export default InvestigacionEspecifica;
