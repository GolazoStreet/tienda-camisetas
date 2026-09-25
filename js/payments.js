/**
 * payments.js
 * -----------------------------------------------------------------------
 * LEE ESTO ANTES DE TOCAR NADA DE PAGOS
 *
 * GitHub Pages solo sirve archivos estáticos (HTML/CSS/JS). No hay
 * servidor propio, así que esta web NUNCA puede procesar un pago por sí
 * misma ni guardar el número de una tarjeta: eso siempre lo hace un
 * servicio de pago externo (PayPal, Revolut...), nunca este código.
 * Cualquier "integración de pago" que no dependa de un servicio externo
 * sería falsa, así que aquí no hay ninguna.
 *
 * QUÉ USA ESTA TIENDA Y POR QUÉ:
 *
 * 1) PAYPAL → enlaces de PayPal.me
 *    - No requiere claves, API ni backend. Solo tu usuario público de
 *      paypal.me (CONFIG.paypalUsuario).
 *    - Genera un enlace con el importe exacto: paypal.me/usuario/importe
 *    - El comprador paga en una página de PayPal, fuera de esta web.
 *      Esta web nunca ve ni toca los datos de la tarjeta.
 *    - LIMITACIÓN HONESTA: el importe viaja en la URL, generado por
 *      JavaScript en el navegador del comprador. Alguien con
 *      conocimientos técnicos podría, en teoría, editar la URL antes de
 *      pagar y proponerte un importe distinto al real. Para una tienda
 *      pequeña esto es un riesgo bajo (tú ves el importe recibido antes
 *      de enviar el pedido), pero si la tienda crece te interesará
 *      pasar a "PayPal Checkout" con verificación en un backend propio.
 *
 * 2) REVOLUT → pedido manual a través del formulario de contacto
 *    - Revolut no ofrece (sin usar su API de pagos, que exige backend y
 *      claves privadas) un enlace público donde tú controles el importe
 *      simplemente construyendo una URL, a diferencia de PayPal.me.
 *    - Por eso, el botón de Revolut NO cobra directamente: envía el
 *      resumen del pedido a tu formulario de contacto (que no expone tu
 *      email ni tu teléfono al comprador) y tú generas manualmente,
 *      desde tu app de Revolut Business, un "Enlace de pago" por el
 *      importe exacto y se lo respondes por email.
 *    - Si en el futuro quieres que Revolut cobre automáticamente,
 *      necesitarás la API de Revolut Merchant, que sí requiere backend
 *      propio y claves privadas (nunca deben ir en este código).
 *
 * 3) TARJETA (Stripe) → automático, con la única pieza de backend de la
 *    tienda: netlify/functions/crear-sesion-stripe.js
 *    - A diferencia de PayPal.me, aquí SÍ hace falta backend, porque el
 *      importe no se calcula confiando en el navegador del comprador:
 *      lo recalcula el servidor a partir del catálogo real (ver ese
 *      archivo para el porqué).
 *    - Este botón envía el carrito a esa función; ella crea una sesión
 *      de pago en Stripe y devuelve la URL segura de Stripe donde el
 *      comprador escribe su tarjeta. Esta web nunca ve ni toca esos
 *      datos.
 *    - Requiere publicar la tienda en Netlify (en vez de GitHub Pages,
 *      que no puede ejecutar esta función) y configurar la clave
 *      secreta de Stripe como variable de entorno ahí — nunca en este
 *      código. Ver README.md, sección "Pago con tarjeta (Stripe)".
 * -----------------------------------------------------------------------
 */

/** Construye el enlace de pago de PayPal.me para un importe dado. */
function enlacePayPalMe(importe) {
  const usuario = (typeof CONFIG !== "undefined" && CONFIG.paypalUsuario) || "TU_USUARIO_PAYPAL";
  const importeFormateado = Math.max(0.01, importe).toFixed(2);
  return `https://paypal.me/${encodeURIComponent(usuario)}/${importeFormateado}EUR`;
}

/** Construye el bloque de texto con los datos de envío, para incluirlo en pedidos. */
function textoDatosEnvio(datosEnvio) {
  return CAMPOS_ENVIO.map((c) => `${c.etiqueta}: ${datosEnvio[c.clave] || ""}`).join("\n");
}

/** Construye un resumen de texto legible de un pedido, para el formulario de contacto. */
function resumenPedidoTexto(lineas, envio, total) {
  const filas = lineas
    .map((l) => {
      const extras = [];
      if (l.personalizacion) {
        extras.push(`personalización "${l.personalizacion.nombre}" nº ${l.personalizacion.numero} (+${formatearPrecio(CONFIG.precioPersonalizacion)})`);
      }
      if (l.parche) {
        const tipo = typeof tipoParche === "function" ? tipoParche(l.producto) : null;
        const etiqueta = typeof etiquetaParche === "function" ? etiquetaParche(tipo) : "parche";
        extras.push(`${etiqueta.toLowerCase()} (+${formatearPrecio(CONFIG.precioParche)})`);
      }
      const extrasTexto = extras.length ? ` [${extras.join(", ")}]` : "";
      return `• ${l.producto.equipo} (${l.producto.nombre}) — talla ${l.talla} × ${l.cantidad}${extrasTexto} = ${formatearPrecio(Carrito.precioLinea(l))}`;
    })
    .join("\n");
  const envioTexto = envio === 0 ? "Gratis" : formatearPrecio(envio);
  return `Resumen de mi pedido:\n${filas}\n\nEnvío: ${envioTexto}\nTotal: ${formatearPrecio(total)}`;
}

/**
 * Envía los datos de envío + el resumen del pedido a tu formulario de
 * contacto (Formspree). Se usa para los pedidos de PayPal y de tarjeta,
 * porque esos pagos ocurren fuera de esta web (en PayPal o en Stripe) y
 * de otro modo nunca te llegaría la dirección a la que hay que enviar la
 * camiseta.
 *
 * A propósito NO bloquea el pago si falla el envío del aviso: el
 * comprador ya ha rellenado sus datos (quedan guardados en su
 * navegador), así que si este aviso no llega, siempre puedes pedírselos
 * de nuevo por email a partir de la confirmación del pago.
 */
async function enviarNotificacionPedido(datosEnvio, lineas, envio, total, metodoPago) {
  const endpoint = (typeof CONFIG !== "undefined" && CONFIG.formEndpoint) || "";
  if (!endpoint || endpoint.includes("TU_ID_DE_FORMSPREE")) return false;

  const mensaje = `${textoDatosEnvio(datosEnvio)}\n\n${resumenPedidoTexto(lineas, envio, total)}`;

  try {
    const respuesta = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        nombre: `${datosEnvio.nombre} ${datosEnvio.apellidos}`.trim(),
        email: datosEnvio.email,
        asunto: `Pedido — pago con ${metodoPago}`,
        mensaje,
      }),
    });
    return respuesta.ok;
  } catch (error) {
    console.warn("No se pudo enviar el aviso del pedido:", error);
    return false;
  }
}

/**
 * Abre el flujo de pago con PayPal.me para un importe y avisa por email
 * (con la dirección de envío) antes de abrir la pestaña de PayPal.
 */
async function iniciarPagoPayPal(datosEnvio, lineas, envio, total) {
  await enviarNotificacionPedido(datosEnvio, lineas, envio, total, "PayPal");
  const url = enlacePayPalMe(total);
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Redirige al formulario de contacto con el pedido y los datos de envío precargados, para solicitar el pago por Revolut. */
function iniciarPedidoRevolut(datosEnvio, lineas, envio, total) {
  const resumen = `${textoDatosEnvio(datosEnvio)}\n\n${resumenPedidoTexto(lineas, envio, total)}\n\n(Indícame por favor el enlace de pago de Revolut para completar la compra.)`;
  const params = new URLSearchParams({
    asunto: "Pedido — pago con Revolut",
    mensaje: resumen,
    nombre: `${datosEnvio.nombre} ${datosEnvio.apellidos}`.trim(),
    email: datosEnvio.email,
  });
  window.location.href = `contacto.html?${params.toString()}`;
}

/**
 * Envía el carrito y los datos de envío a la función serverless de
 * Stripe (ver el aviso al principio de este archivo) y, si todo va
 * bien, redirige al comprador a la página de pago segura de Stripe.
 *
 * OJO: a propósito NO se envía el precio ni el total — solo qué productos,
 * tallas, cantidades y extras ha elegido el comprador. El importe real lo
 * calcula siempre el servidor a partir del catálogo, nunca el navegador.
 * Los datos de envío sí se envían tal cual, para que aparezcan junto al
 * pago en el panel de Stripe.
 *
 * Devuelve `true` si ha podido redirigir, o `false` si algo ha fallado
 * (para que quien llame a esta función pueda avisar al comprador en vez de
 * dejarlo mirando una pantalla que no hace nada).
 */
async function iniciarPagoStripe(datosEnvio, lineas) {
  const endpoint = (typeof CONFIG !== "undefined" && CONFIG.stripeCheckoutEndpoint) || "";
  if (!endpoint) {
    console.warn("Falta CONFIG.stripeCheckoutEndpoint en config.js.");
    return false;
  }

  const cuerpo = {
    datosEnvio,
    lineas: lineas.map((l) => ({
      productoId: l.productoId,
      talla: l.talla,
      cantidad: l.cantidad,
      personalizacion: l.personalizacion,
      parche: l.parche,
    })),
  };

  try {
    const respuesta = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok || !datos.url) {
      console.warn("No se pudo iniciar el pago con Stripe:", datos.error || respuesta.status);
      return false;
    }

    window.location.href = datos.url;
    return true;
  } catch (error) {
    console.warn("No se pudo contactar con la función de pago:", error);
    return false;
  }
}
