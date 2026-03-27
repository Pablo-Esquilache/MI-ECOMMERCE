const db = require('../config/database');

const Producto = {
  getAll: async (all = false) => {
    let query = 'SELECT * FROM productos WHERE activo = true AND stock > 0 ORDER BY id DESC';
    if(all) {
        query = 'SELECT * FROM productos ORDER BY id DESC';
    }
    const { rows } = await db.query(query);
    return rows;
  },

  toggleActive: async (id) => {
    const query = 'UPDATE productos SET activo = NOT activo WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  getById: async (id) => {
    const query = 'SELECT * FROM productos WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  create: async (data) => {
    const { nombre, descripcion, precio, stock, categoria, sku, peso, dimensiones, imagen_1, imagen_2, imagen_3 } = data;
    const query = `
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria, sku, peso, dimensiones, imagen_1, imagen_2, imagen_3, sincronizado_local)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE)
      RETURNING *
    `;
    const values = [nombre, descripcion, precio, stock || 0, categoria, sku, peso, dimensiones, imagen_1, imagen_2, imagen_3];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  update: async (id, data) => {
    const { nombre, descripcion, precio, stock, categoria, sku, peso, dimensiones, imagen_1, imagen_2, imagen_3 } = data;
    const query = `
      UPDATE productos 
      SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria = $5, 
          sku = $6, peso = $7, dimensiones = $8, imagen_1 = coalesce($9, imagen_1), 
          imagen_2 = coalesce($10, imagen_2), imagen_3 = coalesce($11, imagen_3),
          sincronizado_local = FALSE
      WHERE id = $12
      RETURNING *
    `;
    const values = [nombre, descripcion, precio, stock, categoria, sku, peso, dimensiones, imagen_1, imagen_2, imagen_3, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  delete: async (id) => {
    const query = 'DELETE FROM productos WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  updateStock: async (id, quantityVariation) => {
    // Si la variación es negativa, descuenta stock. Si es positiva, aumenta.
    const query = `
      UPDATE productos 
      SET stock = stock + $1 
      WHERE id = $2 AND (stock + $1) >= 0
      RETURNING stock
    `;
    const { rows } = await db.query(query, [quantityVariation, id]);
    return rows[0];
  }
};

module.exports = Producto;
