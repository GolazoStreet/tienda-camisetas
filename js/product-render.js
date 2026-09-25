/**
 * product-render.js — Renderiza tarjetas de producto (compartido entre
 * index.html y productos.html) para no duplicar el HTML de la tarjeta
 * en dos sitios distintos.
 */

function pintarTagProducto(producto) {
  if (producto.etiqueta === "nueva") return '<span class="tag tag--new">Nueva</span>';
  if (producto.etiqueta === "oferta") return '<span class="tag tag--sale">Oferta</span>';
  if (producto.etiqueta === "mas-vendida") return '<span class="tag tag--best">Más vendida</span>';
  return "";
}

function pintarPrecio(producto) {
  let html = `<span class="price-now">${formatearPrecio(producto.precio)}</span>`;
  if (producto.precioAnterior) {
    const descuento = Math.round(
      ((producto.precioAnterior - producto.precio) / producto.precioAnterior) * 100
    );
    html += `<span class="price-before">${formatearPrecio(producto.precioAnterior)}</span>`;
    html += `<span class="price-discount">-${descuento}%</span>`;
  }
  return html;
}

function crearTarjetaProducto(producto) {
const imgFrontal = fuenteImagenProducto(producto, 1);
const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <a href="producto.html?id=${encodeURIComponent(producto.id)}" class="product-media" aria-label="Ver ${escaparHTML(producto.equipo)}">
      <div class="product-tags">${pintarTagProducto(producto)}</div>
      <img src="${imgFrontal.src}" onerror="${imgFrontal.onerror}" alt="Camiseta ${escaparHTML(producto.equipo)} — ${escaparHTML(producto.nombre)}" loading="lazy" width="300" height="340" />    </a>
    <div class="product-body">
      ${mostrarEtiquetaLiga(producto.liga) ? `<span class="product-league">${escaparHTML(nombreLiga(producto.liga))}</span>` : ""}
      <h3><a href="producto.html?id=${encodeURIComponent(producto.id)}">${escaparHTML(producto.equipo)}</a></h3>
      <span class="product-name">${escaparHTML(producto.nombre)}</span>
      <div class="price-row">${pintarPrecio(producto)}</div>
    </div>
    <a href="producto.html?id=${encodeURIComponent(producto.id)}" class="btn btn-dark btn-block btn-sm">Ver camiseta</a>
  `;
  return article;
}
