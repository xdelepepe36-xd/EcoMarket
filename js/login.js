/*=====================================================
    LOGIN.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const formulario = document.getElementById("form-login");

const inputCorreo = document.getElementById("correo");

const inputPassword = document.getElementById("password");

const checkRecordarme = document.getElementById("recordarme");
/*=====================================================
    2. CARGAR DATOS GUARDADOS
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    const correoGuardado = localStorage.getItem("correoRecordado");

    if(correoGuardado){

        inputCorreo.value = correoGuardado;

        checkRecordarme.checked = true;

    }

});
/*=====================================================
    3. VALIDAR FORMULARIO
======================================================*/

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        const correo = inputCorreo.value.trim();

        const password = inputPassword.value.trim();

        if(correo === "" || password === ""){

            mostrarToast("⚠ Completa todos los campos.");

            return;

        }

        if(!correo.includes("@")){

            mostrarToast("⚠ Ingresa un correo válido.");

            return;

        }

        if(password.length < 6){

            mostrarToast("⚠ La contraseña debe tener al menos 6 caracteres.");

            return;

        }
        /*=====================================================
    4. INICIAR SESIÓN
======================================================*/

        if(checkRecordarme.checked){

            localStorage.setItem(

                "correoRecordado",

                correo

            );

        }

        else{

            localStorage.removeItem("correoRecordado");

        }

        const usuario = {

            nombre:"Usuario EcoMarket",

            correo:correo,

            foto:"img/avatar.png"

        };

        localStorage.setItem(

            "usuario",

            JSON.stringify(usuario)

        );

        mostrarToast("✅ Inicio de sesión correcto.");

        setTimeout(function(){

            window.location.href = "perfil.html";

        },1500);

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
    6. VERIFICAR SESIÓN
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    const usuario = JSON.parse(

        localStorage.getItem("usuario")

    );

    if(usuario){

        console.log("Usuario conectado:", usuario.nombre);

    }

    else{

        console.log("No hay sesión iniciada.");

    }

});
/*=====================================================
    7. MOSTRAR / OCULTAR CONTRASEÑA
======================================================*/

const btnMostrarPassword = document.getElementById("mostrar-password");

if(btnMostrarPassword){

    btnMostrarPassword.addEventListener("click", function(){

        if(inputPassword.type === "password"){

            inputPassword.type = "text";

            this.textContent = "Ocultar";

        }

        else{

            inputPassword.type = "password";

            this.textContent = "Mostrar";

        }

    });

}
/*=====================================================
    9. LIMPIAR FORMULARIO
======================================================*/

function limpiarFormulario(){

    formulario.reset();

    inputPassword.type = "password";

    if(btnMostrarPassword){

        btnMostrarPassword.textContent = "Mostrar";

    }

}
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Login cargado correctamente");

    console.log("====================================");

});