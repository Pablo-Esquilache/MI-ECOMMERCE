const db = require('./config/database');

async function resetDB() {
    try {
        console.log('--- Iniciando Reset de Base de Datos ---');
        
        // 1. Limpiar Tablas de Ventas, Clientes y Productos (reiniciando IDs a 1)
        console.log('1. Vaciando tablas y reseteando IDs...');
        await db.query('TRUNCATE TABLE detalles_pedido, pedidos, clientes, productos RESTART IDENTITY CASCADE');
        console.log('Tablas vaciadas correctamente.');

        // 2. Insertar 20 productos de librería
        console.log('2. Insertando 20 productos de librería...');
        
        const productosLibreria = [
            { nombre: 'Lápiz HB Faber-Castell', precio: 500, cat: 'escritura', img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80' },
            { nombre: 'Lapicera Bic Azul', precio: 300, cat: 'escritura', img: 'https://images.unsplash.com/photo-1583485088034-697b5a626500?w=400&q=80' },
            { nombre: 'Lapicera Bic Negra', precio: 300, cat: 'escritura', img: 'https://images.unsplash.com/photo-1583485088034-697b5a626500?w=400&q=80' },
            { nombre: 'Lapicera Bic Roja', precio: 300, cat: 'escritura', img: 'https://images.unsplash.com/photo-1583485088034-697b5a626500?w=400&q=80' },
            { nombre: 'Goma de borrar Blanca', precio: 200, cat: 'escolar', img: 'https://images.unsplash.com/photo-1601004128532-613b5220c3a2?w=400&q=80' },
            { nombre: 'Goma de borrar Tinta/Lápiz', precio: 250, cat: 'escolar', img: 'https://images.unsplash.com/photo-1601004128532-613b5220c3a2?w=400&q=80' },
            { nombre: 'Cuaderno Universitario Rayado 84h', precio: 4500, cat: 'cuadernos', img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80' },
            { nombre: 'Cuaderno Universitario Cuadriculado 84h', precio: 4500, cat: 'cuadernos', img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80' },
            { nombre: 'Cuaderno Tapa Dura Araña 50h', precio: 2800, cat: 'cuadernos', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' },
            { nombre: 'Resma A4 Autor 500 hojas', precio: 8000, cat: 'papeleria', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' },
            { nombre: 'Resma Oficio Autor 500 hojas', precio: 9500, cat: 'papeleria', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' },
            { nombre: 'Corrector Líquido Liquid Paper', precio: 1200, cat: 'escritura', img: 'https://images.unsplash.com/photo-1598348341635-33a3f44cbedc?w=400&q=80' },
            { nombre: 'Resaltador Stabilo Boss Amarillo', precio: 1800, cat: 'escritura', img: 'https://images.unsplash.com/photo-1569414995777-62f92477de7d?w=400&q=80' },
            { nombre: 'Resaltador Stabilo Boss Verde', precio: 1800, cat: 'escritura', img: 'https://images.unsplash.com/photo-1569414995777-62f92477de7d?w=400&q=80' },
            { nombre: 'Carpeta N3 con cordón', precio: 1500, cat: 'escolar', img: 'https://images.unsplash.com/photo-1627845341257-25e40e2db59d?w=400&q=80' },
            { nombre: 'Repuesto Hojas N3 Rayado 480h', precio: 12000, cat: 'papeleria', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' },
            { nombre: 'Sacapuntas metálico', precio: 600, cat: 'escolar', img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80' },
            { nombre: 'Regla 20cm acrílico', precio: 400, cat: 'escolar', img: 'https://images.unsplash.com/photo-1600713919420-7f287e029fd5?w=400&q=80' },
            { nombre: 'Voligoma 30g', precio: 800, cat: 'escolar', img: 'https://images.unsplash.com/photo-1632731858178-ff3520dddf03?w=400&q=80' },
            { nombre: 'Cinta adhesiva transparente', precio: 500, cat: 'papeleria', img: 'https://images.unsplash.com/photo-1600122244246-8806283fc35a?w=400&q=80' }
        ];

        let inserts = 0;
        for (let p of productosLibreria) {
            await db.query(`
                INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_1, sincronizado_local)
                VALUES ($1, $2, $3, 10, $4, $5, TRUE)
            `, [p.nombre, 'Producto de librería de excelente calidad.', p.precio, p.cat, p.img]);
            inserts++;
        }

        console.log(`¡Exito! Se insertaron ${inserts} productos.`);
        console.log('--- Proceso Finalizado ---');
    } catch (e) {
        console.error('Error durante el reseteo:', e);
    } finally {
        process.exit();
    }
}

resetDB();
