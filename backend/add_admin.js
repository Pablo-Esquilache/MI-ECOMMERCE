const db = require('./config/database');
const bcrypt = require('bcrypt');

async function addAdmin() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('❌ Uso incorrecto. Tenés que usar: node add_admin.js <nombre> <email> <contraseña>');
        console.log('👉 Ejemplo: node add_admin.js "Maria Gonzalez" maria@gmail.com mipasword123');
        process.exit(1);
    }

    const nombre = args[0];
    const email = args[1];
    const rawPass = args[2];
    
    // 10 "Salts" garantizan seguridad
    const hashed = await bcrypt.hash(rawPass, 10);

    try {
        const res = await db.query('SELECT id FROM administradores WHERE email = $1', [email]);
        if (res.rows.length > 0) {
            await db.query('UPDATE administradores SET nombre = $1, password = $2 WHERE email = $3', [nombre, hashed, email]);
            console.log(`✅ Administrador '${nombre}' actualizado con éxito (Se pisó su clave).`);
        } else {
            await db.query('INSERT INTO administradores (nombre, email, password) VALUES ($1, $2, $3)', [nombre, email, hashed]);
            console.log(`✅ ¡Éxito! Nuevo administrador '${nombre}' agregado. Ahora hay ${res.rows.length + 1} o más administradores en el sistema.`);
        }
        process.exit(0);
    } catch(e) {
        console.error(`Error agregando al administrador ${email}:`, e);
        process.exit(1);
    }
}

addAdmin();
