/**
 * contact.js
 * -----------------------------------------------------------------------
 * El formulario envía los mensajes mediante Formspree (o un servicio
 * equivalente), un intermediario gratuito que reenvía el mensaje a tu
 * email de negocio sin que tengas que montar un backend propio y sin
 * mostrar tu email directamente en el HTML de la página.
 *
 * CÓMO CONFIGURARLO (gratis):
 *  1. Crea una cuenta en https://formspree.io con tu email de negocio.
 *  2. Crea un formulario nuevo y copia el "endpoint" que te da
 *     (algo como https://formspree.io/f/xxxxxxxx).
 *  3. Pega ese endpoint en js/config.js, en CONFIG.formEndpoint.
 *
 * Mientras no configures un endpoint real, el formulario mostrará un
 * aviso explicándolo en vez de fallar en silencio.
 * -----------------------------------------------------------------------
 */

function precargarDesdeURL() {
  const asunto = parametroURL("asunto");
  const mensaje = parametroURL("mensaje");
  const nombre = parametroURL("nombre");
  const email = parametroURL("email");

  if (asunto) {
    const select = document.getElementById("campo-asunto");
    const opcion = Array.from(select.options).find((o) => o.value === asunto);
    if (opcion) select.value = asunto;
  }
  if (mensaje) {
    document.getElementById("campo-mensaje").value = mensaje;
  }
  if (nombre) {
    document.getElementById("campo-nombre").value = nombre;
  }
  if (email) {
    document.getElementById("campo-email").value = email;
  }
}

async function enviarFormulario(evento) {
  evento.preventDefault();
  const form = evento.target;
  const feedback = document.getElementById("contacto-feedback");
  const boton = form.querySelector('button[type="submit"]');

  const endpointSinConfigurar =
    !CONFIG.formEndpoint || CONFIG.formEndpoint.includes("TU_ID_DE_FORMSPREE");

  if (endpointSinConfigurar) {
    feedback.style.display = "block";
    feedback.textContent =
      "El formulario todavía no está configurado. Añade tu endpoint de Formspree en js/config.js (ver el comentario en contact.js).";
    return;
  }

  boton.disabled = true;
  boton.textContent = "Enviando…";

  try {
    const respuesta = await fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });

    if (respuesta.ok) {
      form.reset();
      feedback.style.display = "block";
      feedback.textContent = "¡Mensaje enviado! Te responderemos lo antes posible.";
    } else {
      feedback.style.display = "block";
      feedback.textContent = "No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos.";
    }
  } catch (error) {
    feedback.style.display = "block";
    feedback.textContent = "No se pudo enviar el mensaje. Comprueba tu conexión e inténtalo de nuevo.";
  } finally {
    boton.disabled = false;
    boton.textContent = "Enviar mensaje";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  precargarDesdeURL();
  document.getElementById("form-contacto").addEventListener("submit", enviarFormulario);
});
