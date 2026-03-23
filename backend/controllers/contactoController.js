const emailService = require('../services/emailService');

const contactoController = {
    procesarContacto: async (req, res) => {
        try {
            const { nombre, email, asunto, mensaje } = req.body;
            
            // Validacion basica
            if (!nombre || !email || !mensaje) {
                return res.status(400).json({ error: 'Nombre, email y mensaje son campos requeridos.' });
            }

            // Llamar al servicio para enviar/simular correo
            await emailService.enviarCorreoContacto(nombre, email, asunto || 'Sin asunto', mensaje);

            res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
        } catch (error) {
            console.error('Error al procesar formulario de contacto:', error);
            res.status(500).json({ error: 'Ocurrió un error al enviar el mensaje de contacto.' });
        }
    }
};

module.exports = contactoController;
