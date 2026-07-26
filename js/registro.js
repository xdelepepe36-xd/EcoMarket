/*=====================================================
    REGISTRO.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const formulario = document.getElementById("form-registro");

const inputNombre = document.getElementById("nombre");

const inputCorreo = document.getElementById("correo");

const inputPassword = document.getElementById("password");

const inputConfirmar = document.getElementById("confirmar-password");

const checkTerminos = document.getElementById("terminos");

const btnMostrarPassword = document.getElementById("mostrar-password");
/*=====================================================
    2. MOSTRAR / OCULTAR CONTRASEÑA
======================================================*/

if(btnMostrarPassword){

    btnMostrarPassword.addEventListener("click", function(){

        if(inputPassword.type === "password"){

            inputPassword.type = "text";

            inputConfirmar.type = "text";

            this.textContent = "Ocultar";

        }

        else{

            inputPassword.type = "password";

            inputConfirmar.type = "password";

            this.textContent = "Mostrar";

        }

    });

}
/*=====================================================
    3. VALIDAR FORMULARIO
======================================================*/

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        const nombre = inputNombre.value.trim();

        const correo = inputCorreo.value.trim();

        const password = inputPassword.value.trim();

        const confirmar = inputConfirmar.value.trim();

        if(nombre === "" || correo === "" || password === "" || confirmar === ""){

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
    4. VALIDACIONES FINALES
======================================================*/

        if(password !== confirmar){

            mostrarToast("⚠ Las contraseñas no coinciden.");

            return;

        }

        if(!checkTerminos.checked){

            mostrarToast("⚠ Debes aceptar los términos y condiciones.");

            return;

        }

        const usuario = {

            nombre:nombre,

            correo:correo,

            password:password,

            foto:"img/avatar.png"

        };

        localStorage.setItem(

            "usuario",

            JSON.stringify(usuario)

        );

        mostrarToast("✅ Cuenta creada correctamente.");
        /*=====================================================
    5. REDIRECCIÓN Y LIMPIEZA
======================================================*/

        formulario.reset();

        setTimeout(function(){

            window.location.href = "login.html";

        },1500);

    });

}
/*=====================================================
    6. TOAST (NOTIFICACIONES)
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
    7. VERIFICAR USUARIO EXISTENTE
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    const usuario = JSON.parse(

        localStorage.getItem("usuario")

    );

    if(usuario){

        console.log("Usuario registrado:", usuario.nombre);

    }

    else{

        console.log("No hay usuarios registrados.");

    }

});
/*=====================================================
    8. INICIALIZACIÓN
======================================================*/

window.addEventListener("load", function(){

    const tarjeta = document.querySelector(".registro2-card");

    if(tarjeta){

        tarjeta.style.opacity = "0";

        tarjeta.style.transform = "translateY(30px)";

        setTimeout(function(){

            tarjeta.style.transition = "all .6s ease";

            tarjeta.style.opacity = "1";

            tarjeta.style.transform = "translateY(0)";

        },100);

    }

    inputPassword.value = "";

    inputConfirmar.value = "";

});
/*=====================================================
    9. LIMPIAR FORMULARIO
======================================================*/

function limpiarFormulario(){

    formulario.reset();

    inputPassword.type = "password";

    inputConfirmar.type = "password";

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

    console.log(" Registro cargado correctamente");

    console.log("====================================");

});
