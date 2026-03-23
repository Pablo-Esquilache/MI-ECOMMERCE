const db = require('../config/database');

const Cliente = {
  getByEmail: async (email) => {
    const query = 'SELECT * FROM clientes WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  },

  getAll: async () => {
    const query = 'SELECT * FROM clientes ORDER BY id DESC';
    const { rows } = await db.query(query);
    return rows;
  },

  create: async (data) => {
    const { nombre, apellido, email, telefono, genero, direccion, ciudad, provincia, codigo_postal } = data;
    const query = `
      INSERT INTO clientes (nombre, apellido, email, telefono, genero, direccion, ciudad, provincia, codigo_postal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [nombre, apellido, email, telefono, genero, direccion, ciudad, provincia, codigo_postal];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  update: async (id, data) => {
    const { nombre, apellido, telefono, genero, direccion, ciudad, provincia, codigo_postal } = data;
    const query = `
      UPDATE clientes 
      SET nombre = $1, apellido = $2, telefono = $3, genero = $4, direccion = $5, ciudad = $6, provincia = $7, codigo_postal = $8
      WHERE id = $9
      RETURNING *
    `;
    const values = [nombre, apellido, telefono, genero, direccion, ciudad, provincia, codigo_postal, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
};

module.exports = Cliente;
