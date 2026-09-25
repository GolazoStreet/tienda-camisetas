/**
 * product-detail.js — Rellena producto.html según el ?id= de la URL.
 *
 * Personalización (nombre y número) y parche (de Liga o del Mundial) solo
 * se ofrecen en camisetas de liga y de selecciones — ver
 * permitePersonalizacion() en products-data.js. Las camisetas de "retro" y
 * "special" no muestran estas opciones.
 */

let estadoDetalle = {
  producto: null,
  imagenes: [],
  imagenActiva: 0,
  talla: null,
  personalizacionActiva: false,
  nombreCustom: "",
  numeroCustom: "",
  parcheActivo: false,
};

function pintarNoEncontrado() {
  document.getElementById("banner-titulo").textContent = "Camiseta no encontrada";
  document.getElementById("detalle-contenedor").innerHTML = `
    <div class="empty-state">
      <strong>No hemos encontrado esa camiseta</strong>
      <p>Puede que el enlace esté mal escrito o que el producto ya no esté disponible.</p>
      <a href="productos.html" class="btn btn-dark" style="margin-top: var(--space-4);">Ver todas las camisetas</a>
    </div>
  `;
}

/** Bloque HTML de personalización y parche (vacío si el producto no los admite). */
function construirBloquePersonalizacion(producto) {
  const permite = typeof permitePersonalizacion === "function" && permitePersonalizacion(producto);
  if (!permite) return "";

  const tipoParcheProducto = typeof tipoParche === "function" ? tipoParche(producto) : null;

  const parcheHTML = tipoParcheProducto
    ? `
      <label class="check-option">
        <input type="checkbox" id="chk-parche" />
        <span>${escaparHTML(etiquetaParche(tipoParcheProducto))} <strong>(+${formatearPrecio(CONFIG.precioParche)})</strong></span>
      </label>
    `
    : "";

  return `
    <div class="custom-block" id="custom-block">
      <h4>Personaliza tu camiseta</h4>

      <label class="check-option">
        <input type="checkbox" id="chk-personalizacion" />
        <span>Nombre y número a la espalda <strong>(+${formatearPrecio(CONFIG.precioPersonalizacion)})</strong></span>
      </label>

      <div class="custom-fields" id="campos-personalizacion" hidden>
        <div class="custom-field">
          <label for="input-nombre-custom">Nombre</label>
          <input type="text" id="input-nombre-custom" maxlength="12" placeholder="Ej: PÉREZ" autocomplete="off" />
        </div>
        <div class="custom-field">
          <label for="input-numero-custom">Número</label>
          <input type="text" id="input-numero-custom" maxlength="2" inputmode="numeric" placeholder="Ej: 10" autocomplete="off" />
        </div>
      </div>

      ${parcheHTML}

      <div class="price-breakdown" id="price-breakdown" hidden></div>
    </div>
  `;
}

function construirDetalle(producto) {
  document.title = `${producto.equipo} — ${producto.nombre} — GolazoStreet`;
  document.getElementById("page-title").textContent = `${producto.equipo} — ${producto.nombre} — GolazoStreet`;
  document
    .getElementById("page-description")
    .setAttribute("content", `${producto.nombre} de ${producto.equipo}. ${producto.descripcion}`);
  document.getElementById("banner-titulo").textContent = producto.equipo;
  document.getElementById("breadcrumb-equipo").textContent = producto.equipo;

  const contenedor = document.getElementById("detalle-contenedor");
  const tallasHTML = producto.tallas
    .map(
      (talla, i) => `
      <input type="radio" name="talla" id="talla-${talla}" value="${talla}" ${i === 0 ? "checked" : ""} />
      <label for="talla-${talla}">${talla}</label>
    `
    )
    .join("");

  contenedor.innerHTML = `
    <div class="product-detail">
      <div>
        <div class="gallery-main" id="galeria-principal">
          <img id="galeria-imagen-principal" src="" alt="" />
        </div>
        <div class="gallery-thumbs" id="galeria-miniaturas"></div>
      </div>

      <div class="detail-info">
        ${mostrarEtiquetaLiga(producto.liga) ? `<span class="product-league">${escaparHTML(nombreLiga(producto.liga))}</span>` : ""}
        <h1>${escaparHTML(producto.equipo)}</h1>
        <p class="detail-subname">${escaparHTML(producto.nombre)}</p>

        <div class="detail-price">${pintarPrecio(producto)}</div>

        <div class="detail-desc">
          <p>${escaparHTML(producto.descripcion)}</p>
        </div>

        <div class="size-block">
          <h4>Talla</h4>
          <div class="size-options">${tallasHTML}</div>
          <p class="size-hint">¿Dudas con la talla? Consulta nuestra <a href="pages/guia-tallas.html" target="_blank" rel="noopener" class="size-guide-link">guía de tallas</a>.</p>
        </div>

        <div class="qty-block">
          <h4>Cantidad</h4>
          <div class="qty-stepper">
            <button type="button" id="qty-menos" aria-label="Restar unidad">−</button>
            <input type="number" id="qty-input" value="1" min="1" max="99" aria-label="Cantidad" />
            <button type="button" id="qty-mas" aria-label="Sumar unidad">+</button>
          </div>
        </div>

        ${construirBloquePersonalizacion(producto)}

        <div class="detail-actions">
          <button class="btn btn-outline" id="btn-add-cart">Añadir al carrito</button>
          <button class="btn btn-primary" id="btn-comprar-ahora">Comprar ahora</button>
        </div>
        <p class="form-feedback" id="detalle-feedback" style="display:none;"></p>

        <div class="detail-meta">
          <div class="detail-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></svg>
            <span>Envío estimado en 8-10 días laborales. Gastos de envío: 1 camiseta 3,00 € · 2 camisetas 2,00 € · 3 o más, gratis.</span>
          </div>
          <div class="detail-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
            <span>No aceptamos cambios ni devoluciones, salvo defecto de fábrica o error nuestro. Revisa bien la talla y, si personalizas la camiseta, el nombre y el número antes de confirmar.</span>
          </div>
          <div class="detail-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
            <span>Pago seguro con tarjeta, PayPal o Revolut. Nunca vemos los datos de tu tarjeta.</span>
          </div>
          <div class="detail-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H7l-3 3z" /></svg>
            <span>¿Dudas? Escríbenos desde el <a href="contacto.html" style="color:var(--pitch); font-weight:700;">formulario de contacto</a>.</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('input[name="talla"]').forEach((input) => {
    input.addEventListener("change", () => (estadoDetalle.talla = input.value));
  });
  estadoDetalle.talla = producto.tallas[0];

  document.getElementById("qty-menos").addEventListener("click", () => ajustarCantidad(-1));
  document.getElementById("qty-mas").addEventListener("click", () => ajustarCantidad(1));
  document.getElementById("qty-input").addEventListener("change", (e) => {
    const val = Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1));
    e.target.value = val;
  });

  inicializarPersonalizacion(producto);

  document.getElementById("btn-add-cart").addEventListener("click", () => {
    agregarAlCarrito(producto, { irACarrito: false });
  });

  document.getElementById("btn-comprar-ahora").addEventListener("click", () => {
    agregarAlCarrito(producto, { irACarrito: true });
  });
}

/** Engancha los checkboxes/inputs de personalización y parche, si el producto los tiene. */
function inicializarPersonalizacion(producto) {
  estadoDetalle.personalizacionActiva = false;
  estadoDetalle.nombreCustom = "";
  estadoDetalle.numeroCustom = "";
  estadoDetalle.parcheActivo = false;

  const chkPersonalizacion = document.getElementById("chk-personalizacion");
  if (!chkPersonalizacion) {
    // Este producto (retro / special) no admite personalización ni parche.
    return;
  }

  const camposPersonalizacion = document.getElementById("campos-personalizacion");
  const inputNombre = document.getElementById("input-nombre-custom");
  const inputNumero = document.getElementById("input-numero-custom");
  const chkParche = document.getElementById("chk-parche");

  chkPersonalizacion.addEventListener("change", () => {
    estadoDetalle.personalizacionActiva = chkPersonalizacion.checked;
    camposPersonalizacion.hidden = !chkPersonalizacion.checked;
    actualizarDesglosePrecio();
  });

  inputNombre.addEventListener("input", () => {
    estadoDetalle.nombreCustom = inputNombre.value;
  });

  inputNumero.addEventListener("input", () => {
    inputNumero.value = inputNumero.value.replace(/[^0-9]/g, "").slice(0, 2);
    estadoDetalle.numeroCustom = inputNumero.value;
  });

  if (chkParche) {
    chkParche.addEventListener("change", () => {
      estadoDetalle.parcheActivo = chkParche.checked;
      actualizarDesglosePrecio();
    });
  }

  actualizarDesglosePrecio();
}

/** Repinta el desglose de precio (camiseta + personalización + parche) según lo seleccionado. */
function actualizarDesglosePrecio() {
  const cont = document.getElementById("price-breakdown");
  if (!cont) return;
  const producto = estadoDetalle.producto;

  const filas = [];
  let extra = 0;

  if (estadoDetalle.personalizacionActiva) {
    extra += CONFIG.precioPersonalizacion;
    filas.push(
      `<div class="price-breakdown-row"><span>Personalización (nombre y número)</span><span>+${formatearPrecio(CONFIG.precioPersonalizacion)}</span></div>`
    );
  }

  if (estadoDetalle.parcheActivo) {
    extra += CONFIG.precioParche;
    const tipo = typeof tipoParche === "function" ? tipoParche(producto) : null;
    filas.push(
      `<div class="price-breakdown-row"><span>${escaparHTML(etiquetaParche(tipo))}</span><span>+${formatearPrecio(CONFIG.precioParche)}</span></div>`
    );
  }

  if (filas.length === 0) {
    cont.hidden = true;
    cont.innerHTML = "";
    return;
  }

  cont.hidden = false;
  cont.innerHTML = `
    ${filas.join("")}
    <div class="price-breakdown-row price-breakdown-total"><span>Precio con las opciones elegidas</span><span>${formatearPrecio(producto.precio + extra)}</span></div>
  `;
}

/** Comprueba que, si se ha marcado personalización, se hayan rellenado nombre y número. */
function validarPersonalizacion() {
  if (!estadoDetalle.personalizacionActiva) return true;
  const nombre = (estadoDetalle.nombreCustom || "").trim();
  const numero = (estadoDetalle.numeroCustom || "").trim();
  if (!nombre || !numero) {
    mostrarFeedback("Para personalizar la camiseta, escribe el nombre y el número que quieres en la espalda.", true);
    return false;
  }
  return true;
}

/** Valida, añade al carrito con las opciones elegidas y muestra el aviso correspondiente. */
function agregarAlCarrito(producto, { irACarrito }) {
  if (!validarPersonalizacion()) return;

  const cantidad = parseInt(document.getElementById("qty-input").value, 10) || 1;
  const opciones = {
    personalizacion: estadoDetalle.personalizacionActiva
      ? { nombre: estadoDetalle.nombreCustom, numero: estadoDetalle.numeroCustom }
      : null,
    parche: estadoDetalle.parcheActivo,
  };

  Carrito.añadir(producto.id, estadoDetalle.talla, cantidad, opciones);

  if (irACarrito) {
    window.location.href = "carrito.html";
    return;
  }

  const extrasTexto = [];
  if (opciones.personalizacion) {
    extrasTexto.push(`personalización "${opciones.personalizacion.nombre}" nº ${opciones.personalizacion.numero}`);
  }
  if (opciones.parche) {
    const tipo = typeof tipoParche === "function" ? tipoParche(producto) : null;
    extrasTexto.push(etiquetaParche(tipo).toLowerCase());
  }
  const sufijo = extrasTexto.length ? ` (${extrasTexto.join(", ")})` : "";

  mostrarFeedback(`Añadido al carrito: ${producto.equipo} — talla ${estadoDetalle.talla} × ${cantidad}${sufijo}`);
  mostrarToast("Camiseta añadida al carrito");
}

function ajustarCantidad(delta) {
  const input = document.getElementById("qty-input");
  const actual = parseInt(input.value, 10) || 1;
  input.value = Math.max(1, Math.min(99, actual + delta));
}

function mostrarFeedback(texto, esError = false) {
  const el = document.getElementById("detalle-feedback");
  el.textContent = texto;
  el.style.display = "block";
  el.classList.toggle("is-error", esError);
}

function construirGaleria(producto) {
  estadoDetalle.imagenes = [1, 2].map((i) => fuenteImagenProducto(producto, i));
  estadoDetalle.imagenActiva = 0;

  const principal = document.getElementById("galeria-imagen-principal");
  const miniaturas = document.getElementById("galeria-miniaturas");
  const etiquetasVista = ["Vista frontal", "Vista trasera"];

  function actualizarPrincipal() {
    const fuente = estadoDetalle.imagenes[estadoDetalle.imagenActiva];
    principal.src = fuente.src;
    principal.setAttribute("onerror", fuente.onerror);
    principal.alt = `${producto.equipo} — ${etiquetasVista[estadoDetalle.imagenActiva]}`;
  }

  miniaturas.innerHTML = "";
  estadoDetalle.imagenes.forEach((fuente, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = i === 0 ? "is-active" : "";
    btn.innerHTML = `<img src="${fuente.src}" onerror="${fuente.onerror}" alt="${etiquetasVista[i]}" />`;
    btn.addEventListener("click", () => {
      estadoDetalle.imagenActiva = i;
      actualizarPrincipal();
      miniaturas.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
    miniaturas.appendChild(btn);
  });

  actualizarPrincipal();

  actualizarPrincipal();

  document.getElementById("galeria-principal").addEventListener("click", () => {
    document.getElementById("lightbox-img").src = principal.src;
    document.getElementById("lightbox-img").alt = principal.alt;
    document.getElementById("lightbox").classList.add("is-open");
  });
}

function inicializarLightbox() {
  const lightbox = document.getElementById("lightbox");
  document.getElementById("lightbox-close").addEventListener("click", () => {
    lightbox.classList.remove("is-open");
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.classList.remove("is-open");
  });
}

function pintarRelacionados(producto) {
  const relacionados = PRODUCTOS.filter((p) => p.liga === producto.liga && p.id !== producto.id).slice(0, 4);
  if (relacionados.length === 0) return;

  const seccion = document.getElementById("relacionados-seccion");
  const grid = document.getElementById("relacionados-grid");
  grid.innerHTML = "";
  relacionados.forEach((p) => grid.appendChild(crearTarjetaProducto(p)));
  seccion.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const id = parametroURL("id");
  const producto = id ? obtenerProductoPorId(id) : null;

  if (!producto) {
    pintarNoEncontrado();
    return;
  }

  estadoDetalle.producto = producto;
  construirDetalle(producto);
  construirGaleria(producto);
  inicializarLightbox();
  pintarRelacionados(producto);
});
