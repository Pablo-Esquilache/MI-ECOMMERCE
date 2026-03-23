const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productoController = require('../controllers/productoController');
// const authMiddleware = require('../middlewares/authMiddleware'); // Se agergará al config luego

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const uploadImages = upload.fields([
  { name: 'imagen_1', maxCount: 1 },
  { name: 'imagen_2', maxCount: 1 },
  { name: 'imagen_3', maxCount: 1 }
]);

// Rutas Públicas (Cualquiera puede ver productos)
router.get('/', productoController.getAllProductos);
router.get('/:id', productoController.getProductoById);

// Rutas Privadas (Admin) - Por ahora sin middleware para testear
router.post('/upload', upload.single('file'), productoController.uploadExcel);
router.post('/', uploadImages, productoController.createProducto);
router.put('/:id', uploadImages, productoController.updateProducto);
router.patch('/:id/toggle', productoController.toggleActive);
router.delete('/:id', productoController.deleteProducto);

module.exports = router;
