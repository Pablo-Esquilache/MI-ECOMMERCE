# 🚀 Plan Maestro: De Local a Producción (Go-Live)

Este es el paso a paso exacto que debemos seguir para agarrar este código que corre en tu máquina y subirlo a internet para que funcione con dominio, pagos reales y notificaciones automáticas.

---

## 🔐 1. Generación de Credenciales Pendientes (Se puede hacer AHORA)

Antes de subir todo, necesitamos las llaves reales de los servicios de terceros:

### A. Correos Electrónicos (Brevo SMTP - Oficial)
Debido a bloqueos de seguridad en servidores de hosting gratuitos (Render), utilizamos **Brevo** como servicio profesional de envío de correos, ya que nunca falla y entrega más rápido.

**⚠️ CRÍTICO:** Cuando instales el sistema para un cliente real, seguí estos pasos:
1. Creale una cuenta gratuita en **Brevo** (o pedile que se la cree).
2. En Brevo, ve a la configuración de Perfil > **"Remitentes e IP"** y agrega/valida la cuenta de correo electrónico oficial del comercio (Ej. `ventas@tumarca.com`).
3. Ve al menú **SMTP y API** > Pestaña **SMTP**. Allí obtendrás las credenciales del servidor.
4. Estas credenciales las tenés que colocar en las **Variables de Entorno** del Servidor en Render:
   - `EMAIL_HOST`: `smtp-relay.brevo.com`
   - `EMAIL_PORT`: `2525` (Usamos el 2525 para evadir los bloqueos de Render al 587).
   - `EMAIL_USER`: El "Login" que te da Brevo (es un mail interno raro, ej: `a7384...@smtp-brevo.com`).
   - `EMAIL_PASS`: El "Master Password" largo que te genera Brevo.
   - `EMAIL_FROM`: El correo que validaste en el paso 2 (`ventas@tumarca.com`). **Es clave, pues es el remitente que verán los clientes.**
5. **Recepción de Avisos:** Para decirle al sistema *a qué correo* deben llegar las notificaciones de nuevas ventas, simplemente entraste al **Panel de Administrador de la página** > pestaña de **Configuración** y actualizá el "Email de Administrador".

### B. MercadoPago (Producción)
1. Ingresa el panel de Developers de MercadoPago.
2. Ve a tus Aplicaciones y elige la tienda.
3. Cambia a tus "Credenciales de Producción" (las que realmente cobran la tarjeta de crédito real).
4. Copia el `ACCESS_TOKEN` y tenlo guardado para ponerlo en el archivo `.env` del servidor final bajo `MP_ACCESS_TOKEN`.

---

## 🛠 2. Modificaciones en el Código (Se deben hacer ANTES de subir)

Hay rutas en nuestro código que dicen explícitamente `http://localhost:3000`. Esto hay que cambiarlo para que los botones apunten al dominio real.

**En el Frontend:**
- Modificaremos en `frontend/public/js/main.js` y `frontend/public/admin/js/admin.js`:
  - `const API_URL = 'http://localhost:3000/api';` pasará a ser una ruta dinámica (ej. `const API_URL = '/api';` ya que ambas partes conviven en el mismo host).

**En el Backend:**
- En `routes/admin.js` y `services/mercadopago.js`, cambiaremos `http://localhost:3000` por una variable de entorno `process.env.PUBLIC_URL` que llenaremos en el hosting con `https://tumarca.com`.

---

## 🌍 3. Hosting y Despliegue (El Salto a la Red)

Dado nuestro stack (Node.js, PostgresSQL y HTML/JS), el esquema es el siguiente:

### A. Base de Datos (PostgreSQL Remoto)
No podemos usar la base de datos de tu computadora enchufada localmente. 
- Crearemos una PostgreSQL en plataformas como **Render.com** o **Supabase** (tienen capas gratuitas o súper económicas).
- Nos darán unos datos nuevos de Host, Usuario y Contraseña de DB.
- Reemplazaremos los del archivo `.env` o usaremos directamente un `DATABASE_URL`.
- Ejecutaremos nuestro script `init_db.js` en la nube para crear las tablas ahí.

### B. Servidor Web (Node.js backend + frontend public)
- Subiremos (mediante GitHub) nuestra carpeta a un hosting de Node (ej. **Render** o **Railway**).
- El comando de inicio será el mismo que usamos hoy: `node app.js`.
- Es ahí donde cargaremos **todas las variables de entorno definitivas**:
  - `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`
  - `EMAIL_USER`, `EMAIL_PASS` (Tu nueva clave de Gmail)
  - `JWT_SECRET`
  - `MP_ACCESS_TOKEN` (El de producción de MercadoPago)
  - `PUBLIC_URL`

### C. Webhooks y Redirección de MercadoPago (A finalizar estando Online)
Una vez alojados en un servidor público (Render, etc), la ruta de webhooks de tu tienda será accesible desde internet. En esta etapa final deberemos:
1. **Configurar el Aviso de Pago Automático:** Pegar nuestro enlace de Webhook en el panel de MercadoPago (`https://tu-url.onrender.com/api/webhooks/mercadopago`). Esto permite que MP notifique a nuestro servidor.
2. **Variable Secreta:** Cuando configures MercadoPago Webhook, te dará una clave secreta larguísima. Esa clave debes añadirla a las Variables de Entorno de Render bajo el nombre **`MP_WEBHOOK_SECRET`**. Esto da seguridad total antibartolos.
3. **Arreglar la Redirección (Auto-Return):** El código ya está programado para enviar automáticamente a los clientes del portal de pago de retorno a tu dominio original sano y salvo una vez hayan pagado.

### D. Cierre de Fronteras API (CORS)
**Importante:** En cuanto tengamos asignado el Dominio Público Oficial (ej: `pablolibros.com`), deberemos entrar al archivo `backend/app.js` y bloquear la compuerta de la línea `app.use(cors())` indicando que únicamente acepte conexiones webs que vengan de ese dominio exacto de tu marca. Esto evitará que piratas informáticos conecten sus propias páginas a nuestra Base de Datos para robar inventario.

## 📋 4. Lo que tenés que pasarme a mí (Asistente)

Una vez que crees los servicios en Render, necesito que me envíes **exactamente estos 2 datos** que te dará la plataforma:

1. **De la Base de Datos (PostgreSQL en Render):**
   - Necesito la **External Database URL** (URL externa de la base de datos).
   - *¿Por qué la necesito?* La usaré temporalmente desde tu computadora local para conectarme a esa nueva base de datos vacía y ejecutar nuestro script `init_db.js`. Este script lo único que hace es "crear los moldes" o tablas (`productos`, `pedidos`, `usuarios`, etc.) en la nube, ya que la base de datos de Render nace totalmente en blanco. Una vez ejecutado este script, la base de datos quedará lista para recibir pedidos.

2. **Del Web Service (El Backend en Render):**
   - Necesito la **URL pública** que te asigne Render (por ejemplo: `https://mi-tienda-e3b2.onrender.com`).
   - *¿Por qué la necesito?* Para configurar MercadoPago correctamente, ajustando el webhook y el redireccionamiento para que funcione con tu dominio definitivo.

*(Nota: ¡No te olvides que todas las variables de entorno como tu clave de Gmail y tu token de MercadoPago las deberás pegar tú mismo en la solapa "Environment" de tu Web Service en Render!)*

---

## 🖼️ 5. Reemplazo de Imágenes y Recursos Visuales (Tu Marca)

Antes de salir al público (o poco después de subir la página), debés personalizar el e-commerce cambiando las fotos genéricas por las **fotos reales de tu marca y local**.

Todos estos cambios de código los tenés que hacer dentro del archivo `frontend/public/index.html` (y en tu base de datos para los productos):

1. **Logo de la Barra de Navegación (Navbar):**
   - Actualmente es un texto que dice `E-Shopper`. Está en la línea del `<div class="logo">`.
   - **Qué hacer:** Reemplazar el texto corto por tu nombre, o bien insertar una etiqueta `<img src="ruta-de-tu-logo.png" alt="Mi Marca">` para que aparezca el isotipo oficial del comercio.

2. **Carrusel de Imágenes Principales (Hero Section):**
   - Actualmente hay 3 fondos gigantes sacados de Unsplash (fotos de librerías/tecnología).
   - **Qué hacer:** Buscar el `id="inicio"` o `.carousel-bg`. Reemplazar las tres URLs que están dentro de los `style="background-image: url('...')"` por las URLs de fotos reales de tu local o productos estrella. *(Recomendado: Imágenes horizontales de excelente calidad, aprox. 1920x1080 píxeles).*

3. **Sección "Quiénes Somos":**
   - **Las 2 Fotos Principales:** Son los recuadros altos de 450px que acompañan la historia del comercio. Reemplazá las URLs de Unsplash en los div `<div class="about-img">`.
   - **La Tira de 5 Miniaturas (Galería Inferior):** Buscar el bloque `<div class="about-mini-gallery">`. Vas a ver 5 etiquetas `<img>`. Reemplazá el contenido del `src="..."` por 5 fotos hermosas de detalles de tu negocio (mostrador, café, útiles, fachada). *(Recomendado: Imágenes cuadradas o con el motivo bien centrado, ya que se mostrarán en 300px).*

4. **Productos del Catálogo:**
   - Actualmente insertamos una base de datos de 20 productos de librería con fotos descargadas temporalmente de internet (`reset_db.js`). 
   - **Qué hacer:** Esto no requiere programación. Desde tu propio programa facturador físico (Electron), simplemente seleccioná o agregá la URL real de la foto de cada producto y hacé clic en "Actualizar/Guardar" para que se sincronice y pise nuestra foto genética en la Nube.

---

## ✉️ 6. Mensaje de Prueba para el Cliente

*(Podés copiar, pegar y enviarle el siguiente mensaje directamente)*

¡Hola! Ya está subida la primera versión de prueba del e-commerce para que puedas navegar, ver cómo está quedando y hacer simulaciones de compra.

🌐 **Tu Tienda Online (La que verán tus clientes):**
Link: https://mi-ecommerce-63ue.onrender.com/

⚙️ **Tu Panel de Administración (Privado):**
Desde acá vas a ver los pedidos que entran, cambiar sus estados, etc.
Link: https://mi-ecommerce-63ue.onrender.com/admin/login.html
- Usuario: `patricia@gmail.com`
- Contraseña: `123456`

💳 **Datos para Mercado Pago (Compras de prueba):**
Para probar comprar sin gastar plata real, al momento de pagar elegí ingresar con cuenta de Mercado Pago y usá estos datos de prueba que generamos:
- **Usuario:** `TESTUSER8508561653096638027`
- **Contraseña:** `Ocj2wQuxW4`
- **Código de Verificación:** `785591`

Entrá, jugá bastante con la página, probá cambiar un pedido a "Enviado" desde el panel y cualquier duda me vas contando. ¡Que lo disfrutes!
