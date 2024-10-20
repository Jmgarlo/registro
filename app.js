const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const pool = require('./config/db');
const app = express();
const port = 3000;

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/fotos'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Añadir un sufijo único al nombre del archivo
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Renderizar la página principal
app.get('/', (req, res) => {
    const error = req.query.error || null;
    res.render('index', { error });
});

// Obtener alumnos
app.get('/api/alumnos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alumnos');
        const alumnos = result.rows;
        res.json(alumnos);
    } catch (err) {
        res.status(500).send('Error en el servidor al obtener alumnos');
    }
});

// Agregar un nuevo alumno
app.post('/agregar', upload.single('foto'), async (req, res) => {
    console.log('Cuerpo de la solicitud (req.body):', req.body);
    console.log('Archivo subido (req.file):', req.file);
    
    const { nombre, correo, telefono, dni, curso, direccion } = req.body;
    
    const foto = req.file ? `/fotos/${req.file.filename}` : null;

    
    if (!nombre || !correo || !telefono || !dni || !curso || !direccion || !foto) {

        return res.redirect('/?error=Todos los campos son obligatorios.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return res.redirect('/?error=El teléfono debe ser un número de 9 dígitos.');
    }

    try {

        const existingEmail = await pool.query('SELECT * FROM alumnos WHERE correo = $1', [correo]);
        const existingDni = await pool.query('SELECT * FROM alumnos WHERE dni = $1', [dni]);
        const existingTelefono = await pool.query('SELECT * FROM alumnos WHERE telefono = $1', [telefono]);

        if (existingEmail.rows.length > 0) {
            return res.redirect('/?error=El email ya está registrado.');
        }

        if (existingDni.rows.length > 0) {
            return res.redirect('/?error=El DNI ya está registrado.');
        }

        if (existingTelefono.rows.length > 0) {
            return res.redirect('/?error=El teléfono ya está registrado.');
        }

        await pool.query('INSERT INTO alumnos (nombre, correo, telefono, dni, curso, direccion, foto) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
            [nombre, correo, telefono, dni, curso, direccion, foto]);

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/?error=Error al guardar los datos.');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
