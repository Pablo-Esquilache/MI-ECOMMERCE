const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // o el servicio preferido
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

// Comprobar si las credenciales son reales. Si no, usamos el fallback.
let useRealEmail = false;

transporter.verify(function (error, success) {
    if (error) {
        console.log('⚠️ [EmailService] Credenciales de correo no válidas o no encontradas. Activando modo simulación (fallback por consola).');
        useRealEmail = false;
    } else {
        console.log('✅ [EmailService] Servidor de correo listo para enviar mensajes reales.');
        useRealEmail = true;
    }
});

const simularEnvio = (opciones) => {
    console.log('\n--- 📧 SIMULACIÓN DE ENVÍO DE CORREO ---');
    console.log(`De: ${opciones.from || 'Sistema'}`);
    console.log(`Para: ${opciones.to}`);
    console.log(`Asunto: ${opciones.subject}`);
    console.log(`Contenido:\n${opciones.text || opciones.html}`);
    console.log('----------------------------------------\n');
};

const emailService = {
    enviarCorreoContacto: async (nombre, email, asunto, mensaje) => {
        const mailOptions = {
            from: process.env.EMAIL_USER || '"Tienda Online" <noreply@tienda.com>',
            to: process.env.EMAIL_CONTACTO || process.env.EMAIL_USER || 'admin@tienda.com',
            subject: `Nuevo mensaje de contacto: ${asunto}`,
            text: `Has recibido un nuevo mensaje de contacto.\n\nNombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`
        };

        if (useRealEmail) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo de contacto enviado exitosamente de ${email}.`);
            } catch (error) {
                console.error('Error al enviar correo de contacto (real):', error);
                simularEnvio(mailOptions);
            }
        } else {
            simularEnvio(mailOptions);
        }
    },

    enviarCorreoPago: async (clienteMail, detallesPedido) => {
        const mailOptions = {
            from: process.env.EMAIL_USER || '"Tienda Online" <noreply@tienda.com>',
            to: clienteMail,
            subject: `¡Pago confirmado! Pedido #${detallesPedido.id}`,
            html: `<h1>¡Gracias por tu compra!</h1>
                   <p>Hemos recibido el pago de tu pedido #${detallesPedido.id}.</p>
                   <p>Total pagado: $${detallesPedido.total}</p>
                   <p>Pronto comenzaremos a prepararlo para su envío. Te notificaremos cuando esté en camino.</p>`
        };

        if (useRealEmail) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo de pago confirmado enviado a ${clienteMail}.`);
            } catch (error) {
                console.error('Error al enviar correo de pago (real):', error);
                simularEnvio(mailOptions);
            }
        } else {
            simularEnvio(mailOptions);
        }
    },

    enviarCorreoEnvio: async (clienteMail, detallesPedido) => {
        const mailOptions = {
            from: process.env.EMAIL_USER || '"Tienda Online" <noreply@tienda.com>',
            to: clienteMail,
            subject: `Tu pedido #${detallesPedido.id} está en camino 🚚`,
            html: `<h1>¡Tu pedido ha sido despachado!</h1>
                   <p>El pedido #${detallesPedido.id} ya se encuentra en camino hacia tu domicilio o sucursal seleccionada.</p>
                   <p>¡Esperamos que lo disfrutes!</p>`
        };

        if (useRealEmail) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo de orden enviada notificado a ${clienteMail}.`);
            } catch (error) {
                console.error('Error al enviar correo de despacho (real):', error);
                simularEnvio(mailOptions);
            }
        } else {
            simularEnvio(mailOptions);
        }
    },

    enviarCorreoHtml: async (toEmail, subject, htmlContent) => {
        const mailOptions = {
            from: process.env.EMAIL_USER || '"Tienda Online" <noreply@tienda.com>',
            to: toEmail,
            subject: subject,
            html: htmlContent
        };

        if (useRealEmail) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo HTML enviado exitosamente a ${toEmail}.`);
            } catch (error) {
                console.error('Error al enviar correo HTML (real):', error);
                simularEnvio(mailOptions);
            }
        } else {
            simularEnvio(mailOptions);
        }
    }
};

module.exports = emailService;
