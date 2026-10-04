/**
 * app.js
 * -----------------------------------------------------------------------
 * Comportamiento común a todas las páginas: menú móvil, año del footer,
 * aviso ("toast") reutilizable y pequeñas utilidades compartidas.
 * -----------------------------------------------------------------------
 */

/** Formatea un número como precio en euros, ej. 74.95 -> "74,95 €". */
function formatearPrecio(numero) {
  return (
    numero.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

/** Escapa texto antes de insertarlo como HTML, para evitar inyecciones XSS. */
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto);
  return div.innerHTML;
}

/** Lee un parámetro de la URL actual. */
function parametroURL(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

/** Muestra un mensaje flotante breve en la esquina inferior de la pantalla. */
function mostrarToast(mensaje, duracionMs = 2600) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add("is-visible");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove("is-visible"), duracionMs);
}

/** Inicializa el menú hamburguesa del header. */
function inicializarMenuMovil() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const abierto = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(abierto));
    document.body.style.overflow = abierto ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/** Marca como activo el enlace del header que corresponde a la página/sección actual. */
function marcarNavActivo() {
  const pagina = window.location.pathname.split("/").pop() || "index.html";
  const params = new URLSearchParams(window.location.search);
  // "Ofertas" dedicada: se entra por el enlace del menú (oferta=1) sin combinarlo con
  // ninguna liga. Si se combina con una liga, se sigue considerando parte de
  // "Todas las camisetas" (filtrada), tal y como se decide también en products-page.js.
  const enOfertasDedicada = pagina === "productos.html" && params.get("oferta") === "1" && !params.get("liga");

  document.querySelectorAll(".main-nav a[data-nav]").forEach((enlace) => {
    const destino = enlace.getAttribute("data-nav");
    let activo;
    if (destino === "productos.html?oferta=1") {
      activo = enOfertasDedicada;
    } else if (destino === "productos.html") {
      activo = pagina === "productos.html" && !enOfertasDedicada;
    } else {
      activo = destino === pagina;
    }
    if (activo) {
      enlace.classList.add("is-active");
      enlace.setAttribute("aria-current", "page");
    }
  });
}

/** Aplica el nombre de la tienda desde config.js en cualquier elemento [data-store-name]. */
function aplicarConfigTienda() {
  if (typeof CONFIG === "undefined") return;
  document.querySelectorAll("[data-store-name]").forEach((el) => {
    el.textContent = CONFIG.nombreTienda;
  });
  document.querySelectorAll("[data-store-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  document.querySelectorAll("[data-store-email]").forEach((el) => {
    el.textContent = CONFIG.emailContacto;
    if (el.tagName === "A") el.href = "mailto:" + CONFIG.emailContacto;
  });

  const redesLinks = document.querySelectorAll("[data-social]");
  redesLinks.forEach((el) => {
    const red = el.getAttribute("data-social");
    if (CONFIG.redes && CONFIG.redes[red]) {
      el.href = CONFIG.redes[red];
    }
  });
}

/** Euros sin decimales cuando son redondos (8 € en vez de 8,00 €). */
function formatoEuros(numero) {
  return Number.isInteger(numero) ? `${numero}\u00A0€` : formatearPrecio(numero);
}

/** Tramos de la oferta por cantidad definidos en config.js (lista vacía si no hay oferta). */
function tramosOfertaCantidad() {
  if (typeof CONFIG === "undefined" || !Array.isArray(CONFIG.descuentosPorCantidad)) return [];
  return CONFIG.descuentosPorCantidad
    .filter((t) => Number(t.unidades) > 0 && Number(t.descuento) > 0)
    .slice()
    .sort((a, b) => a.unidades - b.unidades);
}

/**
 * Barra dorada encima del menú, en TODAS las páginas, para que el cliente
 * vea la oferta por cantidad nada más entrar. Se genera sola a partir de
 * CONFIG.descuentosPorCantidad: si cambias los números en config.js, cambia aquí también.
 */
function pintarBarraOferta() {
  const tramos = tramosOfertaCantidad();
  const header = document.querySelector(".site-header");
  if (tramos.length === 0 || !header || document.querySelector(".promo-bar")) return;

  const items = tramos
    .map((t) => `<span class="promo-tier"><span class="promo-qty"><b>${Number(t.unidades)}</b> camisetas</span> <b class="promo-save">−${formatoEuros(Number(t.descuento))}</b></span>`)
    .join("");

  const barra = document.createElement("div");
  barra.className = "promo-bar";
  barra.setAttribute("role", "note");
  barra.innerHTML = `<div class="promo-bar-inner"><span class="promo-bar-label">Oferta</span><div class="promo-tiers">${items}</div><span class="promo-bar-note">en el total de tu pedido</span></div>`;
  header.parentNode.insertBefore(barra, header);
}

/** Cuadro de oferta para la ficha de producto (cadena vacía si no hay oferta). */
function htmlOfertaCantidad() {
  const tramos = tramosOfertaCantidad();
  if (tramos.length === 0) return "";
  const chips = tramos
    .map((t) => `<span class="offer-chip"><b>${Number(t.unidades)}</b> camisetas <em>−${formatoEuros(Number(t.descuento))}</em></span>`)
    .join("");
  return `
    <div class="detail-offer">
      <strong class="detail-offer-title">Oferta por cantidad</strong>
      <div class="detail-offer-tiers">${chips}</div>
      <p class="detail-offer-note">Se descuenta del total de tu pedido, mezclando los modelos que quieras.</p>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarMenuMovil();
  marcarNavActivo();
  aplicarConfigTienda();
  pintarBarraOferta();
});
