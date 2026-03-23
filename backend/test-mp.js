const { MercadoPagoConfig, Preference } = require('mercadopago');

const ACCESS_TOKEN = 'APP_USR-1820948726187185-031112-fa79402b7e04f39e0761f2412dca98c0-1266560690';
const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN, options: { timeout: 5000 } });

async function test() {
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }],
        back_urls: { success: 'http://localhost' },
        auto_return: 'approved'
      }
    });
    console.log(result.init_point);
  } catch (error) {
    console.error(error.message, error.cause);
  }
}
test();
