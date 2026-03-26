const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// Middleware Global de Protección para todas las rutas de /api/sync
router.use(syncController.authSync);

// 1. Local crea/edita productos en la Nube
router.post('/upsert-product', syncController.upsertProduct);

// 2. Local avisa que vendió algo (para descontar stock web)
router.post('/update-stock', syncController.updateStockFromLocal);

// 3. Local pregunta si la Web vendió algo
router.get('/pending-sales', syncController.getPendingWebSales);

// 4. Local pregunta si la Web editó algún precio/stock manualmente
router.get('/pending-product-updates', syncController.getPendingProductUpdates);

// 5. Local avisa que ya procesó los datos y ordena marcarlos como sincronizados
router.post('/mark-synced', syncController.markSynced);

module.exports = router;
