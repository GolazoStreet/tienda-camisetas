/**
 * home.js — Rellena la portada (index.html) con datos de products-data.js
 * (las tarjetas de producto se generan con product-render.js, compartido
 * con productos.html)
 */

function pintarLigas() {
  const grid = document.getElementById("league-grid");
  if (!grid) return;

  grid.innerHTML = "";
  LIGAS.forEach((liga, i) => {
    const numProductos = PRODUCTOS.filter((p) => p.liga === liga.id).length;
    const a = document.createElement("a");
    a.href = `productos.html?liga=${encodeURIComponent(liga.id)}`;
    a.className = "league-card";
    a.innerHTML = `
      <span class="league-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <strong>${escaparHTML(liga.nombre)}</strong>
      <span>${numProductos} ${numProductos === 1 ? "modelo" : "modelos"}</span>
    `;
    grid.appendChild(a);
  });
}

function pintarDestacados() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;

  const destacados = PRODUCTOS.filter((p) => p.destacado).slice(0, 12);
  grid.innerHTML = "";
  destacados.forEach((producto) => grid.appendChild(crearTarjetaProducto(producto)));
}

document.addEventListener("DOMContentLoaded", () => {
  pintarLigas();
  pintarDestacados();

  const statEl = document.querySelector("[data-stat-productos]");
  if (statEl) statEl.textContent = PRODUCTOS.length;
});
