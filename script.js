// Aqui guardo la dirección base de la API
const API_BASE = "https://dog.ceo/api";

const foto = document.getElementById("foto");
const cargando = document.getElementById("cargando");
const textoRaza = document.getElementById("raza");
const textoError = document.getElementById("error");
const botonNuevo = document.getElementById("botonNuevo");
const selectorRaza = document.getElementById("selectorRaza");

function construirUrl(raza) {
  // Si no se elige raza, pido una foto de cualquier perro
  if (!raza) return `${API_BASE}/breeds/image/random`;

  return `${API_BASE}/breed/${raza}/images/random`;
}

function obtenerRazaDesdeUrl(url) {
  const partes = url.split("/");
  const indice = partes.indexOf("breeds");
  if (indice === -1) return "Perro misterioso";

  const [raza, subraza] = partes[indice + 1].split("-");
  return subraza ? `${subraza} ${raza}` : raza;
}

// Esta es la función principal: para llamar a la API 
async function obtenerPerro() {
  botonNuevo.disabled = true;
  cargando.classList.remove("oculto");
  foto.classList.remove("visible");
  textoError.textContent = "";

  try {
    const respuesta = await fetch(construirUrl(selectorRaza.value));

    // repuesta de error si la API no responde correctamente (por ejemplo, 404)
    if (!respuesta.ok) throw new Error(`El servidor respondió con código ${respuesta.status}`);

    const datos = await respuesta.json();

    if (datos.status !== "success") throw new Error("La API no devolvió una imagen");

    await cargarImagen(datos.message);

    foto.src = datos.message;
    foto.alt = `Foto de un perro de raza ${obtenerRazaDesdeUrl(datos.message)}`;
    foto.classList.add("visible");
    textoRaza.textContent = obtenerRazaDesdeUrl(datos.message);
  } catch (error) {
    console.error(error);
    textoRaza.textContent = "";
    textoError.textContent = "No pude cargar la imagen. Revisa tu conexión e inténtalo de nuevo.";
  } finally {
    cargando.classList.add("oculto");
    botonNuevo.disabled = false;
  }
}

function cargarImagen(url) {
  return new Promise((resolver, rechazar) => {
    const temporal = new Image();
    temporal.onload = resolver;
    temporal.onerror = () => rechazar(new Error("No se pudo descargar la imagen"));
    temporal.src = url;
  });
}

async function cargarRazas() {
  try {
    const respuesta = await fetch(`${API_BASE}/breeds/list/all`);
    const datos = await respuesta.json();

    Object.entries(datos.message).forEach(([raza, subrazas]) => {
      if (subrazas.length === 0) {
        agregarOpcion(raza, raza);
      } else {
        // Cada sub-raza la agrego como opción separada
        subrazas.forEach(sub => agregarOpcion(`${raza}/${sub}`, `${sub} ${raza}`));
      }
    });
  } catch (error) {
    console.warn("No pude cargar la lista de razas:", error);
  }
}

function agregarOpcion(valor, texto) {
  const opcion = document.createElement("option");
  opcion.value = valor;
  opcion.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
  selectorRaza.appendChild(opcion);
}

botonNuevo.addEventListener("click", obtenerPerro);

selectorRaza.addEventListener("change", obtenerPerro);

// Al cargar la página, muestro el primer perro y lleno el selector de razas
obtenerPerro();
cargarRazas();
