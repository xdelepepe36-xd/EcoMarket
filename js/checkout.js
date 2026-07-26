/*=====================================================
    CHECKOUT.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. OBTENER PEDIDO
======================================================*/

const pedido = JSON.parse(localStorage.getItem("pedido")) || [];

const listaCheckout = document.getElementById("lista-checkout");

const subtotalCheckout = document.getElementById("checkout-subtotal");

const envioCheckout = document.getElementById("checkout-envio");

const totalCheckout = document.getElementById("checkout-total");

const contadorCarrito = document.getElementById("contador-carrito");
/*=====================================================
    2. MOSTRAR RESUMEN DEL PEDIDO
======================================================*/

function mostrarPedido(){

    if(!listaCheckout){

        return;

    }

    listaCheckout.innerHTML = "";

    if(pedido.length === 0){

        listaCheckout.innerHTML = `

            <p>

                No hay productos para mostrar.

            </p>

        `;

        return;

    }

    pedido.forEach(function(producto){

        const cantidad = producto.cantidad || 1;

        listaCheckout.innerHTML += `

            <div class="checkout-item">

                <div>

                    <h4>${producto.nombre}</h4>

                    <p>

                        Cantidad: ${cantidad}

                    </p>

                </div>

                <strong>

                    S/. ${(producto.precio * cantidad).toFixed(2)}

                </strong>

            </div>

        `;

    });

}
/*=====================================================
    3. CALCULAR SUBTOTAL, ENVÍO Y TOTAL
======================================================*/

function calcularTotales(){

    let subtotal = 0;

    pedido.forEach(function(producto){

        const cantidad = producto.cantidad || 1;

        subtotal += producto.precio * cantidad;

    });

    let envio = 0;

    if(subtotal > 0 && subtotal < 150){

        envio = 15;

    }

    const total = subtotal + envio;

    if(subtotalCheckout){

        subtotalCheckout.textContent = "S/. " + subtotal.toFixed(2);

    }

    if(envioCheckout){

        envioCheckout.textContent = "S/. " + envio.toFixed(2);

    }

    if(totalCheckout){

        totalCheckout.textContent = "S/. " + total.toFixed(2);

    }

}
/*=====================================================
    4. ACTUALIZAR CONTADOR DEL CARRITO
======================================================*/

function actualizarContadorCarrito(){

    if(!contadorCarrito){

        return;

    }

    let cantidadTotal = 0;

    pedido.forEach(function(producto){

        cantidadTotal += producto.cantidad || 1;

    });

    contadorCarrito.textContent = cantidadTotal;

}


/*=====================================================
    INICIALIZACIÓN
======================================================*/

mostrarPedido();

calcularTotales();

actualizarContadorCarrito();
/*=====================================================
    5. VALIDAR FORMULARIO
======================================================*/

const formulario = document.getElementById("form-checkout");

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();

        const correo = document.getElementById("correo").value.trim();

        const telefono = document.getElementById("telefono").value.trim();

        const direccion = document.getElementById("direccion").value.trim();

        if(

            nombre === "" ||

            correo === "" ||

            telefono === "" ||

            direccion === ""

        ){

            mostrarToast("⚠ Completa todos los campos.");

            return;

        }

        confirmarCompra();

    });

}
/*=====================================================
    6. CONFIRMAR COMPRA
======================================================*/

function confirmarCompra(){

    localStorage.setItem(

        "ultimaCompra",

        JSON.stringify(pedido)

    );

    localStorage.removeItem("carrito");

    localStorage.removeItem("pedido");

    const numeroPedido = generarNumeroPedido();

const metodo = obtenerMetodoPago();

mostrarToast(

    "✅ Pedido " +

    numeroPedido +

    " confirmado (" +

    metodo +

    ")"

);

    setTimeout(function(){

        window.location.href = "index.html";

    },2000);

}
/*=====================================================
    7. MÉTODO DE PAGO Y NÚMERO DE PEDIDO
======================================================*/

function generarNumeroPedido(){

    return "ECO-" + Date.now();

}

function obtenerMetodoPago(){

    const metodo = document.querySelector(

        'input[name="pago"]:checked'

    );

    if(metodo){

        return metodo.value;

    }

    return "No seleccionado";

}
/*=====================================================
    8. TOAST (NOTIFICACIONES)
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
    9. ANIMACIÓN DE ENTRADA
======================================================*/

window.addEventListener("load", function(){

    const contenedor = document.querySelector(".checkout2-contenedor");

    if(contenedor){

        contenedor.style.opacity = "0";

        contenedor.style.transform = "translateY(30px)";

        setTimeout(function(){

            contenedor.style.transition = "all .6s ease";

            contenedor.style.opacity = "1";

            contenedor.style.transform = "translateY(0)";

        },100);

    }

});
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    mostrarPedido();

    calcularTotales();

    actualizarContadorCarrito();

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Checkout cargado correctamente");

    console.log(" Productos:", pedido.length);

    console.log(" Método:", obtenerMetodoPago());

    console.log("====================================");

});