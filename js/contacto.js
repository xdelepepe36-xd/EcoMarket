/*=====================================================
    CONTACTO.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const formulario = document.getElementById("form-contacto");

const inputNombre = document.getElementById("nombre");

const inputCorreo = document.getElementById("correo");

const inputAsunto = document.getElementById("asunto");

const inputMensaje = document.getElementById("mensaje");
/*=====================================================
    2. VALIDAR FORMULARIO
======================================================*/

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        const nombre = inputNombre.value.trim();

        const correo = inputCorreo.value.trim();

        const asunto = inputAsunto.value.trim();

        const mensaje = inputMensaje.value.trim();

        if(nombre === "" ||

           correo === "" ||

           asunto === "" ||

           mensaje === ""){

            mostrarToast("⚠ Completa todos los campos.");

            return;

        }

        if(!correo.includes("@")){

            mostrarToast("⚠ Ingresa un correo válido.");

            return;

        }
        /*=====================================================
    3. ENVIAR MENSAJE
======================================================*/

        const contacto = {

            nombre:nombre,

            correo:correo,

            asunto:asunto,

            mensaje:mensaje,

            fecha:new Date().toLocaleString()

        };

        localStorage.setItem(

            "ultimoContacto",

            JSON.stringify(contacto)

        );

        mostrarToast("✅ Mensaje enviado correctamente.");
        /*=====================================================
    4. LIMPIAR Y FINALIZAR
======================================================*/

        formulario.reset();

        setTimeout(function(){

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        },1000);

    });

}   
/*=====================================================
    5. TOAST (NOTIFICACIONES)
======================================================*/

function mostrarToast(mensaje){

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = mensaje;

    document.body.appendChild(toast);

    setTimeout(function(){

        toast.classList.add("mostrar");

    },100);

    setTimeout(function(){

        toast.classList.remove("mostrar");

        setTimeout(function(){

            toast.remove();

        },300);

    },2500);

}
/*=====================================================
    6. INICIALIZACIÓN
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Contacto cargado correctamente");

    console.log("====================================");

    inputNombre.focus();

});
/*=====================================================
    7. CARGAR ÚLTIMO MENSAJE
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    const ultimoContacto = JSON.parse(

        localStorage.getItem("ultimoContacto")

    );

    if(ultimoContacto){

        console.log(

            "Último mensaje enviado:",

            ultimoContacto

        );

    }

});
/*=====================================================
    8. ANIMACIÓN DEL FORMULARIO
======================================================*/

window.addEventListener("load", function(){

    const tarjeta = document.querySelector(".contacto2-card");

    const informacion = document.querySelector(".contacto2-info");

    if(tarjeta){

        tarjeta.style.opacity = "0";

        tarjeta.style.transform = "translateY(30px)";

        setTimeout(function(){

            tarjeta.style.transition = "all .6s ease";

            tarjeta.style.opacity = "1";

            tarjeta.style.transform = "translateY(0)";

        },100);

    }

    if(informacion){

        informacion.style.opacity = "0";

        informacion.style.transform = "translateY(30px)";

        setTimeout(function(){

            informacion.style.transition = "all .6s ease";

            informacion.style.opacity = "1";

            informacion.style.transform = "translateY(0)";

        },250);

    }

});
/*=====================================================
    9. LIMPIAR FORMULARIO
======================================================*/

function limpiarFormulario(){

    formulario.reset();

    inputNombre.focus();

}
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Contacto cargado correctamente");

    console.log("====================================");

});