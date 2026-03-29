# 🚀 Plan Maestro: De Local a Producción (Go-Live)

Este es el paso a paso exacto que debemos seguir para agarrar este código que corre en tu máquina y subirlo a internet para que funcione con dominio, pagos reales y notificaciones automáticas.

---

## 🔐 1. Generación de Credenciales Pendientes (Se puede hacer AHORA)

Antes de subir todo, necesitamos las llaves reales de los servicios de terceros:

### A. Correos Electrónicos (Gmail App Password)
Google no permite usar tu contraseña normal para sistemas automatizados. Debes generar una "Clave de Aplicación".
**⚠️ CRÍTICO:** Este paso lo debés hacer utilizando **la cuenta de Gmail real del cliente/dueño del comercio**, para que los correos salgan a su nombre y le lleguen allí las respuestas comerciales.
1. Inicia sesión en tu cuenta de Google (la del cliente).
2. Ve a **Gestionar tu cuenta de Google** > **Seguridad**.
3. Asegúrate de tener activada la **Verificación en 2 pasos** (es obligatorio).
4. Una vez activada, usa la barra deflectora de búsqueda arriba y busca **"Contraseñas de aplicación"**.
5. Crea una nueva llamándola "E-commerce" o "Tienda Online".
6. Te dará una clave de **16 letras sin espacios**.
7. Esa clave deberás pegarla en nuestro archivo `backend/.env` bajo la variable `EMAIL_PASS`, junto con la cuenta de correo oficial en `EMAIL_USER`.

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
1. **Configurar el Aviso de Pago Automático:** Pegar nuestro enlace de Webhook en el panel de MercadoPago. Esto permitirá que MP notifique a nuestro servidor, cambiando el estado del pedido automáticamente a "Pagado" y **disparando el mail de pago exitoso sin intervención humana**.
2. **Arreglar la Redirección (Auto-Return):** Haremos la corrección técnica final de sintaxis en el código de MercadoPago para que, cuando el cliente termine de pasar su tarjeta, sea devuelto fluidamente y de manera automática a la página principal de tu e-commerce.

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
