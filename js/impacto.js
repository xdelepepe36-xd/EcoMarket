/*=====================================================
    IMPACTO.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const contadorArboles =

document.getElementById("contador-arboles");

const contadorCO2 =

document.getElementById("contador-co2");

const contadorProductos =

document.getElementById("contador-productos");

const contadorUsuarios =

document.getElementById("contador-usuarios");

/*=====================================================
    2. VALORES OBJETIVO
======================================================*/

const objetivos = {

    arboles:327,

    co2:852,

    productos:1180,

    usuarios:1560

};
/*=====================================================
    3. FUNCIÓN CONTADOR
======================================================*/

function animarContador(

    elemento,

    objetivo,

    sufijo=""

){

    let valor = 0;

    const incremento =

    Math.ceil(objetivo/100);

    const intervalo =

    setInterval(function(){

        valor += incremento;

        if(valor >= objetivo){

            valor = objetivo;

            clearInterval(intervalo);

        }

        elemento.textContent =

        valor + sufijo;

    },20);

}
/*=====================================================
    4. INICIAR CONTADORES
======================================================*/

function iniciarContadores(){

    animarContador(

        contadorArboles,

        objetivos.arboles

    );

    animarContador(

        contadorCO2,

        objetivos.co2,

        " kg"

    );

    animarContador(

        contadorProductos,

        objetivos.productos

    );

    animarContador(

        contadorUsuarios,

        objetivos.usuarios

    );

}
/*=====================================================
    5. CARGA DE LA PÁGINA
======================================================*/

window.addEventListener(

    "DOMContentLoaded",

    function(){

        iniciarContadores();

        console.clear();

        console.log("====================================");

        console.log("       EcoMarket 2.0");

        console.log(" Impacto Ambiental cargado");

        console.log("====================================");

    }

);
/*=====================================================
    6. BARRA DE PROGRESO
======================================================*/

function actualizarMetas(){

    const metas = document.querySelectorAll(".meta-card");

    metas.forEach(function(meta,index){

        meta.style.opacity = "0";

        setTimeout(function(){

            meta.style.transition = ".6s";

            meta.style.opacity = "1";

            meta.style.transform = "translateY(0)";

        },index*200);

    });

}
/*=====================================================
    7. ANIMACIÓN AL HACER SCROLL
======================================================*/

window.addEventListener("scroll",function(){

    const tarjetas = document.querySelectorAll(

        ".beneficio-card,.estadistica-card,.meta-card"

    );

    tarjetas.forEach(function(card){

        const posicion = card.getBoundingClientRect().top;

        const pantalla = window.innerHeight;

        if(posicion < pantalla-100){

            card.classList.add("visible");

        }

    });

});
/*=====================================================
    8. MENSAJE ECOLÓGICO
======================================================*/

const mensajes = [

    "🌱 Cada reutilización cuenta.",

    "♻️ Juntos reducimos los residuos.",

    "🌍 Gracias por cuidar el planeta.",

    "💚 EcoMarket construye un futuro sostenible."

];

console.log(

    mensajes[

        Math.floor(

            Math.random()*mensajes.length

        )

    ]

);
/*=====================================================
    9. EFECTOS ADICIONALES
======================================================*/

document.querySelectorAll(

    ".beneficio-card,.meta-card"

).forEach(function(card){

    card.addEventListener("mouseenter",function(){

        this.style.transform="scale(1.03)";

    });

    card.addEventListener("mouseleave",function(){

        this.style.transform="scale(1)";

    });

});
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("beforeunload",function(){

    console.log(

        "Cerrando Impacto Ambiental..."

    );

});