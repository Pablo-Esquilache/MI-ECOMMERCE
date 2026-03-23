const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// Validar el retorno de MP en localhost (el cliente vuelve de pagar a nuestra tienda)
router.get('/mercadopago/return', async (req, res) => {
    try {
        const status = req.query.status;
        const externalRef = req.query.external_reference; // Es el Pedido ID que se mandó en preferences
        
        if (status === 'success' && externalRef) {
            await Pedido.updateStatus(externalRef, 'pagado');
            
            const pedidoDetails = await Pedido.getById(externalRef);
            if (pedidoDetails && pedidoDetails.email) {
                const emailService = require('../services/emailService');
                emailService.enviarCorreoPago(pedidoDetails.email, pedidoDetails).catch(e => console.error('Error email webhook return:', e));
            }
            
            return res.json({ success: true, message: 'Orden actualizada a pagado con éxito' });
        }
        
        res.json({ success: false, message: 'Estado ignorado' });
    } catch (error) {
        console.error("Error procesando retorno de Mercado Pago:", error);
        res.status(500).json({ error: 'Error interno del servidor actualizando estado' });
    }
});

// Endpoint Oficial de Webhooks (POST) - Para que MP lo llame Server-to-Server en Prod/Ngrok
router.post('/mercadopago', async (req, res) => {
    try {
        // Responder siempre con 200 OK inmediatamente para que MP no reintente
        res.status(200).send('Webhook recibido');

        const queryType = req.query.type || req.query.topic;
        const bodyType = req.body.type || req.body.action;

        const topic = queryType || bodyType;
        const dataId = req.query['data.id'] || (req.body.data && req.body.data.id);

        if (topic === 'payment' && dataId) {
            console.log(`Verificando pago ID: ${dataId} en Mercado Pago...`);
            const axios = require('axios');

            try {
                // Hacer el request para ver el pago. Reemplazar ACCESS_TOKEN desde env/service
                const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-1820948726187185-031112-fa79402b7e04f39e0761f2412dca98c0-1266560690';
                const response = await axios.get(`https://api.mercadopago.com/v1/payments/${dataId}`, {
                    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
                });

                const paymentInfo = response.data;
                console.log(`Status de Mercado Pago: ${paymentInfo.status} para la referencia ${paymentInfo.external_reference}`);

                if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
                    await Pedido.updateStatus(paymentInfo.external_reference, 'pagado');
                    console.log(`Orden ${paymentInfo.external_reference} ha sido marcada como PAGADO en base de datos.`);
                    
                    const pedidoDetails = await Pedido.getById(paymentInfo.external_reference);
                    if (pedidoDetails && pedidoDetails.email) {
                        const emailService = require('../services/emailService');
                        emailService.enviarCorreoPago(pedidoDetails.email, pedidoDetails).catch(e => console.error('Error email webhook POST:', e));
                    }
                }
            } catch(apiError) {
               console.error('Error al chequear status en la API de Mercado Pago:', apiError.message);
            }
        } else {
             console.log("Notificación MP ignorada o no es un pago. Type:", topic, "Data ID:", dataId);
        }

    } catch (error) {
        console.error("Error en el receptor POST de Webhooks MP:", error);
    }
});

module.exports = router;
