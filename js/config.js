/**
 * config.js
 * -----------------------------------------------------------------------
 * CONFIGURACIÓN DE LA TIENDA — edita solo este archivo para personalizar
 * el nombre, los datos de contacto, las redes sociales y los pagos.
 * No hace falta tocar ningún otro archivo .js para estos cambios.
 *
 * Ninguno de estos valores es una clave secreta: son datos públicos
 * que cualquier visitante vería igualmente en tu tienda. Por eso es
 * seguro tenerlos aquí, en un archivo que se sube a GitHub.
 * -----------------------------------------------------------------------
 */

const CONFIG = {
  // Nombre de la tienda, tal y como aparece en el header, el footer y el título.
  nombreTienda: "GolazoStreet",

  // Eslogan corto que aparece en el footer.
  eslogan: "Camisetas de fútbol para quien vive cada partido.",

  // Tu usuario de PayPal.me (sin la URL completa). Créalo gratis en paypal.me
  // Ejemplo: si tu enlace es paypal.me/MiTienda, pon aquí "MiTienda".
  paypalUsuario: "Javier026",

  // Email de NEGOCIO (no tu email personal) al que llegan los mensajes de contacto.
  emailContacto: "golazostreetshop@gmail.com",

  // Endpoint de Formspree (o similar) para el formulario de contacto.
  // Ver README.md, sección "Formulario de contacto sin backend".
  formEndpoint: "https://formspree.io/f/xoeqknjq",

  // Dirección de la función serverless que crea la sesión de pago con
  // tarjeta (Stripe). Con Netlify, esta ruta relativa ya funciona sola,
  // no hace falta tocarla. Ver README.md, sección "Pago con tarjeta (Stripe)".
  stripeCheckoutEndpoint: "/.netlify/functions/crear-sesion-stripe",

  // Enlaces a tus redes sociales. Deja "#" en las que no uses.
  redes: {
    instagram: "https://www.instagram.com/golazostreet",
    tiktok: "https://www.tiktok.com/@golazostreetshop",
  },

  // Coste extra por personalizar una camiseta con nombre y número (en euros).
  precioPersonalizacion: 3,

  // Coste extra por añadir un parche (de liga o del Mundial) a una camiseta (en euros).
  precioParche: 1,

  // Gastos de envío según el número de camisetas del pedido (en euros).
  // 1 camiseta = envioUnaCamiseta · 2 camisetas = envioDosCamisetas · 3 o más = gratis.
  envioUnaCamiseta: 3,
  envioDosCamisetas: 2,
};

/**
 * Exporta la config también para Node.js: la función serverless de
 * netlify/functions/crear-sesion-stripe.js necesita precioPersonalizacion,
 * precioParche y los gastos de envío para calcular el total real del
 * pedido. En el navegador, "module" no existe, así que esto no cambia
 * nada de cómo se usa CONFIG en el resto de la web.
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
