const { Client } = require('pg');
require('dotenv').config({ path: 'c:/Users/pablo/OneDrive/Escritorio/ecommerce/backend/.env' });
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
client.connect()
    .then(() => client.query('ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS email_admin VARCHAR(255);'))
    .then(() => { console.log("Added column email_admin"); client.end(); })
    .catch(console.error);
