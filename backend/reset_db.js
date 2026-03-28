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
            { nombre: 'Lápiz HB Faber-Castell', precio: 500, cat: 'escritura' },
            { nombre: 'Lapicera Bic Azul', precio: 300, cat: 'escritura' },
            { nombre: 'Lapicera Bic Negra', precio: 300, cat: 'escritura' },
            { nombre: 'Lapicera Bic Roja', precio: 300, cat: 'escritura' },
            { nombre: 'Goma de borrar Blanca', precio: 200, cat: 'escolar' },
            { nombre: 'Goma de borrar Tinta/Lápiz', precio: 250, cat: 'escolar' },
            { nombre: 'Cuaderno Universitario Rayado 84h', precio: 4500, cat: 'cuadernos' },
            { nombre: 'Cuaderno Universitario Cuadriculado 84h', precio: 4500, cat: 'cuadernos' },
            { nombre: 'Cuaderno Tapa Dura Araña 50h', precio: 2800, cat: 'cuadernos' },
            { nombre: 'Resma A4 Autor 500 hojas', precio: 8000, cat: 'papeleria' },
            { nombre: 'Resma Oficio Autor 500 hojas', precio: 9500, cat: 'papeleria' },
            { nombre: 'Corrector Líquido Liquid Paper', precio: 1200, cat: 'escritura' },
            { nombre: 'Resaltador Stabilo Boss Amarillo', precio: 1800, cat: 'escritura' },
            { nombre: 'Resaltador Stabilo Boss Verde', precio: 1800, cat: 'escritura' },
            { nombre: 'Carpeta N3 con cordón', precio: 1500, cat: 'escolar' },
            { nombre: 'Repuesto Hojas N3 Rayado 480h', precio: 12000, cat: 'papeleria' },
            { nombre: 'Sacapuntas metálico', precio: 600, cat: 'escolar' },
            { nombre: 'Regla 20cm acrílico', precio: 400, cat: 'escolar' },
            { nombre: 'Voligoma 30g', precio: 800, cat: 'escolar' },
            { nombre: 'Cinta adhesiva transparente', precio: 500, cat: 'papeleria' }
        ];

        let inserts = 0;
        for (let p of productosLibreria) {
            await db.query(`
                INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_1, sincronizado_local)
                VALUES ($1, $2, $3, 10, $4, 'https://via.placeholder.com/250', TRUE)
            `, [p.nombre, 'Producto de librería de excelente calidad.', p.precio, p.cat]);
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
