/*=====================================================
    PERFIL.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. OBTENER DATOS
======================================================*/

const nombreUsuario = document.getElementById("nombre-usuario");

const correoUsuario = document.getElementById("correo-usuario");

const inputNombre = document.getElementById("perfil-nombre");

const inputCorreo = document.getElementById("perfil-correo");

const inputTelefono = document.getElementById("perfil-telefono");

const inputDireccion = document.getElementById("perfil-direccion");

const contadorCarrito = document.getElementById("contador-carrito");

let usuario = JSON.parse(localStorage.getItem("usuario")) || {

    nombre:"Invitado",

    correo:"usuario@ecomarket.com",

    telefono:"",

    direccion:""

};
/*=====================================================
    2. MOSTRAR DATOS DEL USUARIO
======================================================*/

function mostrarDatosUsuario(){

    if(nombreUsuario){

        nombreUsuario.textContent = usuario.nombre;

    }

    if(correoUsuario){

        correoUsuario.textContent = usuario.correo;

    }

    if(inputNombre){

        inputNombre.value = usuario.nombre;

    }

    if(inputCorreo){

        inputCorreo.value = usuario.correo;

    }

    if(inputTelefono){

        inputTelefono.value = usuario.telefono;

    }

    if(inputDireccion){

        inputDireccion.value = usuario.direccion;

    }

}

mostrarDatosUsuario();
/*=====================================================
    3. GUARDAR DATOS DEL USUARIO
======================================================*/

const btnGuardarPerfil = document.getElementById("btn-guardar-perfil");

if(btnGuardarPerfil){

    btnGuardarPerfil.addEventListener("click", function(){

        usuario.nombre = inputNombre.value.trim();

        usuario.correo = inputCorreo.value.trim();

        usuario.telefono = inputTelefono.value.trim();

        usuario.direccion = inputDireccion.value.trim();

        localStorage.setItem(

            "usuario",

            JSON.stringify(usuario)

        );

        mostrarDatosUsuario();

        mostrarToast("✅ Datos guardados correctamente.");

    });

}
/*=====================================================
    4. CONTADOR DEL CARRITO
======================================================*/

function actualizarContadorCarrito(){

    if(!contadorCarrito){

        return;

    }

    const carrito = JSON.parse(

        localStorage.getItem("carrito")

    ) || [];

    let total = 0;

    carrito.forEach(function(producto){

        total += producto.cantidad || 1;

    });

    contadorCarrito.textContent = total;

}


/*=====================================================
    INICIALIZACIÓN
======================================================*/

actualizarContadorCarrito();
/*=====================================================
    5. MOSTRAR HISTORIAL DE PEDIDOS
======================================================*/

const listaPedidos = document.getElementById("lista-pedidos");

function mostrarPedidos(){

    if(!listaPedidos){

        return;

    }

    const pedidos = JSON.parse(

        localStorage.getItem("ultimaCompra")

    ) || [];

    listaPedidos.innerHTML = "";

    if(pedidos.length === 0){

        listaPedidos.innerHTML = "<p>No hay pedidos registrados.</p>";

        return;

    }

    pedidos.forEach(function(producto){

        listaPedidos.innerHTML += `

            <div class="perfil2-card">

                <img src="${producto.imagen}" alt="${producto.nombre}">

                <h3>${producto.nombre}</h3>

                <p>Precio: S/. ${producto.precio.toFixed(2)}</p>

                <p>Categoría: ${producto.categoria}</p>

            </div>

        `;

    });

}

mostrarPedidos();
/*=====================================================
    6. MOSTRAR FAVORITOS
======================================================*/

const listaFavoritos = document.getElementById("lista-favoritos");

function mostrarFavoritos(){

    if(!listaFavoritos){

        return;

    }

    const favoritos = JSON.parse(

        localStorage.getItem("favoritos")

    ) || [];

    listaFavoritos.innerHTML = "";

    if(favoritos.length === 0){

        listaFavoritos.innerHTML = "<p>No tienes productos favoritos.</p>";

        return;

    }

    favoritos.forEach(function(producto){

        listaFavoritos.innerHTML += `

            <div class="perfil2-card">

                <img src="${producto.imagen}" alt="${producto.nombre}">

                <h3>${producto.nombre}</h3>

                <p>Precio: S/. ${producto.precio.toFixed(2)}</p>

                <a href="producto.html?id=${producto.id}" class="btn-producto">

                    Ver producto

                </a>

            </div>

        `;

    });

}

mostrarFavoritos();
/*=====================================================
    7. CAMBIO DE PESTAÑAS
======================================================*/

const pestañas = document.querySelectorAll(".perfil2-tab");

const paneles = document.querySelectorAll(".perfil2-panel");

pestañas.forEach(function(tab){

    tab.addEventListener("click", function(){

        pestañas.forEach(function(item){

            item.classList.remove("activa");

        });

        paneles.forEach(function(panel){

            panel.classList.remove("activa");

        });

        this.classList.add("activa");

        const id = this.dataset.tab;

        document.getElementById(id).classList.add("activa");

    });

});
/*=====================================================
    8. CONFIGURACIÓN
======================================================*/

const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

const btnBorrarDatos = document.getElementById("btn-borrar-datos");

if(btnCerrarSesion){

    btnCerrarSesion.addEventListener("click", function(){

        mostrarToast("👋 Sesión cerrada correctamente.");

        setTimeout(function(){

            window.location.href = "login.html";

        },1500);

    });

}

if(btnBorrarDatos){

    btnBorrarDatos.addEventListener("click", function(){

        if(confirm("¿Deseas borrar todos los datos guardados?")){

            localStorage.clear();

            mostrarToast("🗑 Datos eliminados correctamente.");

            setTimeout(function(){

                location.reload();

            },1500);

        }

    });

}
/*=====================================================
    9. TOAST (NOTIFICACIONES)
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
    10. ANIMACIÓN E INICIALIZACIÓN FINAL
======================================================*/

window.addEventListener("load", function(){

    const contenedor = document.querySelector(".perfil2-contenedor");

    if(contenedor){

        contenedor.style.opacity = "0";

        contenedor.style.transform = "translateY(30px)";

        setTimeout(function(){

            contenedor.style.transition = "all .6s ease";

            contenedor.style.opacity = "1";

            contenedor.style.transform = "translateY(0)";

        },100);

    }

    mostrarDatosUsuario();

    mostrarPedidos();

    mostrarFavoritos();

    actualizarContadorCarrito();

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Perfil cargado correctamente");

    console.log(" Usuario:", usuario.nombre);

    console.log("====================================");

});