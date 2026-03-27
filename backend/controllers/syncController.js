const db = require('../config/database');

const syncController = {
  // Middleware de Autenticación Máquina-Máquina
  authSync: async (req, res, next) => {
    try {
      const { rows } = await db.query("SELECT sync_activo, sync_api_key FROM configuracion LIMIT 1");
      if (!rows.length) return res.status(500).json({ error: 'Config no inicializada' });
      
      const conf = rows[0];
      
      if (!conf.sync_activo) {
        return res.status(403).json({ error: 'La sincronización está apagada en el E-Commerce.' });
      }

      const authHeader = req.headers.authorization; 
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no provisto o inválido.' });
      }

      const token = authHeader.split(' ')[1];
      if (token !== conf.sync_api_key) {
        return res.status(401).json({ error: 'Credenciales de Sincronización Inválidas.' });
      }

      next();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Falla verificando el token API' });
    }
  },

  // 1. POST /upsert-product (Local -> Nube)
  upsertProduct: async (req, res) => {
    try {
      const p = req.body;
      if (!p.id) return res.status(400).json({error: 'Falta el ID del producto'});

      // Utilizamos COALESCE para que si la app local no manda nombre o precio, se mantenga el valor que ya existía en la Nube
      const query = `
        INSERT INTO productos (id, nombre, descripcion, precio, stock, categoria) 
        VALUES ($1, $2, '', $3, $4, 'otros') 
        ON CONFLICT (id) DO UPDATE SET 
          nombre = CASE WHEN EXCLUDED.nombre = '' THEN productos.nombre ELSE EXCLUDED.nombre END,
          precio = CASE WHEN EXCLUDED.precio = -1 THEN productos.precio ELSE EXCLUDED.precio END,
          stock  = CASE WHEN EXCLUDED.stock = -999999 THEN productos.stock ELSE EXCLUDED.stock END,
          sincronizado_local = TRUE
      `;
      
      const safeNombre = p.nombre || '';
      const safePrecio = p.precio != null ? Number(p.precio) : -1;
      const safeStock = p.stock != null ? Number(p.stock) : -999999;

      await db.query(query, [p.id, safeNombre, safePrecio, safeStock]);
      
      res.json({ success: true, message: "Producto " + p.id + " sincronizado en la Nube."});
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error del upsert en la nube' });
    }
  },

  // 2. POST /update-stock (Local -> Nube: descuenta ventas)
  updateStockFromLocal: async (req, res) => {
      try {
          const { updates } = req.body; 
          if(!updates || !Array.isArray(updates)) return res.status(400).json({error: 'Formato o payload inválido'});

          for (const item of updates) {
              await db.query("UPDATE productos SET stock = stock - $1 WHERE id = $2", [item.cantidad_vendida, item.id_producto]);
          }

          res.json({ success: true, message: 'Stock descontado en la nube.' });
      } catch(e) {
          console.error(e);
          res.status(500).json({ error: 'Error actualizando stocks' });
      }
  },

  // 3. GET /pending-sales (Nube -> Local)
  getPendingWebSales: async (req, res) => {
      try {
          const query = "SELECT * FROM pedidos WHERE estado = 'pagado' AND sincronizado_local = FALSE";
          const { rows: ventas } = await db.query(query);

          res.json({ success: true, ventas_pendientes: ventas });
      } catch (e) {
          console.error(e);
          res.status(500).json({ error: 'Error leyendo ventas' });
      }
  },

  // 4. GET /pending-product-updates (Nube -> Local)
  getPendingProductUpdates: async (req, res) => {
      try {
          const query = "SELECT * FROM productos WHERE sincronizado_local = FALSE";
          const { rows: productos } = await db.query(query);
          
          res.json({ success: true, productos_modificados: productos });
      } catch(e) {
          console.error(e);
          res.status(500).json({ error: 'Error leyendo actualizaciones de productos web' });
      }
  },

  // 5. POST /mark-synced (Nube acepta confirmación del Local)
  markSynced: async (req, res) => {
      try {
          const { pedidos_ids, productos_ids } = req.body;

          if (pedidos_ids && pedidos_ids.length > 0) {
              await db.query("UPDATE pedidos SET sincronizado_local = TRUE WHERE id = ANY($1)", [pedidos_ids]);
          }

          if (productos_ids && productos_ids.length > 0) {
              await db.query("UPDATE productos SET sincronizado_local = TRUE WHERE id = ANY($1)", [productos_ids]);
          }

          res.json({ success: true, message: 'OK marcados como recibidos.' });
      } catch (e) {
          console.error(e);
          res.status(500).json({ error: 'Error marcando sincronización.' });
      }
  }
};

module.exports = syncController;
