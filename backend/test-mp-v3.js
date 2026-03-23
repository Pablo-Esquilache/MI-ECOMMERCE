const { MercadoPagoConfig, Preference } = require('mercadopago');
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-1820948726187185-031112-fa79402b7e04f39e0761f2412dca98c0-1266560690' });
const preference = new Preference(client);

async function run() {
  console.log("Testing snake_case root back_urls...");
  try {
    const res = await preference.create({
      body: {
        items: [{ id: "1", title: "Test", quantity: 1, unit_price: 100 }],
        back_urls: { success: "http://localhost:3000/" },
        auto_return: "approved"
      }
    });
    console.log("Success with back_urls:", res.id);
  } catch(e) { console.error("Error back_urls:", e.message); }

  console.log("\nTesting SDK camelCase nested URLs...");
  try {
    const res2 = await preference.create({
      body: {
        items: [{ id: "1", title: "Test", quantity: 1, unit_price: 100 }],
        backUrls: { success: "http://localhost:3000/", failure: "http://localhost:3000/", pending: "http://localhost:3000/" },
        autoReturn: "approved"
      }
    });
    console.log("Success with full backUrls:", res2.id);
  } catch(e) { console.error("Error full backUrls:", e.message); }
}
run();
