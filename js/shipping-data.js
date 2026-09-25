/**
 * shipping-data.js
 * -----------------------------------------------------------------------
 * Datos de envío/contacto que se piden SIEMPRE antes de pagar, sea cual
 * sea el método de pago elegido (tarjeta, PayPal o Revolut).
 *
 * Se guardan en localStorage solo para que el comprador no tenga que
 * volver a escribirlos si recarga la página o vuelve más tarde — es una
 * comodidad, exactamente igual que el carrito (cart.js). Estos datos NO
 * se envían a ningún sitio hasta que el comprador pulsa un botón de pago;
 * en ese momento se incluyen en el pedido (ver payments.js) para que
 * sepas a quién y dónde enviar la camiseta.
 * -----------------------------------------------------------------------
 */

const SHIPPING_STORAGE_KEY = "GolazoStreet_datos_envio";

/** Campos obligatorios, en el orden en que se muestran en el formulario. */
const CAMPOS_ENVIO = [
  { clave: "nombre", etiqueta: "Nombre" },
  { clave: "apellidos", etiqueta: "Apellidos" },
  { clave: "email", etiqueta: "Email" },
  { clave: "telefono", etiqueta: "Teléfono" },
  { clave: "nacionalidad", etiqueta: "Nacionalidad" },
  { clave: "direccion", etiqueta: "Dirección" },
  { clave: "ciudad", etiqueta: "Ciudad" },
  { clave: "provincia", etiqueta: "Provincia" },
  { clave: "codigoPostal", etiqueta: "Código postal" },
];

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const DatosEnvio = {
  /** Lee los datos guardados (o un objeto vacío si no hay ninguno todavía). */
  obtener() {
    try {
      const datos = JSON.parse(localStorage.getItem(SHIPPING_STORAGE_KEY));
      return datos && typeof datos === "object" ? datos : {};
    } catch {
      return {};
    }
  },

  /** Guarda los datos (los sustituye por completo). */
  guardar(datos) {
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(datos));
  },

  /**
   * Comprueba que todos los campos obligatorios están rellenos y que el
   * email tiene una forma válida. Devuelve la CLAVE del primer campo que
   * falte o esté mal (para poder señalárselo al comprador), o null si
   * todo está correcto.
   */
  primerCampoInvalido(datos) {
    for (const campo of CAMPOS_ENVIO) {
      if (!String(datos[campo.clave] || "").trim()) return campo.clave;
    }
    if (!validarEmail(datos.email)) return "email";
    return null;
  },
};

/**
 * Exporta también para Node.js: la función serverless de
 * netlify/functions/crear-sesion-stripe.js vuelve a comprobar estos
 * mismos campos en el servidor (nunca hay que fiarse solo de una
 * validación hecha en el navegador del comprador).
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CAMPOS_ENVIO, DatosEnvio };
}
