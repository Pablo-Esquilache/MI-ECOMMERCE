-- Base de datos ecommerce (Correr este script en pgAdmin o psql)

-- Eliminamos tablas si existen para poder recrearlas
DROP TABLE IF EXISTS "detalles_pedido";
DROP TABLE IF EXISTS "pedidos";
DROP TABLE IF EXISTS "productos";
DROP TABLE IF EXISTS "clientes";
DROP TABLE IF EXISTS "administradores";

-- Tabla de Administradores
CREATE TABLE "administradores" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "nombre" VARCHAR(100) NOT NULL,
  "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Clientes
CREATE TABLE "clientes" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "apellido" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150) UNIQUE NOT NULL,
  "telefono" VARCHAR(50) NOT NULL,
  "genero" VARCHAR(20),
  "direccion" VARCHAR(255) NOT NULL,
  "ciudad" VARCHAR(100) NOT NULL,
  "provincia" VARCHAR(100) NOT NULL,
  "codigo_postal" VARCHAR(20) NOT NULL,
  "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE "productos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(200) NOT NULL,
  "descripcion" TEXT NOT NULL,
  "precio" DECIMAL(10, 2) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "categoria" VARCHAR(100),
  "sku" VARCHAR(50) UNIQUE,
  "peso" DECIMAL(10, 2), -- en kg
  "dimensiones" VARCHAR(100), -- ej: "10x20x30 cm"
  "imagen_1" VARCHAR(255),
  "imagen_2" VARCHAR(255),
  "imagen_3" VARCHAR(255),
  "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Pedidos
CREATE TABLE "pedidos" (
  "id" SERIAL PRIMARY KEY,
  "cliente_id" INTEGER NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "costo_envio" DECIMAL(10, 2) NOT NULL,
  "total" DECIMAL(10, 2) NOT NULL,
  "estado" VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- pendiente, pagado, enviado, entregado
  "metodo_pago" VARCHAR(50) NOT NULL, -- mercadopago, transferencia
  "preferencia_mp_id" VARCHAR(255),
  "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT
);

-- Tabla de Detalles del Pedido
CREATE TABLE "detalles_pedido" (
  "id" SERIAL PRIMARY KEY,
  "pedido_id" INTEGER NOT NULL,
  "producto_id" INTEGER NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "precio_unitario" DECIMAL(10, 2) NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT
);

-- Administrador por defecto (password = admin123)
-- Hash de bcrypt para "admin123" generado en Node.js ($2b$10$w4rYqL7yP0N3vV/Lh1D6YOSm9Gj2j3u4P5S8UvP6QxZ4E5wD0oM9q)
INSERT INTO "administradores" ("email", "password", "nombre") 
VALUES ('admin@ecommerce.com', '$2b$10$w4rYqL7yP0N3vV/Lh1D6YOSm9Gj2j3u4P5S8UvP6QxZ4E5wD0oM9q', 'Administrador Principal');
