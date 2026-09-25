/**
 * cart-page.js — Lógica de carrito.html: listado, cantidades, formulario
 * de datos de envío (obligatorio antes de pagar) y botones de pago
 * (tarjeta / PayPal.me / pedido por Revolut vía formulario).
 *
 * Gastos de envío según el número total de camisetas del pedido:
 *   1 camiseta  -> CONFIG.envioUnaCamiseta
 *   2 camisetas -> CONFIG.envioDosCamisetas
 *   3 o más     -> gratis
 */

function calcularEnvio(totalUnidades) {
  if (typeof CONFIG === "undefined") return 0;
  if (totalUnidades <= 0) return 0;
  if (totalUnidades === 1) return CONFIG.envioUnaCamiseta || 0;
  if (totalUnidades === 2) return CONFIG.envioDosCamisetas || 0;
  return 0;
}

function pintarCarritoVacio(contenedor) {
  contenedor.innerHTML = `
    <div class="empty-cart">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" /><circle cx="10" cy="21" r="1.4" /><circle cx="18" cy="21" r="1.4" /></svg>
      <h2 style="font-family: var(--font-body); text-transform:none; font-size:1.3rem;">Tu carrito está vacío</h2>
      <p style="margin-top: var(--space-3);">Todavía no has añadido ninguna camiseta.</p>
      <a href="productos.html" class="btn btn-dark" style="margin-top: var(--space-5);">Ver camisetas</a>
    </div>
  `;
}

/** Construye el HTML de las líneas de extras (personalización / parche) de un artículo del carrito. */
function detalleExtrasCarrito(linea) {
  const partes = [];
  if (linea.personalizacion) {
    partes.push(
      `<span class="cart-item-extra">Personalización: "${escaparHTML(linea.personalizacion.nombre)}" nº ${escaparHTML(
        linea.personalizacion.numero
      )} <em>(+${formatearPrecio(CONFIG.precioPersonalizacion)})</em></span>`
    );
  }
  if (linea.parche) {
    const tipo = typeof tipoParche === "function" ? tipoParche(linea.producto) : null;
    const etiqueta = typeof etiquetaParche === "function" ? etiquetaParche(tipo) : "Parche";
    partes.push(`<span class="cart-item-extra">${escaparHTML(etiqueta)} <em>(+${formatearPrecio(CONFIG.precioParche)})</em></span>`);
  }
  if (partes.length === 0) return "";
  return `<div class="cart-item-extras">${partes.join("")}</div>`;
}

function crearFilaCarrito(linea) {
  const imgFrontal = fuenteImagenProducto(linea.producto, 1);
  const div = document.createElement("div");
  div.className = "cart-item";
  div.innerHTML = `
    <div class="cart-thumb"><img src="${imgFrontal.src}" onerror="${imgFrontal.onerror}" alt="${escaparHTML(linea.producto.equipo)}" /></div>
    <div class="cart-item-info">
      <strong>${escaparHTML(linea.producto.equipo)}</strong>
      <div class="cart-item-meta">${escaparHTML(linea.producto.nombre)} · Talla ${escaparHTML(linea.talla)}</div>
      ${detalleExtrasCarrito(linea)}
      <div class="qty-stepper" style="margin-top: var(--space-3);">
        <button type="button" data-accion="menos" aria-label="Restar unidad">−</button>
        <input type="number" min="1" max="99" value="${linea.cantidad}" data-cantidad-input aria-label="Cantidad" />
        <button type="button" data-accion="mas" aria-label="Sumar unidad">+</button>
      </div>
    </div>
    <div class="cart-item-controls">
      <span class="cart-item-price">${formatearPrecio(Carrito.precioLinea(linea))}</span>
      <button type="button" class="cart-item-remove" data-accion="eliminar">Eliminar</button>
    </div>
  `;

  div.querySelector('[data-accion="menos"]').addEventListener("click", () => {
    const nueva = Math.max(1, linea.cantidad - 1);
    Carrito.actualizarCantidad(linea.id, nueva);
    renderizarCarrito();
  });
  div.querySelector('[data-accion="mas"]').addEventListener("click", () => {
    Carrito.actualizarCantidad(linea.id, linea.cantidad + 1);
    renderizarCarrito();
  });
  div.querySelector("[data-cantidad-input]").addEventListener("change", (e) => {
    const val = Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1));
    Carrito.actualizarCantidad(linea.id, val);
    renderizarCarrito();
  });
  div.querySelector('[data-accion="eliminar"]').addEventListener("click", () => {
    Carrito.eliminar(linea.id);
    mostrarToast("Camiseta eliminada del carrito");
    renderizarCarrito();
  });

  return div;
}

/** Texto que explica el tramo de envío en el que está el pedido, para mostrarlo en el resumen. */
function textoEnvio(totalUnidades, envio) {
  if (totalUnidades <= 0) return "";
  if (totalUnidades === 1) return `1 camiseta → envío ${formatearPrecio(envio)}`;
  if (totalUnidades === 2) return `2 camisetas → envío ${formatearPrecio(envio)}`;
  return `${totalUnidades} camisetas → envío gratis`;
}

/** Tipo de input HTML según el campo (para que el teclado del móvil sea el adecuado). */
function tipoInputEnvio(clave) {
  if (clave === "email") return "email";
  if (clave === "telefono") return "tel";
  return "text";
}

/** Pinta el formulario de datos de envío y guarda cada campo en cuanto el comprador lo escribe. */
function pintarFormularioEnvio() {
  const contenedor = document.getElementById("shipping-grid");
  if (!contenedor) return;
  const datosGuardados = DatosEnvio.obtener();

  contenedor.innerHTML = CAMPOS_ENVIO.map((campo) => {
    const esAncho = campo.clave === "direccion";
    const valor = escaparHTML(datosGuardados[campo.clave] || "");
    return `
      <div class="form-field${esAncho ? " full-width" : ""}" data-campo-envio="${campo.clave}">
        <label for="envio-${campo.clave}">${campo.etiqueta}</label>
        <input type="${tipoInputEnvio(campo.clave)}" id="envio-${campo.clave}" value="${valor}" autocomplete="on" />
      </div>
    `;
  }).join("");

  contenedor.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const campoDiv = input.closest("[data-campo-envio]");
      const datos = DatosEnvio.obtener();
      datos[campoDiv.dataset.campoEnvio] = input.value;
      DatosEnvio.guardar(datos);
      campoDiv.classList.remove("is-invalid");
    });
  });
}

/**
 * Comprueba que los datos de envío están completos antes de dejar pagar
 * por cualquier método. Si falta algo, resalta el campo, hace scroll
 * hasta él y avisa con un toast — y devuelve null para que quien llame a
 * esta función sepa que no debe continuar con el pago.
 */
function datosEnvioValidosOAvisar() {
  const datos = DatosEnvio.obtener();
  const campoInvalido = DatosEnvio.primerCampoInvalido(datos);

  if (campoInvalido) {
    document.querySelectorAll("#shipping-grid .form-field").forEach((el) => el.classList.remove("is-invalid"));
    const campoDiv = document.querySelector(`#shipping-grid [data-campo-envio="${campoInvalido}"]`);
    if (campoDiv) {
      campoDiv.classList.add("is-invalid");
      campoDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      campoDiv.querySelector("input").focus();
    }
    mostrarToast("Completa tus datos de envío antes de pagar.", 3500);
    return null;
  }

  return datos;
}

function renderizarCarrito() {
  const contenedor = document.getElementById("carrito-contenedor");
  const lineas = Carrito.lineasConDatos();

  if (lineas.length === 0) {
    pintarCarritoVacio(contenedor);
    return;
  }

  const subtotal = Carrito.subtotal();
  const totalUnidades = Carrito.totalUnidades();
  const envio = calcularEnvio(totalUnidades);
  const total = subtotal + envio;

  contenedor.innerHTML = `
    <div class="shipping-form" id="shipping-form">
      <h3>Datos de envío</h3>
      <p class="shipping-form-note">Los necesitamos para preparar y enviarte el pedido, elijas el método de pago que elijas.</p>
      <div class="shipping-grid" id="shipping-grid"></div>
    </div>
    <div class="cart-layout">
      <div class="cart-list" id="cart-list"></div>
      <aside class="cart-summary">
        <h3>Resumen del pedido</h3>
        <div class="summary-row"><span>Subtotal</span><span id="resumen-subtotal"></span></div>
        <div class="summary-row"><span>Envío</span><span id="resumen-envio"></span></div>
        <p class="summary-shipping-note" id="resumen-envio-nota"></p>
        <div class="summary-row total"><span>Total</span><span id="resumen-total"></span></div>

        <div class="payment-options">
          <button class="btn btn-outline btn-block" id="btn-pagar-tarjeta">Pagar con tarjeta</button>
          <button class="btn btn-primary btn-block" id="btn-pagar-paypal">Pagar con PayPal</button>
          <button class="btn btn-dark btn-block" id="btn-pagar-revolut">Pagar con Revolut</button>
        </div>
        <p class="payment-note">
          <strong>Tarjeta</strong> te lleva directamente a pagar el importe exacto en la página segura de Stripe.
          <strong>PayPal</strong> te lleva directamente a pagar el importe exacto de tu pedido.
          <strong>Revolut</strong> envía tu pedido a través de nuestro formulario de contacto; te
          responderemos con un enlace de pago seguro por el importe exacto.
        </p>
      </aside>
    </div>
  `;

  pintarFormularioEnvio();

  const lista = document.getElementById("cart-list");
  lineas.forEach((linea) => lista.appendChild(crearFilaCarrito(linea)));

  document.getElementById("resumen-subtotal").textContent = formatearPrecio(subtotal);
  document.getElementById("resumen-envio").textContent = envio === 0 ? "Gratis" : formatearPrecio(envio);
  document.getElementById("resumen-envio-nota").textContent = textoEnvio(totalUnidades, envio);
  document.getElementById("resumen-total").textContent = formatearPrecio(total);

  document.getElementById("btn-pagar-paypal").addEventListener("click", async (e) => {
    const datosEnvio = datosEnvioValidosOAvisar();
    if (!datosEnvio) return;
    const boton = e.currentTarget;
    boton.disabled = true;
    boton.textContent = "Abriendo PayPal…";
    await iniciarPagoPayPal(datosEnvio, lineas, envio, total);
    boton.disabled = false;
    boton.textContent = "Pagar con PayPal";
  });

  document.getElementById("btn-pagar-revolut").addEventListener("click", () => {
    const datosEnvio = datosEnvioValidosOAvisar();
    if (!datosEnvio) return;
    iniciarPedidoRevolut(datosEnvio, lineas, envio, total);
  });

  const botonTarjeta = document.getElementById("btn-pagar-tarjeta");
  botonTarjeta.addEventListener("click", async () => {
    const datosEnvio = datosEnvioValidosOAvisar();
    if (!datosEnvio) return;

    botonTarjeta.disabled = true;
    botonTarjeta.textContent = "Redirigiendo a pago seguro…";

    const ok = await iniciarPagoStripe(datosEnvio, lineas);

    if (!ok) {
      // Si algo falla (por ejemplo, el pago con tarjeta todavía no está
      // configurado en Netlify), no dejamos al comprador sin opciones.
      mostrarToast("No se pudo iniciar el pago con tarjeta. Prueba con PayPal o Revolut.", 4000);
      botonTarjeta.disabled = false;
      botonTarjeta.textContent = "Pagar con tarjeta";
    }
    // Si ha ido bien, no hace falta restaurar el botón: la página ya está
    // redirigiendo al comprador fuera de aquí, a la página de Stripe.
  });
}

document.addEventListener("DOMContentLoaded", renderizarCarrito);
