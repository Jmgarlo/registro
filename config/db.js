const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'registro_alumnos',
    password: 'root',
    port: 5432,
});

module.exports = pool;