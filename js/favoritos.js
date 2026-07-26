/*=====================================================
    FAVORITOS.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. OBTENER FAVORITOS
======================================================*/

const listaFavoritos = document.getElementById("lista-favoritos");

const favoritosVacio = document.getElementById("favoritos-vacio");

const contadorCarrito = document.getElementById("contador-carrito");

const btnVaciarFavoritos = document.getElementById("btn-vaciar-favoritos");

let favoritos = JSON.parse(

    localStorage.getItem("favoritos")

) || [];7/*=====================================================
    2. MOSTRAR FAVORITOS
======================================================*/

function mostrarFavoritos(){

    if(!listaFavoritos){

        return;

    }

    listaFavoritos.innerHTML = "";

    if(favoritos.length === 0){

        listaFavoritos.style.display = "none";

        favoritosVacio.style.display = "block";

        return;

    }

    listaFavoritos.style.display = "grid";

    favoritosVacio.style.display = "none";

    favoritos.forEach(function(producto){

        listaFavoritos.innerHTML += `

            <div class="favoritos2-card">

                <img src="${producto.imagen}" alt="${producto.nombre}">

                <div class="favoritos2-info">

                    <h3>${producto.nombre}</h3>

                    <p class="favoritos2-precio">

                        S/. ${producto.precio.toFixed(2)}

                    </p>

                    <div class="favoritos2-botones">

                        <button

                            class="btn-carrito"

                            onclick="agregarAlCarrito(${producto.id})">

                            Agregar al carrito

                        </button>

                        <button

                            class="btn-eliminar"

                            onclick="eliminarFavorito(${producto.id})">

                            Eliminar

                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}

mostrarFavoritos();
/*=====================================================
    3. AGREGAR AL CARRITO
======================================================*/

function agregarAlCarrito(id){

    const producto = favoritos.find(function(item){

        return item.id === id;

    });

    if(!producto){

        return;

    }

    let carrito = JSON.parse(

        localStorage.getItem("carrito")

    ) || [];

    const existe = carrito.find(function(item){

        return item.id === id;

    });

    if(existe){

        existe.cantidad = (existe.cantidad || 1) + 1;

    }

    else{

        producto.cantidad = 1;

        carrito.push(producto);

    }

    localStorage.setItem(

        "carrito",

        JSON.stringify(carrito)

    );

    actualizarContadorCarrito();

    mostrarToast("🛒 Producto agregado al carrito.");

}
/*=====================================================
    4. ELIMINAR FAVORITO
======================================================*/

function eliminarFavorito(id){

    favoritos = favoritos.filter(function(producto){

        return producto.id !== id;

    });

    localStorage.setItem(

        "favoritos",

        JSON.stringify(favoritos)

    );

    mostrarFavoritos();

    mostrarToast("❤️ Producto eliminado de favoritos.");

}
/*=====================================================
    5. VACIAR FAVORITOS
======================================================*/

if(btnVaciarFavoritos){

    btnVaciarFavoritos.addEventListener("click", function(){

        if(favoritos.length === 0){

            mostrarToast("⚠ No hay favoritos para eliminar.");

            return;

        }

        if(confirm("¿Deseas eliminar todos los favoritos?")){

            favoritos = [];

            localStorage.setItem(

                "favoritos",

                JSON.stringify(favoritos)

            );

            mostrarFavoritos();

            mostrarToast("🗑 Favoritos eliminados.");

        }

    });

}
/*=====================================================
    6. CONTADOR DEL CARRITO
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

mostrarFavoritos();

actualizarContadorCarrito();
/*=====================================================
    7. TOAST (NOTIFICACIONES)
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
    8. ANIMACIÓN DE ENTRADA
======================================================*/

window.addEventListener("load", function(){

    const contenedor = document.querySelector(".favoritos2-contenedor");

    if(contenedor){

        contenedor.style.opacity = "0";

        contenedor.style.transform = "translateY(30px)";

        setTimeout(function(){

            contenedor.style.transition = "all .6s ease";

            contenedor.style.opacity = "1";

            contenedor.style.transform = "translateY(0)";

        },100);

    }

    mostrarFavoritos();

    actualizarContadorCarrito();

});
/*=====================================================
    9. ACTUALIZAR VISTA
======================================================*/

function actualizarVista(){

    mostrarFavoritos();

    actualizarContadorCarrito();

}

window.addEventListener("storage", function(){

    favoritos = JSON.parse(

        localStorage.getItem("favoritos")

    ) || [];

    actualizarVista();

});
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    actualizarVista();

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Favoritos cargados correctamente");

    console.log(" Total favoritos:", favoritos.length);

    console.log("====================================");

});