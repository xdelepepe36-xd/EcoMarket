/*=====================================================
    CARRITO.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. OBTENER CARRITO
======================================================*/

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const listaCarrito = document.getElementById("lista-carrito");

const carritoVacio = document.getElementById("carrito-vacio");

const subtotalCarrito = document.getElementById("subtotal-carrito");

const envioCarrito = document.getElementById("envio-carrito");

const totalCarrito = document.getElementById("total-carrito");

const contadorCarrito = document.getElementById("contador-carrito");
/*=====================================================
    2. MOSTRAR PRODUCTOS DEL CARRITO
======================================================*/

function mostrarCarrito(){

    if(!listaCarrito){

        return;

    }

    listaCarrito.innerHTML = "";

    if(carrito.length === 0){

        if(carritoVacio){

            carritoVacio.style.display = "block";

        }

        return;

    }

    if(carritoVacio){

        carritoVacio.style.display = "none";

    }

    carrito.forEach(function(producto, indice){

        listaCarrito.innerHTML += `

        <tr>

            <td>

                <div class="carrito2-producto">

                    <img src="${producto.imagen}" alt="${producto.nombre}">

                    <div class="carrito2-producto-info">

                        <h3>${producto.nombre}</h3>

                        <p>${producto.categoria}</p>

                    </div>

                </div>

            </td>

            <td>

                S/. ${producto.precio.toFixed(2)}

            </td>

            <td>

                <div class="cantidad-control">

                    <button class="btn-menos" data-id="${indice}">-</button>

                    <input type="number" value="1" min="1" readonly>

                    <button class="btn-mas" data-id="${indice}">+</button>

                </div>

            </td>

            <td>

                S/. ${producto.precio.toFixed(2)}

            </td>

            <td>

                <button class="btn-eliminar" data-id="${indice}">

                    🗑

                </button>

            </td>

        </tr>

        `;

    });

}
/*=====================================================
    3. CAMBIAR CANTIDAD
======================================================*/

function cambiarCantidad(indice, accion){

    if(!carrito[indice]){

        return;

    }

    if(!carrito[indice].cantidad){

        carrito[indice].cantidad = 1;

    }

    if(accion === "sumar"){

        carrito[indice].cantidad++;

    }

    if(accion === "restar"){

        if(carrito[indice].cantidad > 1){

            carrito[indice].cantidad--;

        }

    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();

    calcularTotales();

}

document.addEventListener("click", function(e){

    if(e.target.classList.contains("btn-mas")){

        cambiarCantidad(e.target.dataset.id, "sumar");

    }

    if(e.target.classList.contains("btn-menos")){

        cambiarCantidad(e.target.dataset.id, "restar");

    }

});
/*=====================================================
    4. ELIMINAR PRODUCTO
======================================================*/

function eliminarProducto(indice){

    carrito.splice(indice, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();

    calcularTotales();

    actualizarContadorCarrito();

    mostrarToast("🗑 Producto eliminado del carrito");

}

document.addEventListener("click", function(e){

    if(e.target.classList.contains("btn-eliminar")){

        eliminarProducto(e.target.dataset.id);

    }

});
/*=====================================================
    5. CALCULAR SUBTOTAL, ENVÍO Y TOTAL
======================================================*/

function calcularTotales(){

    let subtotal = 0;

    carrito.forEach(function(producto){

        const cantidad = producto.cantidad || 1;

        subtotal += producto.precio * cantidad;

    });

    let envio = 0;

    if(subtotal > 0 && subtotal < 150){

        envio = 15;

    }

    const total = subtotal + envio;

    if(subtotalCarrito){

        subtotalCarrito.textContent = "S/. " + subtotal.toFixed(2);

    }

    if(envioCarrito){

        envioCarrito.textContent = "S/. " + envio.toFixed(2);

    }

    if(totalCarrito){

        totalCarrito.textContent = "S/. " + total.toFixed(2);

    }

}
/*=====================================================
    6. ACTUALIZAR CONTADOR DEL CARRITO
======================================================*/

function actualizarContadorCarrito(){

    if(!contadorCarrito){

        return;

    }

    let cantidadTotal = 0;

    carrito.forEach(function(producto){

        cantidadTotal += producto.cantidad || 1;

    });

    contadorCarrito.textContent = cantidadTotal;

}


/*=====================================================
    INICIALIZACIÓN
======================================================*/

mostrarCarrito();

calcularTotales();

actualizarContadorCarrito();
/*=====================================================
    7. VACIAR CARRITO
======================================================*/

const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");

if(btnVaciarCarrito){

    btnVaciarCarrito.addEventListener("click", function(){

        const confirmar = confirm("¿Deseas vaciar todo el carrito?");

        if(!confirmar){

            return;

        }

        carrito = [];

        localStorage.removeItem("carrito");

        mostrarCarrito();

        calcularTotales();

        actualizarContadorCarrito();

        mostrarToast("🗑 Carrito vaciado correctamente.");

    });

}
/*=====================================================
    8. FINALIZAR COMPRA
======================================================*/

const btnFinalizar = document.querySelector(".btn-finalizar");

if(btnFinalizar){

    btnFinalizar.addEventListener("click", function(e){

        if(carrito.length === 0){

            e.preventDefault();

            mostrarToast("⚠ Tu carrito está vacío.");

            return;

        }

        localStorage.setItem(

            "pedido",

            JSON.stringify(carrito)

        );

        mostrarToast("✅ Redirigiendo al pago...");

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

    const contenedor = document.querySelector(".carrito2-contenedor");

    if(contenedor){

        contenedor.style.opacity = "0";

        contenedor.style.transform = "translateY(30px)";

        setTimeout(function(){

            contenedor.style.transition = "all .6s ease";

            contenedor.style.opacity = "1";

            contenedor.style.transform = "translateY(0)";

        },100);

    }

    mostrarCarrito();

    calcularTotales();

    actualizarContadorCarrito();

    console.clear();

    console.log("====================================");

    console.log("      EcoMarket 2.0");

    console.log(" Carrito cargado correctamente");

    console.log(" Productos:", carrito.length);

    console.log("====================================");

});