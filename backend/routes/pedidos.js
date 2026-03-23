const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Crear un pedido (Checkout - Público)
router.post('/checkout', pedidoController.createCheckout);

// Rutas Privadas (Admin)
router.get('/', pedidoController.getAllPedidos);
router.get('/:id', pedidoController.getPedidoById);
router.put('/:id/estado', pedidoController.updatePedidoStatus);

module.exports = router;
