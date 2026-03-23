const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/configuracion (Público)
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM configuracion WHERE id = 1');
        if (rows.length === 0) {
            return res.json({});
        }
        res.json(rows[0]);
    } catch (e) {
        console.error('Error obteniendo configuracion:', e);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;
