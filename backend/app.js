const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Inicializar Express
const app = express();
app.set('trust proxy', 1); // Configuración vital para rate-limit en Render
const PORT = process.env.PORT || 3000;

// Importar rutas
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const adminRoutes = require('./routes/admin');
const enviosRoutes = require('./routes/envios');
const webhooksRoutes = require('./routes/webhooks');
const contactoRoutes = require('./routes/contacto');
const configuracionRoutes = require('./routes/configuracion');
const syncRoutes = require('./routes/sync');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend público y admin
app.use(express.static(path.join(__dirname, '../frontend/public')));
// Configurar subida de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ----------------------
// Montar Rutas API REST
// ----------------------
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/envios', enviosRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/sync', syncRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// --- AUTO-MIGRACIÓN DE BASE DE DATOS (Ajustes de Transferencia Bancaria) ---
const db = require('./config/database');
db.query(`
    ALTER TABLE configuracion 
    ADD COLUMN IF NOT EXISTS banco_nombre VARCHAR(100),
    ADD COLUMN IF NOT EXISTS banco_titular VARCHAR(150),
    ADD COLUMN IF NOT EXISTS banco_cuit VARCHAR(50),
    ADD COLUMN IF NOT EXISTS banco_cbu VARCHAR(100),
    ADD COLUMN IF NOT EXISTS banco_alias VARCHAR(100);
`).then(() => console.log("Migración de DB OK (Transferencias)"))
  .catch(e => console.error("Aviso: Error migrando DB:", e.message));

// --- DIAGNÓSTICO EMAIL (RENDER BUG ESCÁNER) ---
app.get('/api/diagnostico-email', async (req, res) => {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER || '', pass: process.env.EMAIL_PASS || '' }
    });
    try {
        await transporter.verify();
        res.json({ success: true, mensaje: "✅ Conexión exitosa a Gmail.", usuario: process.env.EMAIL_USER });
    } catch (error) {
        res.json({ success: false, error_mensaje: error.message, error_completo: error, usuario_intentado: process.env.EMAIL_USER });
    }
});

// Ruta fallback pura para SPA en el admin o el frontend principal
app.use((req, res) => {
  if (req.originalUrl.startsWith('/admin')) {
    // Si estuviéramos usando una SPA de admin, aquí recaería
    res.sendFile(path.join(__dirname, '../frontend/public/admin/index.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
  }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
