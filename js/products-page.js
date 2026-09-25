/**
 * products-page.js — Lógica de productos.html: filtros, búsqueda, orden.
 */

const estadoCatalogo = {
  ligasSeleccionadas: new Set(),
  soloOferta: false,
  precioMin: null,
  precioMax: null,
  texto: "",
  orden: "relevancia",
};

function pintarFiltroLigas() {
  const contenedor = document.getElementById("filtro-ligas");
  if (!contenedor) return;
  contenedor.innerHTML = "";
  LIGAS.forEach((liga) => {
    const id = `liga-${liga.id}`;
    const label = document.createElement("label");
    label.className = "filter-option";
    label.innerHTML = `
      <input type="checkbox" id="${id}" value="${liga.id}" />
      ${escaparHTML(liga.nombre)}
    `;
    contenedor.appendChild(label);
  });

  contenedor.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        estadoCatalogo.ligasSeleccionadas.add(input.value);
      } else {
        estadoCatalogo.ligasSeleccionadas.delete(input.value);
      }
      renderizarCatalogo();
    });
  });
}

function leerFiltrosDesdeURL() {
  const liga = parametroURL("liga");
  const oferta = parametroURL("oferta");

  if (liga) {
    estadoCatalogo.ligasSeleccionadas.add(liga);
    const input = document.getElementById(`liga-${liga}`);
    if (input) input.checked = true;
  }

  if (oferta === "1") {
    estadoCatalogo.soloOferta = true;
    const check = document.getElementById("filtro-oferta");
    if (check) check.checked = true;
  }

  // Si se llega directamente desde el enlace "Ofertas" del menú (sin combinar
  // con ninguna liga), la página se presenta como su propia sección "Ofertas"
  // en vez de como "Todas las camisetas" con una casilla marcada.
  if (oferta === "1" && !liga) {
    document.title = "Ofertas — GolazoStreet";
    const meta = document.getElementById("page-description");
    if (meta) meta.setAttribute("content", "Todas las camisetas de fútbol actualmente en oferta en GolazoStreet.");
    const banner = document.getElementById("banner-titulo");
    if (banner) banner.textContent = "Ofertas";
    const breadcrumb = document.getElementById("breadcrumb-actual");
    if (breadcrumb) breadcrumb.textContent = "Ofertas";
  }
}

function productosFiltrados() {
  let lista = [...PRODUCTOS];

  if (estadoCatalogo.ligasSeleccionadas.size > 0) {
    lista = lista.filter((p) => estadoCatalogo.ligasSeleccionadas.has(p.liga));
  }

  if (estadoCatalogo.soloOferta) {
    lista = lista.filter((p) => Boolean(p.precioAnterior));
  }

  if (estadoCatalogo.precioMin !== null && !Number.isNaN(estadoCatalogo.precioMin)) {
    lista = lista.filter((p) => p.precio >= estadoCatalogo.precioMin);
  }

  if (estadoCatalogo.precioMax !== null && !Number.isNaN(estadoCatalogo.precioMax)) {
    lista = lista.filter((p) => p.precio <= estadoCatalogo.precioMax);
  }

  if (estadoCatalogo.texto.trim()) {
    const q = estadoCatalogo.texto.trim().toLowerCase();
    lista = lista.filter(
      (p) =>
        p.equipo.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        nombreLiga(p.liga).toLowerCase().includes(q)
    );
  }

  switch (estadoCatalogo.orden) {
    case "precio-asc":
      lista.sort((a, b) => a.precio - b.precio);
      break;
    case "precio-desc":
      lista.sort((a, b) => b.precio - a.precio);
      break;
    case "novedades":
      lista.sort((a, b) => (b.etiqueta === "nueva") - (a.etiqueta === "nueva"));
      break;
    default:
      lista.sort((a, b) => (b.destacado === true) - (a.destacado === true));
  }

  return lista;
}

function renderizarCatalogo() {
  const grid = document.getElementById("catalog-grid");
  const contador = document.getElementById("contador-resultados");
  const vacio = document.getElementById("estado-vacio");
  if (!grid) return;

  const resultados = productosFiltrados();

  grid.innerHTML = "";
  resultados.forEach((producto) => grid.appendChild(crearTarjetaProducto(producto)));

  grid.hidden = resultados.length === 0;
  vacio.hidden = resultados.length !== 0;

  contador.textContent =
    resultados.length === 1
      ? "1 camiseta encontrada"
      : `${resultados.length} camisetas encontradas`;
}

function inicializarFiltrosMovil() {
  const panel = document.getElementById("filtros");
  const btnAbrir = document.getElementById("btn-abrir-filtros");
  const btnCerrar = document.getElementById("btn-cerrar-filtros");
  if (!panel || !btnAbrir) return;

  btnAbrir.addEventListener("click", () => {
    panel.classList.add("is-open");
    btnAbrir.setAttribute("aria-expanded", "true");
  });
  btnCerrar.addEventListener("click", () => {
    panel.classList.remove("is-open");
    btnAbrir.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  pintarFiltroLigas();
  leerFiltrosDesdeURL();
  inicializarFiltrosMovil();

  document.getElementById("buscador").addEventListener("input", (e) => {
    estadoCatalogo.texto = e.target.value;
    renderizarCatalogo();
  });

  document.getElementById("orden").addEventListener("change", (e) => {
    estadoCatalogo.orden = e.target.value;
    renderizarCatalogo();
  });

  document.getElementById("filtro-oferta").addEventListener("change", (e) => {
    estadoCatalogo.soloOferta = e.target.checked;
    renderizarCatalogo();
  });

  document.getElementById("precio-min").addEventListener("input", (e) => {
    estadoCatalogo.precioMin = e.target.value === "" ? null : parseFloat(e.target.value);
    renderizarCatalogo();
  });

  document.getElementById("precio-max").addEventListener("input", (e) => {
    estadoCatalogo.precioMax = e.target.value === "" ? null : parseFloat(e.target.value);
    renderizarCatalogo();
  });

  document.getElementById("btn-limpiar-filtros").addEventListener("click", () => {
    estadoCatalogo.ligasSeleccionadas.clear();
    estadoCatalogo.soloOferta = false;
    estadoCatalogo.precioMin = null;
    estadoCatalogo.precioMax = null;
    estadoCatalogo.texto = "";
    estadoCatalogo.orden = "relevancia";

    document.querySelectorAll("#filtro-ligas input").forEach((i) => (i.checked = false));
    document.getElementById("filtro-oferta").checked = false;
    document.getElementById("precio-min").value = "";
    document.getElementById("precio-max").value = "";
    document.getElementById("buscador").value = "";
    document.getElementById("orden").value = "relevancia";

    renderizarCatalogo();
  });

  renderizarCatalogo();
});
