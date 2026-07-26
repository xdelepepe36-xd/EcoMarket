/*=====================================================
    CONFIRMACION.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const resumenPedido = document.getElementById("resumen-pedido");

let carrito = JSON.parse(

    localStorage.getItem("carrito")

) || [];

let historialCompras = JSON.parse(

    localStorage.getItem("historialCompras")

) || [];
/*=====================================================
    2. MOSTRAR RESUMEN
======================================================*/

function mostrarResumen(){

    resumenPedido.innerHTML = "";

    if(carrito.length === 0){

        resumenPedido.innerHTML =

        "<p>No hay productos para mostrar.</p>";

        return;

    }

    let total = 0;
    /*=====================================================
    3. RECORRER PRODUCTOS
======================================================*/

    carrito.forEach(function(producto){

        total += Number(producto.precio);

        resumenPedido.innerHTML += `

        <div class="producto-resumen">

            <strong>${producto.nombre}</strong>

            <span>

                S/. ${Number(producto.precio).toFixed(2)}

            </span>

        </div>

        `;

    });

    resumenPedido.innerHTML += `

    <hr>

    <h3>Total: S/. ${total.toFixed(2)}</h3>

    `;

}
/*=====================================================
    4. GUARDAR COMPRA
======================================================*/

function guardarCompra(){

    const compra = {

        id:Date.now(),

        fecha:new Date().toLocaleString(),

        productos:[...carrito],

        total:carrito.reduce(function(suma,producto){

            return suma + Number(producto.precio);

        },0)

    };

    historialCompras.push(compra);

    localStorage.setItem(

        "historialCompras",

        JSON.stringify(historialCompras)

    );

}
/*=====================================================
    5. VACIAR CARRITO
======================================================*/

function vaciarCarrito(){

    carrito = [];

    localStorage.setItem(

        "carrito",

        JSON.stringify(carrito)

    );

}
/*=====================================================
    6. TOAST DE CONFIRMACIÓN
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
    7. INICIALIZACIÓN
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    mostrarResumen();

    if(carrito.length > 0){

        guardarCompra();

        vaciarCarrito();

        mostrarToast("✅ ¡Compra realizada con éxito!");

    }

});
/*=====================================================
    8. DESPLAZAMIENTO
======================================================*/

window.addEventListener("load", function(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});
/*=====================================================
    9. MENSAJES DE CONSOLA
======================================================*/

console.log("====================================");

console.log("       EcoMarket 2.0");

console.log(" Confirmación cargada correctamente");

console.log("====================================");
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("beforeunload", function(){

    console.log("Saliendo de Confirmación...");

});