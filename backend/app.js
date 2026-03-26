const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Inicializar Express
const app = express();
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
app.use('/api/contacto', contactoRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/sync', syncRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

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
