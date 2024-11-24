import React, { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseInit";
import "../estilos/Categorias.css";

interface Categoria {
  id_categoria: string;
  nombre_categoria: string;
  desc_categoria: string;
}

const Categorias: React.FC = () => {
  const randomNumber = Math.floor(Math.random() * 1000) + 1;

  const [categoria, setCategoria] = useState<Categoria>({
    id_categoria: "",
    nombre_categoria: "",
    desc_categoria: "",
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Función para obtener las categorías desde Firestore
  const fetchCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categorias"));
      const categoriasArray: Categoria[] = [];
      querySnapshot.forEach((doc) => {
        categoriasArray.push({
          id_categoria: doc.id,
          ...doc.data(),
        } as Categoria);
      });
      setCategorias(categoriasArray);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Manejo del formulario de agregar categoría
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory: Categoria = {
      ...categoria,
      id_categoria: randomNumber.toString(),
    };

    setDoc(doc(db, "categorias", newCategory.id_categoria), newCategory)
      .then(() => {
        console.log("Categoría añadida correctamente.");
        fetchCategorias(); // Actualizar las categorías después de agregar
      })
      .catch((error) => {
        console.error("Error al añadir la categoría: ", error);
      });

    setCategoria({
      id_categoria: "",
      nombre_categoria: "",
      desc_categoria: "",
    });
  };

  return (
    <div className="categorias-container">
      <h1 className="categorias-title">Gestión de Categorías</h1>
      <form className="categorias-form" onSubmit={handleSubmit}>
        <label className="categorias-label" htmlFor="nombreCategoria">
          Nombre de la categoría:
        </label>
        <input
          className="categorias-input"
          type="text"
          id="nombreCategoria"
          placeholder="Nombre de la categoría"
          value={categoria.nombre_categoria}
          onChange={(e) =>
            setCategoria({ ...categoria, nombre_categoria: e.target.value })
          }
        />
        <label className="categorias-label" htmlFor="descCategoria">
          Descripción:
        </label>
        <input
          className="categorias-input"
          type="text"
          id="descCategoria"
          placeholder="Descripción de la categoría"
          value={categoria.desc_categoria}
          onChange={(e) =>
            setCategoria({ ...categoria, desc_categoria: e.target.value })
          }
        />
        <button className="categorias-button" type="submit">
          Agregar Categoría
        </button>
      </form>

      <h2 className="categorias-subtitle">Categorías existentes:</h2>
      <div className="categorias-list-container">
        <ul className="categorias-list">
          {categorias.length > 0 ? (
            categorias.map((categoria) => (
              <li className="categorias-list-item" key={categoria.id_categoria}>
                <span className="categorias-list-item-name">
                  {categoria.nombre_categoria}
                </span>
                <span className="categorias-list-item-desc">
                  {categoria.desc_categoria}
                </span>
              </li>
            ))
          ) : (
            <p className="categorias-empty">No hay categorías disponibles :c</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Categorias;
