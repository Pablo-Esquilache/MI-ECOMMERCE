const db = require('./config/database');

const query = `
ALTER TABLE administradores 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP DEFAULT NULL;
`;

db.query(query)
    .then(() => {
        console.log('Tabla administradores actualizada exitosamente.');
        process.exit(0);
    })
    .catch(e => {
        console.error('Error alterando bd:', e);
        process.exit(1);
    });
