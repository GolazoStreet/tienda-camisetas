/**
 * discounts.js
 * -----------------------------------------------------------------------
 * Descuento por cantidad (ver CONFIG.descuentosPorCantidad en config.js).
 *
 * Esta lógica la usan DOS sitios, y por eso vive en un archivo aparte:
 *  - el carrito (js/cart-page.js), para enseñar el descuento al cliente;
 *  - la función de Stripe (netlify/functions/crear-sesion-stripe.js), que
 *    lo vuelve a calcular en el servidor. Nunca hay que fiarse del importe
 *    que mande el navegador del comprador.
 * -----------------------------------------------------------------------
 */

/** Tramos de descuento ordenados de menor a mayor número de unidades. */
function tramosDescuento() {
  const cfg = typeof CONFIG !== "undefined" ? CONFIG : require("./config.js");
  return (cfg.descuentosPorCantidad || [])
    .filter((t) => t && t.unidades > 0 && t.descuento > 0)
    .slice()
    .sort((a, b) => a.unidades - b.unidades);
}

/**
 * Euros que se rebajan por llevar `unidades` artículos. Se aplica el tramo
 * más alto alcanzado. Si se pasa `subtotal`, el descuento nunca supera ese
 * importe (para no dejar un total negativo).
 */
function calcularDescuentoPorCantidad(unidades, subtotal) {
  let descuento = 0;
  tramosDescuento().forEach((t) => {
    if (unidades >= t.unidades) descuento = t.descuento;
  });
  if (typeof subtotal === "number") descuento = Math.min(descuento, subtotal);
  return Math.round(descuento * 100) / 100;
}

/**
 * Siguiente tramo que el cliente todavía no ha alcanzado, o null si ya está
 * en el último. Sirve para el aviso "añade 1 más y ahorra X €".
 */
function siguienteTramoDescuento(unidades) {
  const siguiente = tramosDescuento().find((t) => t.unidades > unidades);
  if (!siguiente) return null;
  return { ...siguiente, faltan: siguiente.unidades - unidades };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { tramosDescuento, calcularDescuentoPorCantidad, siguienteTramoDescuento };
}
