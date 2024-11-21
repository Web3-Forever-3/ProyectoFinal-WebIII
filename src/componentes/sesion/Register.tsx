import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../estilos/Register.css';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className='register_background'>
          <div className="main_contenedor">
            <h2>Bienvenido a la sección de registro</h2>
            <br />
            <br />
            <h3>Registrarse como Lector</h3>
            <p>Registrarte como lector te permitirá publicar comentarios y valorar las investigaciones</p>
            <button>Registrarse como lector</button>
            <p> o </p>
            <h3>Registrarse como Investigador</h3>
            <p>Registrarte como investigador te permitirá publicar tus investigaciones realizadas</p>
            <button onClick={() => navigate('/RegisterInvestigador')}>
              Registrarse como investigador
            </button>
          </div>
    </div>
  );
}

export default Register;
