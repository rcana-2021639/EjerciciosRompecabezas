// ===============================
// VARIABLES PRINCIPALES Y ELEMENTOS DEL DOM
// ===============================

// Contenedor principal del puzzle
let puzzleContainer = document.getElementById("puzzle");
// Elemento para mostrar mensajes al usuario
let mensaje = document.getElementById("mensaje");
// Elemento del temporizador (cronómetro)
let cronometroElem = document.getElementById("cronometro");
// Elementos del popup de mensaje (cuando ganas o pierdes)
let popup = document.getElementById("popup-mensaje");
let popupContenido = document.getElementById("popup-contenido");
let btnSiguiente = document.getElementById("btn-siguiente");
let btnCerrar = document.getElementById("btn-cerrar");

// Variables de control de nivel y dimensiones del puzzle
let nivel = 2; // Nivel inicial (2x2)
let filas = 2; // Número de filas del puzzle
let columnas = 2; // Número de columnas del puzzle
let maxNivel = 5; // Nivel máximo permitido

// Variables para el temporizador y el estado del juego
let temporizador = null; // Referencia al setInterval del temporizador
let tiempoRestante = 300; // Tiempo total por nivel en segundos (5 minutos)
let juegoIniciado = false; // Indica si el juego ya comenzó (para iniciar el temporizador solo al primer movimiento)

// ===============================
// FUNCIONES PRINCIPALES DEL JUEGO
// ===============================

/**
 * Genera el arreglo de piezas para el nivel actual.
 * El último elemento es "vacio" (espacio vacío para mover piezas).
 * @param {number} n - Tamaño del puzzle (n x n)
 * @returns {Array} - Arreglo de nombres de archivos de imagen y "vacio"
 */
function piezasPorNivel(n) {
    let total = n * n;
    let arr = [];
    for (let i = 1; i < total; i++) {
        arr.push(`split${n}x${n}-${i}.png`);
    }
    arr.push("vacio");
    return arr;
}

// Arreglo con el orden correcto de las piezas para el nivel actual
let piezas = piezasPorNivel(nivel);
// Estado actual del puzzle (arreglo de piezas mezcladas)
let estado = [];

/**
 * Controla el temporizador del juego.
 * Si reset=true, reinicia el temporizador y el cronómetro visual.
 * Si no, inicia el temporizador y actualiza el cronómetro cada segundo.
 * Cuando el tiempo llega a 0, muestra el popup de "perdiste".
 * @param {boolean} reset 
 */
function actualizarTemporizador(reset = false) {
    if (reset) {
        clearInterval(temporizador);
        temporizador = null;
        tiempoRestante = 300;
        juegoIniciado = false;
        cronometroElem.textContent = "05:00";
        return;
    }
    if (temporizador) return;
    temporizador = setInterval(() => {
        tiempoRestante--;
        const min = String(Math.floor(tiempoRestante / 60)).padStart(2, "0");
        const seg = String(tiempoRestante % 60).padStart(2, "0");
        cronometroElem.textContent = `${min}:${seg}`;
        if (tiempoRestante <= 0) {
            juegoIniciado = false;
            clearInterval(temporizador);
            temporizador = null;
            cronometroElem.textContent = "00:00";
            if (nivel >= 3) {
                mostrarPopupOpcionesTiempoExtra();
            } else {
                mostrarPopup(" NO  AS  PODIDO  VENCER  A  ESTE  JEFE  GALLO", false);
            }
        }
    }, 1000);
}

/**
 * Mezcla aleatoriamente un arreglo (Fisher-Yates shuffle).
 * Se usa para desordenar las piezas del puzzle al iniciar/reiniciar.
 * @param {Array} array 
 * @returns {Array} - Arreglo mezclado
 */
function mezclar(array) {
    let copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

/**
 * Dibuja el estado actual del puzzle en el DOM.
 * Crea los divs de cada celda y les asigna la imagen o el espacio vacío.
 */
function dibujar() {
    puzzleContainer.innerHTML = "";
    estado.forEach((valor, i) => {
        let celda = document.createElement("div");
        celda.classList.add("celda");
        if (valor === "vacio") {
            celda.classList.add("vacio");
        } else {
            let img = document.createElement("img");
            img.src = "Images/" + valor;
            img.alt = valor;
            img.style.width = "100%";
            img.style.height = "100%";
            celda.appendChild(img);
            // Al hacer click en una pieza, intenta moverla
            celda.addEventListener("click", () => mover(i));
        }
        puzzleContainer.appendChild(celda);
    });
}

/**
 * Intenta mover una pieza seleccionada.
 * Si es adyacente al espacio vacío, la mueve.
 * Al primer movimiento, inicia el temporizador.
 * @param {number} indice - Índice de la pieza seleccionada
 */
function mover(indice) {
    if (!juegoIniciado) {
        juegoIniciado = true;
        actualizarTemporizador();
    }

    let vacio = estado.indexOf("vacio");
    let col = indice % columnas;
    let fila = Math.floor(indice / columnas);
    let colVacio = vacio % columnas;
    let filaVacio = Math.floor(vacio / columnas);

    // Solo permite mover piezas adyacentes al vacío (arriba, abajo, izquierda, derecha)
    if (
        (Math.abs(col - colVacio) === 1 && fila === filaVacio) ||
        (Math.abs(fila - filaVacio) === 1 && col === colVacio)
    ) {
        [estado[indice], estado[vacio]] = [estado[vacio], estado[indice]];
        dibujar();
        verificar();
    }
}

/**
 * Verifica si el puzzle está resuelto (todas las piezas en orden).
 * Si es así, detiene el temporizador y muestra el popup de "ganaste".
 */
function verificar() {
    if (JSON.stringify(estado) === JSON.stringify(piezas)) {
        juegoIniciado = false;
        clearInterval(temporizador);
        temporizador = null;
        if (nivel === 5) {
            // Oculta el puzzle y la imagen de referencia, muestra el mensaje final
            document.getElementById("final-container").classList.remove("oculto");
            document.querySelector(".puzzle-container").classList.add("oculto");
            document.querySelector(".imagen-referencia-container").classList.add("oculto"); // OCULTA LA IMAGEN DE REFERENCIA
            mensaje.innerText = "";
        } else {
            mostrarPopup("HAS  LOGRADO  VENCER  A  ESTE  JEFE  GALLO<br> <br>EL  SIGUIENTE  JEFE  ES  MAS  PODEROSO", true);
            mensaje.innerText = "¡Nivel completado!";
        }
    }
}

/**
 * Muestra el popup de mensaje (ganaste/perdiste).
 * @param {string} texto - Mensaje a mostrar
 * @param {boolean} gano - Si es true, muestra el botón de siguiente nivel
 */
function mostrarPopup(texto, gano) {
    popupContenido.innerHTML = texto;
    popup.classList.remove("oculto");
    btnSiguiente.style.display = gano && nivel < maxNivel ? "inline-block" : "none";
    btnCerrar.style.display = "inline-block";
}

/**
 * Muestra el popup con opciones de tiempo extra al perder.
 * @param {string} texto - Mensaje a mostrar
 * @param {boolean} gano - Si es true, muestra el botón de siguiente nivel
 */
function mostrarPopupOpcionesTiempoExtra() {
    popupContenido.innerHTML = `
        <div style="text-align:center;">
            <p>NO HAS PODIDO PASAR EL NIVEL.<br>¿Qué deseas hacer?</p>
            <button id="btn-reiniciar-nivel" class="golden-button" style="margin:10px;">Empezar desde el 2x2</button>
            <button id="btn-tiempo-extra" class="golden-button" style="margin:10px;">Tiempo extra</button>
        </div>
    `;
    popup.classList.remove("oculto");
    btnSiguiente.style.display = "none";
    btnCerrar.style.display = "inline-block";

    document.getElementById("btn-reiniciar-nivel").onclick = function() {
        nivel = 2;
        filas = nivel;
        columnas = nivel;
        piezas = piezasPorNivel(nivel);
        reiniciar();
        actualizarGrid();
        mensaje.innerText = "";
        popup.classList.add("oculto");
    };

    document.getElementById("btn-tiempo-extra").onclick = function() {
        mostrarPreguntasTiempoExtra();
    };
}

/**
 * Actualiza la imagen de referencia según el nivel actual.
 */
function actualizarReferencia() {
    let refImg = document.getElementById("imagen-referencia");
    refImg.src = `Images/ref${filas}x${columnas}.jpg`;
}

/**
 * Muestra las preguntas para obtener tiempo extra al usuario.
 * Se llama desde mostrarPopupOpcionesTiempoExtra().
 */
function mostrarPreguntasTiempoExtra() {
    // Preguntas y respuestas
    const preguntas = [
        {
            imagen: "Images/elijepibe.jpeg",
            pregunta: "Que prefires???",
            opciones: ["estar con la mujer que tu deseas pero que tenga chile", "que estes con la mujer que tu mas deses peroq ue no se te pare"],
            correcta: 1 // "9"
        },
        {
            imagen: "Images/eligepibe.jpeg",
            pregunta: "Que prefieres ???",
            opciones: ["de cara hermosa pero tabla ", "cuerpo perfecto pero fea"],
            correcta: 0 // "Gallo"
        }
    ];

    let actual = 0;

    function mostrarPregunta(idx) {
        const p = preguntas[idx];
        document.getElementById("popup-contenido-preguntas").innerHTML = `
            <img src="${p.imagen}" alt="Pregunta">
            <div class="pregunta-titulo">${p.pregunta}</div>
            <div class="opciones-pregunta">
                ${p.opciones.map((op, i) => `<button class="golden-button" data-opcion="${i}">${op}</button>`).join('')}
            </div>
        `;
        document.querySelectorAll('.opciones-pregunta button').forEach(btn => {
            btn.onclick = function() {
                // Cualquier opción es correcta
                if (idx + 1 < preguntas.length) {
                    mostrarPregunta(idx + 1);
                } else {
                    tiempoRestante = 300;
                    cronometroElem.textContent = "05:00";
                    actualizarTemporizador(true);
                    actualizarTemporizador();
                    document.getElementById("popup-preguntas").classList.add("oculto");
                }
            };
        });
    }

    mostrarPregunta(actual);
    // Muestra el popup de preguntas y oculta el popup principal
    document.getElementById("popup-preguntas").classList.remove("oculto");
    popup.classList.add("oculto");
}

// Cerrar el popup de preguntas
document.getElementById("btn-cerrar-preguntas").onclick = function() {
    document.getElementById("popup-preguntas").classList.add("oculto");
    mostrarPopupOpcionesTiempoExtra();
};

// ===============================
// EVENTOS DE LOS BOTONES DEL POPUP
// ===============================

/**
 * Botón para pasar al siguiente nivel.
 * Sube el nivel, ajusta filas/columnas, reinicia el juego y oculta el popup.
 */
btnSiguiente.onclick = function() {
    if (nivel < maxNivel) {
        nivel++;
        filas = nivel;
        columnas = nivel;
        piezas = piezasPorNivel(nivel);
        popup.classList.add("oculto");
        reiniciar();
        actualizarGrid();
        mensaje.innerText = "";
    }
};

/**
 * Botón para cerrar el popup.
 * Si no se avanza de nivel, solo oculta el popup y muestra un mensaje.
 */
btnCerrar.onclick = function() {
    popup.classList.add("oculto");
    if (nivel > 1 && btnSiguiente.style.display === "inline-block") {
        mensaje.innerText = "Puedes seguir jugando este nivel.";
    }
};

// ===============================
// FUNCIONES DE REINICIO Y AJUSTE DE GRID
// ===============================

/**
 * Reinicia el juego: mezcla las piezas, reinicia el temporizador, actualiza la referencia y oculta el popup.
 */
function reiniciar(){
    // Oculta el mensaje final y muestra el puzzle si estaba oculto
    document.getElementById("final-container").classList.add("oculto");
    document.querySelector(".puzzle-container").classList.remove("oculto");
    document.querySelector(".imagen-referencia-container").classList.remove("oculto"); // MUESTRA LA IMAGEN DE REFERENCIA
    juegoIniciado = false;
    estado = mezclar(piezas);
    mensaje.innerText = "";
    dibujar();
    actualizarGrid();
    actualizarReferencia();
    actualizarTemporizador(true);
    popup.classList.add("oculto");
}

/**
 * Ajusta el grid del puzzle según el nivel actual.
 * También actualiza el título del nivel.
 */
function actualizarGrid() {
    puzzleContainer.style.gridTemplateColumns = `repeat(${columnas}, 150px)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${filas}, 110px)`;
    document.querySelector("h2").textContent = `🐔🐔GALLOS TITANICOS🐔🐔 ${filas}x${columnas} (Nivel ${nivel})`;
}

// ===============================
// INICIALIZACIÓN DEL JUEGO AL CARGAR LA PÁGINA
// ===============================

// Llama a reiniciar para preparar el primer nivel al cargar
reiniciar();

// ===============================
// BOTÓN NEXT PARA CAMBIAR DE NIVEL MANUALMENTE
// ===============================
document.getElementById("btn-next").onclick = function(event) {
    event.preventDefault(); // Evita que el enlace recargue la página
    // Avanza al siguiente nivel, o vuelve al 2x2 si ya está en el último
    if (nivel < maxNivel) {
        nivel++;
    } else {
        nivel = 2;
    }
    filas = nivel;
    columnas = nivel;
    piezas = piezasPorNivel(nivel);
    reiniciar();
    actualizarGrid();
    mensaje.innerText = "";
};

// ===============================
// BOTÓN INVISIBLE: ARMA EL PUZZLE AUTOMÁTICAMENTE
// ===============================
document.getElementById("btn-invisible").onclick = function() {
    // Ordena el estado del puzzle para que quede resuelto
    estado = [...piezas];
    dibujar();
    verificar();
};


