import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-primary " >
            <div className="container">
                <Link className="navbar-brand" to="/">Forever3</Link>
                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <div className="ms-auto d-flex">
                        <Link className="navbar-brand" to="/register">Registrar Usuario</Link>
                        <Link className="navbar-brand" to="/login">Iniciar Sesión</Link>
                        <Link className="navbar-brand" to="/login">Cerrar Sesion</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
