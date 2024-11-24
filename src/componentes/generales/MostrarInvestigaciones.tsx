import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../firebase/firebaseInit";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import "../estilos/MostrarInvestigaciones.css";
import "bootstrap/dist/css/bootstrap.min.css";

const MostrarInvestigaciones = () => {
  const [investigaciones, setInvestigaciones] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const cargarInvestigacionesYCategorias = async () => {
      try {
        // Cargar las categorías
        const categoriasRef = collection(db, "categorias");
        const categoriasSnapshot = await getDocs(categoriasRef);
        const categoriasData = categoriasSnapshot.docs.map((docSnap) =>
          docSnap.data()
        );
        setCategorias(categoriasData);

        // Cargar las investigaciones
        const investigacionesRef = collection(db, "investigaciones");
        const querySnapshot = await getDocs(investigacionesRef);
        const investigacionesData: any[] = [];

        // Cargar las investigaciones junto con los nombres de los usuarios y la categoría
        for (const docSnap of querySnapshot.docs) {
          const investigacion = docSnap.data();
          const idUsuario = investigacion.idUsuario;

          // Obtener el nombre del usuario
          const usuarioDoc = await getDoc(doc(db, "usuarios", idUsuario));
          const usuarioData = usuarioDoc.exists()
            ? usuarioDoc.data()
            : { nombre: "Desconocido" };

          // Obtener las URLs de las imágenes desde Firebase Storage
          const imagenUrls = await cargarImagenes(investigacion.imagenes);

          // Obtener la categoría correspondiente
          const categoriaDoc = await getDoc(
            doc(db, "categorias", investigacion.categoria)
          );
          const categoriaData = categoriaDoc.exists()
            ? categoriaDoc.data()
            : { nombre_categoria: "Sin categoría" };

          investigacionesData.push({
            id: docSnap.id,
            ...investigacion,
            nombreUsuario: usuarioData.nombre, // Agregar nombre del usuario
            imagenes: imagenUrls, // Agregar las URLs de las imágenes
            categoriaNombre: categoriaData.nombre_categoria, // Agregar nombre de la categoría
          });
        }

        setInvestigaciones(investigacionesData);
      } catch (error) {
        console.error("Error al cargar investigaciones y categorías:", error);
        alert("Hubo un problema al cargar las investigaciones.");
      }
      setLoading(false);
    };

    cargarInvestigacionesYCategorias();
  }, []);

  const cargarImagenes = async (imagenes: string[]) => {
    const imagenUrls: string[] = [];
    for (const imagen of imagenes) {
      const imageRef = ref(storage, imagen);
      const url = await getDownloadURL(imageRef);
      imagenUrls.push(url);
    }
    return imagenUrls;
  };

  const handleCardClick = (id: string) => {
    navigate(`/investigacion/${id}`);
  };

  const handleCategoriaChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCategoriaSeleccionada(event.target.value);
  };

  const investigacionesFiltradas = categoriaSeleccionada
    ? investigaciones.filter(
        (investigacion) =>
          investigacion.categoriaNombre === categoriaSeleccionada
      )
    : investigaciones;

  if (loading) {
    return <div className="text-center">Cargando investigaciones...</div>;
  }

  return (
    <div className="background">
      <div className="container mt-5">
        <h1 className="text-center mb-4">Investigaciones</h1>

        {/* ComboBox para seleccionar la categoría */}
        <div className="mb-4">
          <label htmlFor="categoriaSelect" className="form-label">
            Filtrar por categoría:
          </label>
          <select
            id="categoriaSelect"
            className="form-select"
            value={categoriaSeleccionada}
            onChange={handleCategoriaChange}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option
                key={categoria.id_categoria}
                value={categoria.nombre_categoria}
              >
                {categoria.nombre_categoria}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          {investigacionesFiltradas.map((investigacion) => (
            <div
              className="col-md-4 mb-4"
              key={investigacion.id}
              onClick={() => handleCardClick(investigacion.id)}
            >
              <div className="card h-100">
                {/* Carrusel de imágenes */}
                <div
                  id={`carousel-${investigacion.id}`}
                  className="carousel slide"
                  data-bs-ride="carousel"
                  data-bs-interval="1000" // Cambiar cada 3 segundos
                >
                  <div className="carousel-inner">
                    {investigacion.imagenes.length > 0 && (
                      <div className="carousel-item active">
                        <img
                          src={investigacion.imagenes[0]} // Cargar la primera imagen inmediatamente
                          className="d-block w-100"
                          alt="Imagen principal"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {investigacion.imagenes
                      .slice(1)
                      .map((imagen: string, index: number) => (
                        <div className={`carousel-item`} key={index}>
                          <img
                            src={imagen}
                            className="d-block w-100"
                            alt={`Imagen ${index + 2}`}
                            loading="lazy"
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="card-body">
                  <h5 className="card-title">{investigacion.titulo}</h5>
                  <p className="card-text">{investigacion.descripcion}</p>
                  <p className="card-text">
                    <strong>Propietario:</strong> {investigacion.nombreUsuario}
                  </p>
                  <p className="card-text">
                    <strong>Categoría:</strong> {investigacion.categoriaNombre}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MostrarInvestigaciones;
