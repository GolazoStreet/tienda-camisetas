/**
 * jersey-svg.js
 * -----------------------------------------------------------------------
 * Genera ilustraciones de camisetas en SVG, en el propio navegador.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO:
 * No se puede usar fotografías reales de camisetas de clubes con marca
 * registrada sin autorización, así que esta tienda de demostración usa
 * ilustraciones vectoriales genéricas generadas por código en vez de
 * fotos. Cuando tengas tus propias fotografías, sustituye las rutas en
 * "products-data.js" por las de tus imágenes reales (ver README.md).
 * -----------------------------------------------------------------------
 */

/**
 * Crea el marcado SVG de una camiseta.
 * @param {Object} opts
 * @param {string} opts.principal   Color principal (hex)
 * @param {string} opts.secundario  Color de detalles/cuello/puños (hex)
 * @param {number} opts.numero      Número de dorsal
 * @param {"frontal"|"trasera"} opts.vista
 * @param {"liso"|"rayas"|"bandas"} [opts.patron]
 * @param {string} [opts.iniciales] Iniciales del equipo (vista trasera)
 * @returns {string} marcado SVG completo
 */
function crearCamisetaSVG(opts) {
  const {
    principal = "#1b4332",
    secundario = "#ffffff",
    numero = 10,
    vista = "frontal",
    patron = "liso",
    iniciales = "FC",
  } = opts;

  let patronMarkup = "";
  if (patron === "rayas") {
    let rects = "";
    for (let x = 78; x <= 210; x += 22) {
      rects += `<rect x="${x}" y="72" width="11" height="216" fill="${secundario}" opacity="0.85" />`;
    }
    patronMarkup = `<g clip-path="url(#torsoClip)">${rects}</g>`;
  } else if (patron === "bandas") {
    patronMarkup = `<g clip-path="url(#torsoClip)"><rect x="130" y="70" width="40" height="220" fill="${secundario}" opacity="0.9" /></g>`;
  }

  const contenidoTrasero =
    vista === "trasera"
      ? `
    <text x="150" y="150" text-anchor="middle" font-family="Anton, sans-serif" font-size="22" fill="${secundario}" letter-spacing="2">${escaparTexto(
          iniciales
        ).toUpperCase()}</text>
    <text x="150" y="235" text-anchor="middle" font-family="Anton, sans-serif" font-size="86" fill="${secundario}">${numero}</text>
  `
      : `
    <circle cx="108" cy="112" r="16" fill="none" stroke="${secundario}" stroke-width="3" opacity="0.9" />
    <path d="M100 116 L108 100 L116 116 Z" fill="${secundario}" opacity="0.9" />
  `;

  return `
<svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustración de camiseta de fútbol">
  <defs>
    <clipPath id="torsoClip">
      <rect x="70" y="70" width="160" height="220" rx="18" />
    </clipPath>
  </defs>

  <ellipse cx="150" cy="315" rx="95" ry="14" fill="#0f2818" opacity="0.06" />

  <!-- Mangas -->
  <polygon points="70,78 16,102 34,166 72,150" fill="${principal}" stroke="#0f2818" stroke-opacity="0.12" stroke-width="2" />
  <polygon points="230,78 284,102 266,166 228,150" fill="${principal}" stroke="#0f2818" stroke-opacity="0.12" stroke-width="2" />
  <rect x="18" y="150" width="20" height="14" rx="3" fill="${secundario}" />
  <rect x="262" y="150" width="20" height="14" rx="3" fill="${secundario}" />

  <!-- Torso -->
  <rect x="70" y="70" width="160" height="220" rx="18" fill="${principal}" stroke="#0f2818" stroke-opacity="0.12" stroke-width="2" />
  ${patronMarkup}

  <!-- Cuello -->
  <path d="M120 70 L150 100 L180 70" fill="none" stroke="${secundario}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Bajo -->
  <rect x="70" y="278" width="160" height="12" fill="${secundario}" opacity="0.9" />

  ${contenidoTrasero}
</svg>`.trim();
}

/** Convierte el SVG en una URL de datos utilizable como src de <img>. */
function svgADataURI(svgMarkup) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svgMarkup);
}

const EXTENSION_FOTOS = "jpg";

function rutaFotoReal(producto, indice) {
  return `assets/images/${producto.id}-${indice}.${EXTENSION_FOTOS}`;
}

function fuenteImagenProducto(producto, indice) {
  if (Array.isArray(producto.imagenes) && producto.imagenes[indice - 1]) {
    return { src: producto.imagenes[indice - 1], onerror: "" };
  }

  const base = {
    principal: producto.colorPrincipal,
    secundario: producto.colorSecundario,
    numero: producto.numero,
    patron: producto.patron || "liso",
    iniciales: producto.iniciales || producto.equipo.slice(0, 3),
    vista: indice === 1 ? "frontal" : "trasera",
  };
  const respaldo = svgADataURI(crearCamisetaSVG(base));

  return {
    src: rutaFotoReal(producto, indice),
    onerror: `this.onerror=null;this.src='${respaldo}'`,
  };
}

function escaparTexto(str) {
  return String(str).replace(/[&<>"']/g, (c) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[c];
  });
}

