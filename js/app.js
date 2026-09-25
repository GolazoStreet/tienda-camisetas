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

document.addEventListener("DOMContentLoaded", () => {
  inicializarMenuMovil();
  marcarNavActivo();
  aplicarConfigTienda();
});
