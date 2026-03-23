const db = require('./config/database');
async function test() {
    try {
        const { rows } = await db.query('SELECT * FROM productos');
        console.log("Success! Products:", rows);
    } catch(err) {
        console.error("DB Error:", err.message);
    }
    process.exit();
}
test();
