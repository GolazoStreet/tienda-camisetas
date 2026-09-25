/**
 * cart.js
 * -----------------------------------------------------------------------
 * Lógica del carrito de compra. Se guarda en localStorage para que no
 * se pierda al cambiar de página o recargar.
 *
 * Cada línea del carrito puede llevar, además del producto/talla/cantidad:
 *   - personalizacion: { nombre, numero } o null — nombre y número a la
 *     espalda (+precioPersonalizacion, ver config.js).
 *   - parche: true/false — parche de liga o del Mundial según el producto
 *     (+precioParche, ver config.js).
 * Dos líneas con el mismo producto y talla pero distinta personalización
 * o parche NO se combinan: se guardan como líneas separadas, cada una con
 * su propio "id" interno, para no mezclar personalizaciones distintas.
 *
 * SEGURIDAD: localStorage vive en el navegador del propio comprador y
 * solo almacena qué productos, tallas, cantidades y opciones ha elegido.
 * No es un dato sensible ni se comparte con nadie; sirve solo para que la
 * página recuerde el carrito mientras navega. En ningún caso se guardan
 * aquí datos personales, de pago ni contraseñas.
 * -----------------------------------------------------------------------
 */

const CART_STORAGE_KEY = "GolazoStreet_carrito";

/** Genera un identificador único para una línea del carrito. */
function generarIdLineaCarrito() {
  return `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Normaliza el objeto de personalización: null si no hay nombre y número. */
function normalizarPersonalizacion(personalizacion) {
  if (!personalizacion) return null;
  const nombre = (personalizacion.nombre || "").trim().toUpperCase();
  const numero = (personalizacion.numero || "").trim();
  if (!nombre || !numero) return null;
  return { nombre, numero };
}

const Carrito = {
  /** Lee el carrito guardado. Devuelve siempre un array con el formato actual (con migración de carritos antiguos). */
  obtener() {
    try {
      const datos = localStorage.getItem(CART_STORAGE_KEY);
      const carrito = datos ? JSON.parse(datos) : [];
      if (!Array.isArray(carrito)) return [];
      // Migración: rellena campos nuevos si el carrito se guardó con una versión anterior de la web.
      return carrito.map((l) => ({
        id: l.id || generarIdLineaCarrito(),
        productoId: l.productoId,
        talla: l.talla,
        cantidad: l.cantidad,
        personalizacion: normalizarPersonalizacion(l.personalizacion),
        parche: !!l.parche,
      }));
    } catch (error) {
      console.warn("No se pudo leer el carrito guardado:", error);
      return [];
    }
  },

  /** Guarda el carrito completo. */
  guardar(carrito) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
    } catch (error) {
      console.warn("No se pudo guardar el carrito:", error);
    }
    this.actualizarContador();
  },

  /**
   * Añade una línea al carrito (o suma cantidad si ya existe una línea con
   * el mismo producto, talla, personalización y parche).
   * opciones: { personalizacion: { nombre, numero } | null, parche: boolean }
   */
  añadir(productoId, talla, cantidad, opciones = {}) {
    const carrito = this.obtener();
    const cantidadSegura = Math.max(1, Math.min(99, parseInt(cantidad, 10) || 1));
    const personalizacion = normalizarPersonalizacion(opciones.personalizacion);
    const parche = !!opciones.parche;

    const existente = carrito.find(
      (l) =>
        l.productoId === productoId &&
        l.talla === talla &&
        l.parche === parche &&
        JSON.stringify(l.personalizacion) === JSON.stringify(personalizacion)
    );

    if (existente) {
      existente.cantidad = Math.min(99, existente.cantidad + cantidadSegura);
    } else {
      carrito.push({
        id: generarIdLineaCarrito(),
        productoId,
        talla,
        cantidad: cantidadSegura,
        personalizacion,
        parche,
      });
    }

    this.guardar(carrito);
    return carrito;
  },

  /** Cambia la cantidad de una línea concreta, identificada por su id. */
  actualizarCantidad(lineaId, cantidad) {
    const carrito = this.obtener();
    const linea = carrito.find((l) => l.id === lineaId);
    if (!linea) return carrito;

    linea.cantidad = Math.max(1, Math.min(99, parseInt(cantidad, 10) || 1));
    this.guardar(carrito);
    return carrito;
  },

  /** Elimina una línea del carrito, identificada por su id. */
  eliminar(lineaId) {
    const carrito = this.obtener().filter((l) => l.id !== lineaId);
    this.guardar(carrito);
    return carrito;
  },

  /** Vacía el carrito por completo. */
  vaciar() {
    this.guardar([]);
  },

  /** Número total de unidades (camisetas) en el carrito. */
  totalUnidades() {
    return this.obtener().reduce((suma, l) => suma + l.cantidad, 0);
  },

  /** Devuelve las líneas del carrito ya combinadas con los datos del producto. */
  lineasConDatos() {
    return this.obtener()
      .map((linea) => {
        const producto = typeof obtenerProductoPorId === "function" ? obtenerProductoPorId(linea.productoId) : null;
        if (!producto) return null;
        return { ...linea, producto };
      })
      .filter(Boolean);
  },

  /** Precio de una unidad de una línea, incluyendo personalización y parche si los tiene. */
  precioUnidad(linea) {
    let precio = linea.producto.precio;
    const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
    if (linea.personalizacion) precio += cfg.precioPersonalizacion || 0;
    if (linea.parche) precio += cfg.precioParche || 0;
    return precio;
  },

  /** Precio total de una línea (precio unidad × cantidad). */
  precioLinea(linea) {
    return this.precioUnidad(linea) * linea.cantidad;
  },

  /** Calcula el subtotal en euros de todo el carrito (camisetas + personalización + parches, sin envío). */
  subtotal() {
    return this.lineasConDatos().reduce((suma, l) => suma + this.precioLinea(l), 0);
  },

  /** Actualiza el contador numérico del icono del carrito en el header, si existe. */
  actualizarContador() {
    const contadores = document.querySelectorAll("[data-cart-count]");
    const total = this.totalUnidades();
    contadores.forEach((el) => {
      el.textContent = total;
      el.style.display = total > 0 ? "flex" : "none";
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  Carrito.actualizarContador();
});
