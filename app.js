const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const pool = require("./config/db");
const app = express();
const port = 3000;

// Configuración de sesiones
app.use(
  session({
    secret: "root", // Cambiar valor por algo más seguro en prod
    resave: false,
    saveUninitialized: true,
  })
);

//Configuración para usar connect-flash
app.use(flash());

// Configuración de multer para subir archivos
const storage = multer.memoryStorage(); // Almacena el archivo en memoria
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

//Ruta principal
app.get("/", async (req, res) => {
  try {
    //Obtenemos alumnos
    const result = await pool.query("SELECT * FROM alumnos");
    const alumnos = result.rows;

    // Obtén los mensajes
    const error = req.flash("error");
    const success = req.flash("success");

    //Mandamos un response a la vista index.ejs con los datos
    res.render("index", {
      alumnos: alumnos,
      error: error.length > 0 ? error[0] : null,
      success: success.length > 0 ? success[0] : null,
    });
  } catch (err) {
    console.error("Error al cargar los alumnos:", err);
    req.flash("error", "Error al cargar los alumnos.");
    res.redirect("/");
  }
});

// Agregar un nuevo alumno a la base de datos
app.post("/agregar", upload.single("foto"), async (req, res) => {
  //Desestructuración del req.body para sacar los valores de los campos
  const { nombre, correo, telefono, dni, curso, direccion } = req.body;

  //Validación que evita campos vacíos
  if (!nombre || !correo || !telefono || !dni || !curso || !direccion) {
    req.flash("error", "Todos los campos son obligatorios.");
    return res.redirect("/");
  }

  //Validación de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    req.flash("error", "El formato de correo es inválido.");
    return res.redirect("/");
  }

  try {
    //Comprobar que no existen alumnos con el mismo email, dni y/o teléfono
    const existingEmail = await pool.query(
      "SELECT * FROM alumnos WHERE correo = $1",
      [correo]
    );
    const existingDni = await pool.query(
      "SELECT * FROM alumnos WHERE dni = $1",
      [dni]
    );
    const existingTelefono = await pool.query(
      "SELECT * FROM alumnos WHERE telefono = $1",
      [telefono]
    );

    if (existingEmail.rows.length > 0) {
      req.flash("error", "El correo ya está registrado.");
      return res.redirect("/");
    }

    if (existingDni.rows.length > 0) {
      req.flash("error", "El DNI ya está registrado.");
      return res.redirect("/");
    }

    if (existingTelefono.rows.length > 0) {
      req.flash("error", "El teléfono ya está registrado.");
      return res.redirect("/");
    }

    // Ruta de la foto
    const uniqueSuffix = Math.round(Math.random() * 1e9); // Sufijo aleatorio
    const fotoPath = path.join(__dirname, "public", "fotos", `${uniqueSuffix}-${req.file.originalname}`);

    // Insertar datos en la tabla
    await pool.query(
      "INSERT INTO alumnos (nombre, correo, telefono, dni, curso, direccion, foto) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [nombre, correo, telefono, dni, curso, direccion, `/fotos/${uniqueSuffix}-${req.file.originalname}`]
    );

    // Escribir el archivo en el disco
    fs.writeFile(fotoPath, req.file.buffer, (err) => {
      if (err) {
        console.error("Error al guardar la imagen:", err);
        req.flash("error", "Ocurrió un error al guardar la imagen.");
        return res.redirect("/");
      }
      req.flash("success", "Alumno agregado correctamente.");
      res.redirect("/");
    });
  } catch (err) {
    console.error("Error al agregar el alumno:", err);
    req.flash("error", "Error al guardar los datos.");
    res.redirect("/");
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
