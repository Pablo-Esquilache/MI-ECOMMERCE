const db = require('./config/database');
const bcrypt = require('bcrypt');

async function createAdmin() {
    const email = 'pabloesquilache@gmail.com';
    const rawPass = '34547144';
    
    // 10 "Salts" garantizan nivel militar en Bcrypt
    const hashed = await bcrypt.hash(rawPass, 10);

    try {
        const res = await db.query('SELECT id FROM administradores WHERE email = $1', [email]);
        if (res.rows.length > 0) {
            await db.query('UPDATE administradores SET password = $1 WHERE email = $2', [hashed, email]);
            console.log('✅ Administrador Pablo Esquilache actualizado con éxito (Se pisó la clave por 34547144).');
        } else {
            await db.query('INSERT INTO administradores (nombre, email, password) VALUES ($1, $2, $3)', ['Pablo Esquilache', email, hashed]);
            console.log('✅ Nuevo Administrador Pablo Esquilache creado desde cero con éxito.');
        }
        process.exit(0);
    } catch(e) {
        console.error('Error insertando a pablo:', e);
        process.exit(1);
    }
}

createAdmin();
