/**
 * netlify/functions/crear-sesion-stripe.js
 * -----------------------------------------------------------------------
 * ÚNICA pieza de "backend" de toda la tienda. Se ejecuta en los
 * servidores de Netlify (no en el navegador del comprador), y es la
 * única que puede conocer STRIPE_SECRET_KEY, porque nunca se envía al
 * navegador.
 *
 * QUÉ HACE, PASO A PASO:
 *  1. Recibe del carrito (carrito.html) la lista de líneas que quiere
 *     comprar el cliente: productoId, talla, cantidad, personalización
 *     y si lleva parche, además de sus datos de envío (nombre, dirección,
 *     teléfono, etc. — ver js/shipping-data.js).
 *  2. IMPORTANTE — NUNCA se fía del precio que venga del navegador.
 *     Para cada línea, busca el producto real en products-data.js (el
 *     mismo archivo que usa toda la web) y calcula el precio a partir
 *     de ahí. Así, aunque alguien manipulara la petición para pedir un
 *     precio más bajo, el cobro real seguiría siendo el correcto.
 *  3. Con el total ya verificado, le pide a Stripe que cree una "sesión
 *     de pago" (Checkout Session) por ese importe.
 *  4. Devuelve al navegador la URL de pago de Stripe. El propio
 *     carrito.html redirige al cliente ahí — el número de tarjeta se
 *     escribe siempre en la página de Stripe, nunca en esta web.
 *
 * CONFIGURACIÓN NECESARIA (ver README.md, sección "Pago con tarjeta"):
 *  - Variable de entorno STRIPE_SECRET_KEY en el panel de Netlify
 *    (Site configuration → Environment variables). NUNCA la escribas
 *    aquí ni en ningún archivo que subas a GitHub.
 * -----------------------------------------------------------------------
 */

const { PRODUCTOS } = require("../../js/products-data.js");
const CONFIG = require("../../js/config.js");
const { DatosEnvio } = require("../../js/shipping-data.js");

/** Misma lógica de gastos de envío que js/cart-page.js (calcularEnvio). Si
 * cambias los tramos de envío ahí, cámbialos también aquí para que
 * coincidan. */
function calcularEnvio(totalUnidades) {
  if (totalUnidades <= 0) return 0;
  if (totalUnidades === 1) return CONFIG.envioUnaCamiseta || 0;
  if (totalUnidades === 2) return CONFIG.envioDosCamisetas || 0;
  return 0;
}

/** Busca un producto por id en el catálogo real. */
function buscarProducto(productoId) {
  return PRODUCTOS.find((p) => p.id === productoId) || null;
}

/**
 * Valida y "recalcula desde cero" una línea del pedido a partir de datos
 * en los que SÍ se puede confiar (el catálogo del servidor), usando del
 * navegador solo el id de producto, la talla, la cantidad y si quiere
 * personalización/parche (no el precio).
 */
function validarLinea(lineaCliente) {
  const producto = buscarProducto(lineaCliente.productoId);
  if (!producto) return null;

  const talla = String(lineaCliente.talla || "");
  if (!producto.tallas || !producto.tallas.includes(talla)) return null;

  const cantidad = Math.max(1, Math.min(99, parseInt(lineaCliente.cantidad, 10) || 0));
  if (cantidad < 1) return null;

  const quierePersonalizacion = !!(
    lineaCliente.personalizacion &&
    lineaCliente.personalizacion.nombre &&
    lineaCliente.personalizacion.numero
  );
  const quiereParche = !!lineaCliente.parche;

  let precioUnidad = producto.precio;
  const extras = [];
  if (quierePersonalizacion) {
    precioUnidad += CONFIG.precioPersonalizacion || 0;
    extras.push(`Personalización: ${lineaCliente.personalizacion.nombre} nº ${lineaCliente.personalizacion.numero}`);
  }
  if (quiereParche) {
    precioUnidad += CONFIG.precioParche || 0;
    extras.push("Con parche");
  }

  const nombreArticulo = `${producto.equipo} — ${producto.nombre} (talla ${talla})`;

  return { cantidad, precioUnidad, nombreArticulo, descripcion: extras.join(" · ") || undefined };
}

/** Convierte un objeto JS en pares [clave, valor] con la notación de
 * corchetes que espera la API de Stripe (line_items[0][price_data]...). */
function aParametrosStripe(datos, prefijo = "") {
  const params = [];
  for (const [clave, valor] of Object.entries(datos)) {
    if (valor === undefined || valor === null) continue;
    const clavePrefijada = prefijo ? `${prefijo}[${clave}]` : clave;
    if (Array.isArray(valor)) {
      valor.forEach((item, indice) => {
        const clavePorIndice = `${clavePrefijada}[${indice}]`;
        if (item && typeof item === "object") {
          params.push(...aParametrosStripe(item, clavePorIndice));
        } else {
          params.push([clavePorIndice, String(item)]);
        }
      });
    } else if (typeof valor === "object") {
      params.push(...aParametrosStripe(valor, clavePrefijada));
    } else {
      params.push([clavePrefijada, String(valor)]);
    }
  }
  return params;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const claveSecreta = process.env.STRIPE_SECRET_KEY;
  if (!claveSecreta) {
    console.error("Falta la variable de entorno STRIPE_SECRET_KEY en Netlify.");
    return { statusCode: 500, body: JSON.stringify({ error: "El pago con tarjeta no está configurado todavía." }) };
  }

  let datos;
  try {
    datos = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Petición no válida." }) };
  }

  const lineasCliente = Array.isArray(datos.lineas) ? datos.lineas : [];
  if (lineasCliente.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "El carrito está vacío." }) };
  }

  // Los datos de envío son obligatorios para cualquier pedido, no solo un
  // "extra" del formulario: se comprueban aquí igual que en el navegador,
  // por si alguien intentase llamar a esta función saltándose el
  // formulario de la web.
  const datosEnvio = datos.datosEnvio || {};
  if (DatosEnvio.primerCampoInvalido(datosEnvio)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Faltan datos de envío del comprador." }) };
  }

  const lineasValidadas = [];
  let totalUnidades = 0;
  for (const lineaCliente of lineasCliente) {
    const linea = validarLinea(lineaCliente);
    if (!linea) {
      return { statusCode: 400, body: JSON.stringify({ error: "Uno de los artículos del carrito ya no está disponible." }) };
    }
    lineasValidadas.push(linea);
    totalUnidades += linea.cantidad;
  }

  const envio = calcularEnvio(totalUnidades);

  // Construye los line_items para Stripe: uno por artículo del carrito, más
  // uno para el envío (si hay coste). Los céntimos deben ser un número
  // entero (Stripe trabaja siempre en la unidad más pequeña de la moneda).
  const lineItems = lineasValidadas.map((linea) => ({
    price_data: {
      currency: "eur",
      product_data: { name: linea.nombreArticulo, description: linea.descripcion },
      unit_amount: Math.round(linea.precioUnidad * 100),
    },
    quantity: linea.cantidad,
  }));

  if (envio > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: "Gastos de envío" },
        unit_amount: Math.round(envio * 100),
      },
      quantity: 1,
    });
  }

  // Origen del sitio (ej. https://tuusuario.netlify.app), para construir
  // las URLs de vuelta tras el pago. Netlify lo rellena solo.
  const origen = `https://${event.headers.host}`;

  const cuerpoSesion = {
    mode: "payment",
    locale: "es",
    customer_email: datosEnvio.email,
    success_url: `${origen}/pedido-confirmado.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origen}/carrito.html`,
    line_items: lineItems,
    // Los datos de envío no se cobran ni se validan como precio, pero
    // quedan guardados junto al pago en el panel de Stripe (Payments →
    // el pago en concreto → "Metadata") para que sepas dónde enviar el
    // pedido.
    metadata: {
      nombre: datosEnvio.nombre,
      apellidos: datosEnvio.apellidos,
      telefono: datosEnvio.telefono,
      nacionalidad: datosEnvio.nacionalidad,
      direccion: datosEnvio.direccion,
      ciudad: datosEnvio.ciudad,
      provincia: datosEnvio.provincia,
      codigoPostal: datosEnvio.codigoPostal,
    },
  };

  try {
    const respuestaStripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${claveSecreta}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(aParametrosStripe(cuerpoSesion)).toString(),
    });

    const sesion = await respuestaStripe.json();

    if (!respuestaStripe.ok) {
      console.error("Error de Stripe:", sesion.error);
      return { statusCode: 502, body: JSON.stringify({ error: "No se pudo iniciar el pago con Stripe." }) };
    }

    return { statusCode: 200, body: JSON.stringify({ url: sesion.url }) };
  } catch (error) {
    console.error("Error al contactar con Stripe:", error);
    return { statusCode: 502, body: JSON.stringify({ error: "No se pudo contactar con Stripe." }) };
  }
};
