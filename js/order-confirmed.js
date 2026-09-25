/**
 * order-confirmed.js — Lógica de pedido-confirmado.html.
 *
 * Stripe redirige aquí solo cuando el pago con tarjeta se ha completado
 * correctamente, así que:
 *  1. Vaciamos el carrito (ya está pagado, no debe seguir apareciendo).
 *  2. Mostramos una referencia corta a partir del "session_id" que añade
 *     Stripe a la URL, para que el comprador tenga algo que citar si te
 *     escribe con una duda sobre su pedido.
 */
document.addEventListener("DOMContentLoaded", () => {
  Carrito.vaciar();

  const sessionId = parametroURL("session_id");
  if (sessionId) {
    const referencia = document.getElementById("referencia-pedido");
    if (referencia) {
      referencia.textContent = `Referencia de pago: ${sessionId.slice(-8).toUpperCase()}`;
    }
  }
});
