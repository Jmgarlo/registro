# Registro de Alumnos

Este es un proyecto de registro de alumnos que permite agregar y listar alumnos, junto con sus detalles, incluyendo una foto. La aplicación está construida con Node.js, Express y PostgreSQL.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [PostgreSQL](https://www.postgresql.org/) (v12 o superior)

## Instalación

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu_usuario/registro_alumnos.git
   cd registro_alumnos
2. **Instala las dependencias**:
   ```bash
   npm install
## Configuración de la Base de Datos

1. Crea una base de datos en PostgreSQL:
   Abre la terminal de PostgreSQL y ejecuta:
   ```bash
    CREATE DATABASE registro_alumnos;

2. Crea la tabla de alumnos:

Conéctate a la base de datos que acabas de crear y ejecuta el siguiente script SQL:

    CREATE TABLE alumnos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL UNIQUE,
        telefono VARCHAR(15) NOT NULL UNIQUE,
        dni VARCHAR(10) NOT NULL UNIQUE,
        curso VARCHAR(50) NOT NULL,
        direccion VARCHAR(255) NOT NULL,
        foto VARCHAR(255) NOT NULL
    );

3. Configura la conexión a la base de datos:

Asegúrate de que el archivo config/db.js esté configurado correctamente con los datos de conexión a tu base de datos PostgreSQL.
Reemplaza los valores de user y contraseña por los que configures en tu base de datos:


    ```bash
    const { Pool } = require('pg');
    
    const pool = new Pool({
        user: 'tu_usuario',
        host: 'localhost',
        database: 'registro_alumnos',
        password: 'tu_contraseña',
        port: 5432,
    });
    
    module.exports = pool;

## Ejecutar el proyecto

1. Inicia el servidor
     ```bash
     node app.js
3. Abre tu navegador y entra en http://localhost:3000 para acceder a la aplicación.


