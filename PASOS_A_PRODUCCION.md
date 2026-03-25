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

---

### ¿Cuál es la ruta actual del plan?
Si te das el visto bueno a este diagrama, los próximos pasos que ejecutaré por ti serán:
1. Yo me encargaré automáticamente del **Punto 2** (Modificar las URLs del código para que se adapten a la nube sin romperse).
2. Luego frenaré la marcha para darte tiempo a que generes tu clave de Gmail y la pruebes.
3. Luego, elegimos plataforma y subimos la base de datos PostgreSQL.
