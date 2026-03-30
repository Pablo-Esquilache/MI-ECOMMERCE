const db = require('./config/database');

async function doHack() {
    try {
        const columns = [
            "imagen_1 VARCHAR(255)",
            "imagen_2 VARCHAR(255)",
            "imagen_3 VARCHAR(255)",
            "imagen_url VARCHAR(255)",
            "imagen_2_url VARCHAR(255)",
            "imagen_3_url VARCHAR(255)",
            "peso NUMERIC(10,2)",
            "dimensiones VARCHAR(255)",
            "sincronizado_local BOOLEAN DEFAULT TRUE"
        ];
        
        for (let c of columns) {
            try { await db.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS ${c}`); } 
            catch(err) { console.error('Skip', c); }
        }

        const colsPedido = [
            "metodo_pago VARCHAR(50)", 
            "referencia_pago VARCHAR(255)", 
            "sincronizado_local BOOLEAN DEFAULT FALSE"
        ];
        for (let c of colsPedido) {
            try { await db.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ${c}`); } 
            catch(err) { console.error('Skip', c); }
        }

        console.log('Se inyectaron todas las columnas aditivas.');
        require('./reset_db.js');

    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
doHack();
