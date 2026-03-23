const db = require('./config/database');
const bcrypt = require('bcrypt');

async function fixAdmin() {
  try {
    const password = 'admin123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Forzamos actualización o inserción
    const email = 'admin@ecommerce.com';
    await db.query(`
      INSERT INTO administradores (email, password, nombre) 
      VALUES ($1, $2, 'Administrador Principal')
      ON CONFLICT (email) DO UPDATE 
      SET password = EXCLUDED.password
    `, [email, hash]);

    console.log("Administrador creado/actualizado con éxito.");
    console.log(`Email: ${email} | Pass: ${password} | Nuevo Hash: ${hash}`);
  } catch(e) {
    console.error("Error al actualizar admin:", e.message);
  }
  process.exit();
}

fixAdmin();
