const { MercadoPagoConfig, Preference } = require('mercadopago');

// Agregar las credenciales de MP. Como es un test, hardcodeamos u otenemos de env.
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-1820948726187185-031112-fa79402b7e04f39e0761f2412dca98c0-1266560690';
const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN, options: { timeout: 5000 } });

const mercadopagoService = {
  crearPreferencia: async (pedido, carrito, cliente) => {
    try {
      // 1. Armar los items para MP
      const items = carrito.map(item => ({
        id: item.id.toString(),
        title: item.nombre,
        quantity: parseInt(item.cantidad),
        unit_price: Number(item.precio),
        currency_id: 'ARS',
      }));

      // Si hay costo de envío, lo agregamos como un ítem más
      if (pedido.costo_envio > 0) {
        items.push({
          id: 'ENVIO',
          title: 'Costo de Envío',
          quantity: 1,
          unit_price: Number(pedido.costo_envio),
          currency_id: 'ARS',
        });
      }

      // 2. Definir las URLs de retorno y webhooks (Ajustar a la URL real final)
      // En entorno local (localhost), MP no podrá hacer POST al webhook a menos que uses ngrok
      const basePath = process.env.PUBLIC_URL || 'http://localhost:3000';

      const body = {
        items,
        payer: {
          name: cliente.nombre,
          surname: cliente.apellido,
          email: cliente.email,
        },
        backUrls: {
          success: `${basePath}/`,
          failure: `${basePath}/`,
          pending: `${basePath}/`,
        },
        autoReturn: 'approved',
        externalReference: pedido.id.toString(), // Para vincularlo con el pedido
        notificationUrl: `${basePath}/api/webhooks/mercadopago`, // Habilitar en produccion / ngrok / localtunnel
      };

      // 3. Crear preferencia
      const preference = new Preference(client);
      const result = await preference.create({ body });

      return result;

    } catch (error) {
      console.error('Error creando preferencia MercadoPago:', error);
      throw error;
    }
  }
};

module.exports = mercadopagoService;
