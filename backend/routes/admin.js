const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Validar login y devolver JWT
router.post('/login', adminController.login);

// Rutas de contraseña (públicas)
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);

// Rutas protegidas (Requieren enviar token Bearer)
router.get('/dashboard', authMiddleware, adminController.getDashboard);
router.get('/clientes', authMiddleware, adminController.getAllClientes);
router.get('/clientes/excel', authMiddleware, adminController.exportClientesExcel);
router.put('/configuracion', authMiddleware, adminController.updateConfiguracion);
router.post('/change-password', authMiddleware, adminController.changePassword);

module.exports = router;
