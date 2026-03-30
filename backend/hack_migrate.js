const db = require('./config/database');
async function doMigrations() {
    try {
        await db.query(`ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS sync_activo BOOLEAN DEFAULT FALSE;`);
        await db.query(`ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS sync_api_key VARCHAR(255) DEFAULT '';`);
        await db.query(`ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS email_admin VARCHAR(255);`);
        await db.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS sincronizado_local BOOLEAN DEFAULT FALSE;`);
        await db.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS sincronizado_local BOOLEAN DEFAULT TRUE;`);
        await db.query(`ALTER TABLE administradores ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10);`);
        console.log('Migraciones de columnas aplicadas a la nube.');
        require('./reset_db.js');
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
doMigrations();
