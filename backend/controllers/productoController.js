const Producto = require('../models/Producto');

const productoController = {
  getAllProductos: async (req, res) => {
    try {
      const all = req.query.all === 'true';
      const productos = await Producto.getAll(all);
      res.json(productos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener productos: ' + error.message, code: error.code });
    }
  },

  toggleActive: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await Producto.toggleActive(id);
      if(!producto) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al cambiar estado' });
    }
  },

  getProductoById: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await Producto.getById(id);
      if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  createProducto: async (req, res) => {
    try {
      // Si se usan imágenes subidas localmente vía multer (estarán en req.files)
      const data = { ...req.body };
      
      if (req.files) {
        if (req.files.imagen_1) data.imagen_1 = `/uploads/${req.files.imagen_1[0].filename}`;
        if (req.files.imagen_2) data.imagen_2 = `/uploads/${req.files.imagen_2[0].filename}`;
        if (req.files.imagen_3) data.imagen_3 = `/uploads/${req.files.imagen_3[0].filename}`;
      }
      if (data.imagen_url) {
        data.imagen_1 = data.imagen_url;
        delete data.imagen_url;
      }
      if (data.imagen_2_url) {
        data.imagen_2 = data.imagen_2_url;
        delete data.imagen_2_url;
      }
      if (data.imagen_3_url) {
        data.imagen_3 = data.imagen_3_url;
        delete data.imagen_3_url;
      }

      const nuevoProducto = await Producto.create(data);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  updateProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const data = { ...req.body };

      if (req.files) {
        if (req.files.imagen_1) data.imagen_1 = `/uploads/${req.files.imagen_1[0].filename}`;
        if (req.files.imagen_2) data.imagen_2 = `/uploads/${req.files.imagen_2[0].filename}`;
        if (req.files.imagen_3) data.imagen_3 = `/uploads/${req.files.imagen_3[0].filename}`;
      }
      if (data.imagen_url) {
        data.imagen_1 = data.imagen_url;
        delete data.imagen_url;
      }
      if (data.imagen_2_url) {
        data.imagen_2 = data.imagen_2_url;
        delete data.imagen_2_url;
      }
      if (data.imagen_3_url) {
        data.imagen_3 = data.imagen_3_url;
        delete data.imagen_3_url;
      }

      const productoActualizado = await Producto.update(id, data);
      if (!productoActualizado) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(productoActualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  deleteProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await Producto.delete(id);
      if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado o no pudo eliminarse' });
      res.json({ message: 'Producto eliminado con éxito', id: eliminado.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  },

  uploadExcel: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

      const xlsx = require('xlsx');
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      let importedCount = 0;
      for (const row of data) {
        // Cazar nombres de columnas (ignorando mayúsculas/minúsculas)
        const nombre = row['Nombre'] || row['nombre'];
        const precio = row['Precio'] || row['precio'];
        const stock = row['Stock'] || row['stock'];

        if (nombre && precio !== undefined) {
          // Valores por defecto para resto
          await Producto.create({
            nombre: nombre.toString(),
            descripcion: 'Producto importado desde Excel',
            precio: parseFloat(precio) || 0,
            stock: parseInt(stock) || 0,
            categoria: 'otros',
            sku: '',
            peso: 0,
            dimensiones: '',
            imagen_1: null,
            imagen_2: null,
            imagen_3: null
          });
          importedCount++;
        }
      }

      res.status(200).json({ success: true, importedCount });
    } catch (error) {
      console.error('Error procesando Excel:', error);
      res.status(500).json({ error: 'Error interno al procesar el archivo Excel' });
    }
  }
};

module.exports = productoController;
