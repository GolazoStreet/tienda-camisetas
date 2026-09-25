# GolazoStreet — Tienda de camisetas de fútbol

Proyecto de tienda online de camisetas de fútbol, hecho con HTML, CSS y
JavaScript puro (sin frameworks), pensado para alojarse gratis en
**GitHub Pages**.

---

## 1. Estructura del proyecto

```
tienda-camisetas/
│
├── index.html              Página de inicio
├── productos.html          Catálogo completo (filtros + búsqueda)
├── producto.html           Ficha de producto (plantilla dinámica, ver punto 2)
├── carrito.html             Carrito de compra
├── contacto.html            Formulario de contacto
│
├── css/
│   └── style.css            Todos los estilos del sitio
│
├── js/
│   ├── config.js             ⚙️ Config. de la tienda (nombre, pagos, redes...)
│   ├── products-data.js      📦 Catálogo de productos (edítalo para tus camisetas)
│   ├── jersey-svg.js         Generador de ilustraciones de camiseta (placeholders)
│   ├── product-render.js     Genera las tarjetas de producto
│   ├── cart.js                Lógica del carrito (localStorage)
│   ├── shipping-data.js      Datos de envío obligatorios (nombre, dirección...)
│   ├── payments.js           Lógica de pago (tarjeta / PayPal.me / Revolut)
│   ├── app.js                  Menú móvil y utilidades comunes
│   ├── home.js                 Lógica específica de index.html
│   ├── products-page.js      Lógica específica de productos.html
│   ├── product-detail.js     Lógica específica de producto.html
│   ├── cart-page.js           Lógica específica de carrito.html
│   ├── contact.js              Lógica específica de contacto.html
│   └── order-confirmed.js     Lógica específica de pedido-confirmado.html
│
├── pedido-confirmado.html    Página a la que vuelve Stripe tras un pago con tarjeta
│
├── netlify/
│   └── functions/
│       └── crear-sesion-stripe.js   🔒 Única pieza de backend: crea el pago con tarjeta
├── netlify.toml               Configuración de Netlify (dónde está la web y las funciones)
│
├── pages/                    Páginas legales
│   ├── terminos.html
│   ├── devoluciones.html
│   └── cookies.html
│
├── assets/
│   ├── images/                Imágenes propias (og-cover, fotos reales, etc.)
│   └── icons/                  favicon-16.png, favicon-32.png, apple-touch-icon.png, icon-192.png
│
├── robots.txt
├── sitemap.xml
└── README.md                  Este archivo
```

## 2. Por qué no hay una página HTML por cada camiseta

El encargo original pedía una página como `/productos/real-madrid.html`
por camiseta. Se ha optado por **una sola plantilla dinámica**
(`producto.html`), que carga los datos según el `id` de la URL
(`producto.html?id=realmadrid-1a`). Es una decisión pensada
exactamente para lo que pediste en el punto 9 del encargo: que añadir
una camiseta nueva sea lo más simple posible. Con esta estructura,
añadir una camiseta es editar **un solo archivo** (`products-data.js`);
con páginas individuales tendrías que crear y mantener un archivo HTML
completo por cada camiseta.

## 3. Aviso importante sobre marcas registradas

Este catálogo usa actualmente **nombres reales de clubes y selecciones**
(Real Madrid, Bayern Múnich, PSG, Barcelona...) y, para muchos de ellos,
**fotografías reales** subidas a `assets/images/`. Antes de publicar la
tienda:

- Asegúrate de que tienes derecho a vender lo que muestras (licencia
  oficial, o bien diseños/réplicas que no infrinjan marcas registradas
  en tu país).
- Revisa el aviso sobre marcas en `pages/terminos.html`: aclara que los
  nombres, escudos y colores de clubes y competiciones se citan con
  fines descriptivos y que la tienda no tiene afiliación oficial con
  ellos. Ajusta ese texto si tu situación es distinta.
- Si un producto no tiene foto real, se muestra automáticamente una
  ilustración generada por código (`jersey-svg.js`) a partir de sus
  colores — ver punto 4 para cómo añadir fotos reales.

---

## 4. Cómo añadir, editar o eliminar una camiseta

Todo el catálogo vive en **`js/products-data.js`**. No necesitas tocar
ningún otro archivo.

### Apartado "Windbreaker"

Ya existe un apartado nuevo, `liga: "windbreaker"`, con 15 productos de
ejemplo (`windbreaker-01` a `windbreaker-15`). Aparece solo, junto a los
demás filtros, porque los filtros se generan automáticamente a partir
de `LIGAS` — no hay que tocar ni el menú ni `productos.html`.

Estos 15 llevan nombres genéricos por color ("Windbreaker Negro",
"Windbreaker Azul Marino"...) porque están pensados para tus fotos
reales. Para cada uno:

1. Cambia `equipo` y `nombre` por el nombre real de tu producto, y
   ajusta el `precio` si quieres.
2. Sube sus fotos a `assets/images/` como `windbreaker-01-1.jpg` (foto
   frontal) y `windbreaker-01-2.jpg` (foto trasera), y así con cada uno
   (ver "Añadir fotos reales" más abajo).

No llevan personalización (nombre/número) ni parche, porque esas
opciones solo aparecen para las ligas de fútbol (ver
`LIGAS_CON_PERSONALIZACION` / `LIGAS_CON_PARCHE_DE_LIGA` al final del
archivo) — es lo normal para un cortavientos, no hace falta que hagas
nada para desactivarlo.

### Añadir una camiseta nueva

1. Abre `js/products-data.js`.
2. Copia uno de los bloques `{ ... }` del array `PRODUCTOS`.
3. Pégalo dentro del array (antes del `];` final) y cambia sus valores:
   - `id`: identificador único, en minúsculas y con guiones (ej. `"mi-equipo-1a"`).
     **Importante:** no reutilices un `id` que ya exista en el catálogo — si dos
     productos comparten `id`, solo uno de los dos será accesible.
   - `equipo`, `nombre`, `precio`, `precioAnterior` (o `null` si no hay oferta).
   - `liga`: debe coincidir con uno de los `id` definidos en `LIGAS`, al
     principio del archivo.
   - `colorPrincipal` / `colorSecundario`: colores en hexadecimal, usados
     para la ilustración de repuesto si no subes fotos reales (ver abajo).
   - `tallas`: array con las tallas disponibles.
   - `descripcion`, `etiqueta` (`"nueva"`, `"oferta"`, `"mas-vendida"` o `null`)
     y `destacado` (`true` para que aparezca en la portada).
4. Guarda el archivo. No hace falta tocar nada más: aparecerá
   automáticamente en la portada, el catálogo, los filtros y su propia
   ficha de producto.

### Añadir fotos reales de una camiseta

No hace falta tocar ningún archivo `.js`. Solo sube dos fotos a
`assets/images/` con el mismo nombre que el `id` del producto, así:

```
assets/images/<id>-1.jpg   → foto frontal
assets/images/<id>-2.jpg   → foto trasera
```

Por ejemplo, para el producto con `id: "mi-equipo-1a"`, sube
`assets/images/mi-equipo-1a-1.jpg` y `assets/images/mi-equipo-1a-2.jpg`.
La web las detecta automáticamente. Si para algún producto no subes
estas fotos, se muestra en su lugar la ilustración generada por código
a partir de `colorPrincipal` / `colorSecundario`, sin que tengas que
hacer nada más.

### Eliminar una camiseta

Borra su bloque `{ ... }` completo del array `PRODUCTOS`. Si tenía fotos
reales propias en `assets/images/`, bórralas también para no dejar
archivos sueltos sin usar.

---

## 5. Pagos: qué es automático y qué no (leer antes de publicar)

**Antes de cualquier pago, se piden siempre los datos de envío**
(nombre, apellidos, email, teléfono, nacionalidad, dirección, ciudad,
provincia y código postal) en el propio carrito, sea cual sea el
método de pago elegido — ver `js/shipping-data.js`. Los tres botones de
pago están bloqueados hasta que esos campos están completos. Se guardan
en el navegador del comprador (localStorage) solo para que no tenga que
volver a escribirlos, y se incluyen en el pedido: por email en el caso
de PayPal y Revolut, y como metadata del pago en el caso de Stripe.

**GitHub Pages solo sirve archivos estáticos.** No hay servidor propio,
así que esta web nunca puede procesar un pago por sí misma ni guardar
datos de tarjetas: eso siempre lo hace PayPal o Revolut, fuera de esta
página. No hay ninguna integración falsa en este proyecto — te
explicamos exactamente qué hace cada botón.

### Botón "Pagar con PayPal" — funciona sin configuración de backend

Usa **enlaces de PayPal.me**. Solo necesitas:

1. Crear gratis tu enlace en [paypal.me](https://www.paypal.me).
2. Copiar tu nombre de usuario (la parte final de tu enlace, ej. si tu
   enlace es `paypal.me/MiTienda`, tu usuario es `MiTienda`).
3. Pegarlo en `js/config.js`, en `paypalUsuario`.

No necesitas ninguna clave, API ni backend. El comprador paga en una
página de PayPal, fuera de esta web.

**Limitación honesta:** el importe se genera en el navegador del
comprador y viaja en la URL. Alguien con conocimientos técnicos podría
editar esa URL antes de pagar. Para una tienda pequeña es un riesgo
bajo (ves el importe recibido antes de enviar el pedido), pero si tu
tienda crece, te interesará pasar a "PayPal Checkout" con verificación
en un backend propio (fuera del alcance de GitHub Pages).

### Botón "Pagar con Revolut" — requiere un paso manual

Revolut no ofrece, sin usar su API de pagos (que exige backend propio y
claves privadas), un enlace público donde tú controles el importe solo
con una URL, a diferencia de PayPal.me. Por eso este botón:

1. Envía el resumen del pedido a tu **formulario de contacto** (ver
   punto 6) — así el comprador no ve tu email ni tu teléfono.
2. Tú generas manualmente, desde la app de **Revolut Business**, un
   "enlace de pago" por el importe exacto del pedido.
3. Se lo envías por email al comprador.

Si en el futuro quieres que Revolut cobre automáticamente, necesitarás
la API de Revolut Merchant, que exige un backend propio (por ejemplo,
en un servicio como Render o Railway) y claves privadas — **esas
claves nunca deben ir en este código**, porque todo lo que subas a
GitHub es público.

### Botón "Pagar con tarjeta" (Stripe) — automático, con la única pieza de backend de la tienda

Este es el único método de pago que necesita algo más que archivos
estáticos, porque calcular el importe real sin fiarse del navegador del
comprador exige un servidor. Esa pieza es
`netlify/functions/crear-sesion-stripe.js`, una función pequeña que se
ejecuta en Netlify (no en el navegador de nadie) y hace lo siguiente:

1. Recibe del carrito qué productos, tallas, cantidades y extras
   (personalización/parche) ha elegido el comprador — **nunca el
   precio**.
2. Recalcula el precio real buscando cada producto en
   `products-data.js`, el mismo catálogo que usa el resto de la web.
   Así, aunque alguien manipulase la petición, el cobro real seguiría
   siendo el correcto.
3. Le pide a Stripe que cree una sesión de pago por ese importe ya
   verificado, y devuelve al navegador la URL de pago de Stripe.
4. El carrito redirige ahí al comprador. El número de tarjeta se
   escribe siempre en la página de Stripe, nunca en esta web.

**Configurarlo requiere dos cosas** (ver sección 13 más abajo, paso a
paso):

1. Publicar la tienda en **Netlify** en vez de (o además de) GitHub
   Pages, porque GitHub Pages solo sirve archivos, no puede ejecutar
   esta función.
2. Crear una cuenta de Stripe y guardar tu clave secreta como
   **variable de entorno** en el panel de Netlify — nunca escrita en
   ningún archivo de este proyecto.

Mientras no lo configures, el botón "Pagar con tarjeta" mostrará un
aviso al comprador y le sugerirá pagar con PayPal o Revolut en su
lugar, en vez de fallar en silencio.

### Resumiendo qué es viable con una web 100% estática

| Método | ¿Backend? | ¿Claves en el código? | Importe |
|---|---|---|---|
| PayPal.me | No | No | Dinámico (calculado por el carrito) |
| Revolut (manual) | No | No | Lo fijas tú manualmente por pedido |
| **Tarjeta (Stripe Checkout)** | **Sí, una función serverless en Netlify** | **Clave secreta solo en Netlify, nunca en el código** | **Dinámico y verificado en el servidor** |
| PayPal Checkout (Smart Buttons) | Sí, para verificar el importe | Client ID público (no secreto) | Dinámico y verificado |
| Revolut Merchant API | Sí | Claves privadas (en el backend, nunca en el HTML/JS) | Dinámico y verificado |

---

## 6. Formulario de contacto (sin backend propio)

El formulario usa [Formspree](https://formspree.io) (gratis hasta un
número de envíos al mes), que reenvía los mensajes a tu email de
negocio sin que tengas que montar un backend ni mostrar tu email en el
código HTML.

1. Crea una cuenta gratis en Formspree con tu email de negocio.
2. Crea un formulario y copia el endpoint (ej. `https://formspree.io/f/xxxxxxx`).
3. Pégalo en `js/config.js`, en `formEndpoint`.

Mientras no lo configures, el formulario avisará de que falta este
paso en vez de fallar en silencio.

---

## 7. Personalización rápida

Todo esto se cambia en **`js/config.js`**, sin tocar el resto del código:

- `nombreTienda` → nombre que aparece en el header y el footer de cada página.
  (El `<title>` de la pestaña del navegador y las etiquetas `<meta>` de cada
  página son texto fijo en cada archivo `.html`; si cambias el nombre de la
  tienda, edítalos también ahí si quieres que coincidan.)
- `eslogan` → frase corta del footer.
- `paypalUsuario` → tu usuario de PayPal.me.
- `emailContacto` → tu email de negocio (usa uno distinto al personal).
- `formEndpoint` → tu endpoint de Formspree.
- `redes.instagram` / `redes.tiktok` → enlaces a tus redes.
- `precioPersonalizacion` → coste extra por personalizar una camiseta con nombre y número.
- `precioParche` → coste extra por añadir el parche de liga o del Mundial.
- `envioUnaCamiseta` / `envioDosCamisetas` → gastos de envío para pedidos de 1 o 2 camisetas (3 o más, envío gratis).

**Logo e icono:** el redondel con la corona y las letras "GS" que aparece en el
header, el footer y la pestaña del navegador son archivos de imagen, no texto:
`assets/images/brand-icon.png` (header y footer) y `assets/icons/favicon-16.png`
/ `favicon-32.png` / `apple-touch-icon.png` / `icon-192.png` (pestaña del
navegador y accesos directos). Si cambias de logo, sustituye estos archivos
por versiones nuevas con el mismo nombre y tamaño (o ajusta las rutas en el
`<head>` de cada página si usas otro nombre de archivo).

Otros cambios:

- **Logo**: ahora mismo es texto + un círculo con un número (`.brand`,
  en cada HTML). Si tienes un logo en imagen, sustituye ese bloque por
  `<img src="assets/images/logo.png" alt="...">`.
- **Colores**: todos los colores están centralizados como variables al
  principio de `css/style.css` (bloque `:root`), en `--pitch-dark`,
  `--gold`, etc. Cambia esos valores y se actualiza toda la web.
- **Camisetas, precios, tallas**: ver punto 4.
- **Textos legales**: edita los archivos dentro de `pages/`.

---

## 8. Seguridad: qué protege esta web y qué no

Sé honesto contigo mismo sobre esto antes de publicar:

**Lo que sí está cubierto:**
- Todo el texto que se muestra en la web se "escapa" antes de
  insertarse en la página (función `escaparHTML` en `app.js`), para
  evitar ataques de tipo XSS a través de datos de la URL o del
  formulario.
- No hay contraseñas, claves ni credenciales en ningún archivo de este
  proyecto.
- El carrito (`localStorage`) solo guarda qué productos ha elegido el
  comprador en su propio navegador — nunca datos personales ni de pago.

**Lo que NO puede cubrir una web estática (y no se ha fingido que sí):**
- Verificar en un servidor que el importe pagado coincide exactamente
  con el pedido, **excepto en el pago con tarjeta (Stripe)**: esa es la
  única vía de pago de esta tienda que sí recalcula el importe en un
  servidor (ver punto 5), precisamente porque tiene esa pieza de
  backend. PayPal.me y Revolut manual siguen sin esa verificación.
- Autenticación de usuarios, cuentas o historial de pedidos persistente
  más allá del propio navegador.
- Cualquier lógica que dependa de mantener un secreto (claves de API,
  etc.) **en el código de la web**: por eso la clave secreta de Stripe
  vive solo en las variables de entorno de Netlify, nunca en un
  archivo de este proyecto.

Si en algún momento necesitas algo de la segunda lista, necesitarás un
backend (por ejemplo, una función serverless en Vercel/Netlify/Render).

---

## 9. Probar la web en tu ordenador (VS Code)

1. Instala [Visual Studio Code](https://code.visualstudio.com/) si no lo tienes.
2. Abre la carpeta `tienda-camisetas` en VS Code (`Archivo > Abrir carpeta...`).
3. Instala la extensión **Live Server** (búscala en el icono de
   extensiones, a la izquierda).
4. Haz clic derecho sobre `index.html` → **"Open with Live Server"**.
5. Se abrirá tu navegador con la web funcionando en algo como
   `http://127.0.0.1:5500`. Navega por todas las páginas, prueba a
   añadir camisetas al carrito, usa los filtros, etc.

Si no quieres instalar nada, también puedes simplemente abrir
`index.html` haciendo doble clic — funcionará, aunque algunos
navegadores restringen ciertas funciones al abrir archivos así en vez
de por un servidor local (por eso se recomienda Live Server).

---

## 10. Subir el proyecto a GitHub y activar GitHub Pages

1. Crea una cuenta en [github.com](https://github.com) si no tienes.
2. Pulsa el botón **"New"** (o el **+** de arriba a la derecha) para
   crear un repositorio nuevo. Ponle un nombre, por ejemplo
   `tienda-camisetas`, y márcalo como **público**.
3. En tu ordenador, dentro de la carpeta del proyecto, abre una
   terminal (en VS Code: `Terminal > Nueva terminal`) y ejecuta:
   ```
   git init
   git add .
   git commit -m "Primera versión de la tienda"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/tienda-camisetas.git
   git push -u origin main
   ```
   (Sustituye `TU_USUARIO` por tu usuario de GitHub. Si no tienes Git
   instalado, descárgalo desde [git-scm.com](https://git-scm.com/).)
4. En la página de tu repositorio en GitHub, ve a **Settings → Pages**
   (menú de la izquierda).
5. En "Build and deployment", en **Source**, elige **"Deploy from a
   branch"**.
6. En **Branch**, elige `main` y la carpeta `/ (root)`. Pulsa **Save**.
7. Espera uno o dos minutos y recarga la página: te aparecerá la URL
   pública, con este formato:
   ```
   https://TU_USUARIO.github.io/tienda-camisetas/
   ```
8. Ese es el enlace que puedes compartir en tus redes sociales.

**Antes de publicar el enlace**, actualiza `robots.txt` y
`sitemap.xml` con tu URL real (sustituye
`TU_USUARIO.github.io/TU_REPOSITORIO` por tu enlace real).

### Cómo subir cambios más adelante

Cada vez que edites algo (por ejemplo, añadas una camiseta nueva):

```
git add .
git commit -m "Añade nueva camiseta"
git push
```

GitHub Pages se actualiza solo, en uno o dos minutos.

---

## 11. Conectar un dominio propio (opcional)

Si más adelante compras un dominio (ej. en Namecheap, IONOS, etc.):

1. En tu proveedor de dominio, crea un registro **CNAME** que apunte
   `www` a `TU_USUARIO.github.io`.
2. Crea también los registros **A** de tu dominio raíz apuntando a las
   IPs de GitHub Pages (están documentadas en la [ayuda oficial de
   GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)).
3. En tu repositorio, ve a **Settings → Pages → Custom domain**, escribe
   tu dominio y guarda. GitHub creará un archivo `CNAME` en tu repo
   automáticamente.
4. Espera a que se propague el DNS (puede tardar desde minutos hasta
   24-48h) y activa "Enforce HTTPS" cuando esté disponible.

---

## 12. Checklist final antes de publicar

- [ ] He sustituido los productos de ejemplo por camisetas reales (o
      he verificado que tengo derecho a venderlas).
- [ ] He configurado `paypalUsuario` en `js/config.js`.
- [ ] He configurado `formEndpoint` (Formspree) en `js/config.js`.
- [ ] He puesto un `emailContacto` de negocio, no mi email personal.
- [ ] He revisado los textos legales en `pages/` (términos,
      devoluciones, cookies) y los he adaptado a mi caso si hace falta.
- [ ] He probado el flujo completo: añadir al carrito, cambiar
      cantidades, eliminar productos, y los tres botones de pago.
- [ ] He probado la web en el móvil (o reduciendo la ventana del
      navegador) para comprobar que el menú, el carrito y los filtros
      funcionan bien en pantallas pequeñas.
- [ ] He actualizado `robots.txt` y `sitemap.xml` con la URL real de
      mi tienda publicada.
- [ ] Si uso el pago con tarjeta, he seguido la sección 13 (publicar
      en Netlify + configurar Stripe) y he hecho una compra de prueba
      con una [tarjeta de prueba de Stripe](https://docs.stripe.com/testing).
- [ ] He comprobado que no hay ninguna clave privada ni credencial en
      ningún archivo (no debería haberla nunca, pero conviene
      revisarlo antes de hacer público el repositorio).

---

## 13. Pago con tarjeta: publicar en Netlify y configurar Stripe

Esta sección solo hace falta si quieres el botón "Pagar con tarjeta"
activo. Si te basta con PayPal y Revolut, puedes seguir publicando con
GitHub Pages (sección 10) y saltarte esto.

### 13.1. Crear tu cuenta de Stripe

1. Regístrate gratis en [stripe.com](https://stripe.com) con tu email
   de negocio y activa la verificación en dos pasos.
2. En el panel de Stripe, ve a **Developers → API keys**.
3. Verás dos claves: una **"Publishable key"** (pública, no la
   necesitas para este proyecto) y una **"Secret key"** (empieza por
   `sk_live_` o, en modo de pruebas, `sk_test_`). Copia la **secret
   key** — es la única que necesitas, y **nunca debe pegarse en
   ningún archivo del proyecto**, solo en Netlify (siguiente paso).
4. Mientras pruebas que todo funciona, usa la clave de **modo de
   pruebas** (`sk_test_...`) y paga con una
   [tarjeta de prueba de Stripe](https://docs.stripe.com/testing) (por
   ejemplo `4242 4242 4242 4242`, cualquier fecha futura y cualquier
   CVC). Cuando todo funcione, cambia a la clave `sk_live_...` para
   cobrar de verdad.

### 13.2. Publicar la tienda en Netlify (conectada a tu GitHub)

Netlify se conecta directamente a tu repositorio de GitHub y publica
la web sola cada vez que hagas `git push` — el mismo flujo de trabajo
que ya tienes, solo que Netlify sí puede ejecutar la función del pago.

1. Sube el proyecto a GitHub como ya haces (sección 10, pasos 1-3) si
   no lo has hecho todavía.
2. Crea una cuenta gratis en [netlify.com](https://netlify.com) (puedes
   entrar directamente con tu cuenta de GitHub) y activa ahí también
   la verificación en dos pasos.
3. Pulsa **"Add new site" → "Import an existing project"** y elige
   **GitHub**. Autoriza a Netlify a acceder a tu repositorio
   `tienda-camisetas`.
4. Netlify detectará solo la configuración gracias al archivo
   `netlify.toml` de este proyecto (carpeta a publicar y carpeta de
   funciones). No hace falta que cambies nada en ese paso — pulsa
   **"Deploy site"**.
5. Cuando termine, te dará una URL pública tipo
   `https://tu-tienda-1234.netlify.app` (puedes cambiar ese nombre en
   **Site configuration → General → Site details → Change site
   name**).

### 13.3. Añadir tu clave secreta de Stripe a Netlify

1. En el panel de tu site de Netlify, ve a **Site configuration →
   Environment variables**.
2. Pulsa **"Add a variable"**.
3. Clave (Key): `STRIPE_SECRET_KEY`
   Valor (Value): tu clave secreta de Stripe (la que copiaste en 13.1).
4. Guarda, y vuelve a desplegar el site (**Deploys → Trigger deploy →
   Deploy site**) para que la función la recoja.

### 13.4. Probar el pago con tarjeta

1. Abre tu tienda en la URL de Netlify, añade una camiseta al
   carrito y pulsa **"Pagar con tarjeta"**.
2. Deberías llegar a una página de pago de Stripe (el dominio de la
   URL será `checkout.stripe.com`). Paga con la tarjeta de prueba
   `4242 4242 4242 4242` si sigues en modo de pruebas.
3. Tras pagar, deberías volver a `pedido-confirmado.html` en tu
   propia web, y el pago aparecerá en el panel de Stripe, en
   **Payments**.
4. Cuando lo hayas probado, sustituye la clave `sk_test_...` en
   Netlify por tu clave `sk_live_...` de Stripe (mismo paso 13.3) para
   empezar a cobrar de verdad.

### 13.5. Conectar tu dominio propio (si tienes uno)

Si sigues la sección 11 con un dominio propio, apúntalo a Netlify en
vez de a GitHub Pages: en el panel de Netlify, **Domain management →
Add a domain**, y sigue las instrucciones que te dé para los DNS de tu
dominio.
