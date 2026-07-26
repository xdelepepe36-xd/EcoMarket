/*=====================================================
    ADMIN.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const tablaProductos = document.getElementById("tabla-productos");

const templateAdmin = document.getElementById("template-admin");

const totalProductos = document.getElementById("total-productos");

const totalCompras = document.getElementById("total-compras");

const totalUsuarios = document.getElementById("total-usuarios");

const btnRecargar = document.getElementById("btn-recargar");

const btnVaciar = document.getElementById("btn-vaciar");

let productos = JSON.parse(

    localStorage.getItem("productos")

) || [];

let historialCompras = JSON.parse(

    localStorage.getItem("historialCompras")

) || [];
/*=====================================================
    2. ACTUALIZAR ESTADÍSTICAS
======================================================*/

function actualizarEstadisticas(){

    totalProductos.textContent =

    productos.length;

    totalCompras.textContent =

    historialCompras.length;

    totalUsuarios.textContent =

    1;

}
/*=====================================================
    3. MOSTRAR PRODUCTOS
======================================================*/

function mostrarProductos(){

    tablaProductos.innerHTML = "";

    productos.forEach(function(producto){

        const fila =

        templateAdmin.content.cloneNode(true);

        fila.querySelector(".admin-nombre").textContent =

        producto.nombre;

        fila.querySelector(".admin-categoria").textContent =

        producto.categoria;

        fila.querySelector(".admin-precio").textContent =

        "S/. " + Number(producto.precio).toFixed(2);
        /*=====================================================
    4. BOTONES DE ACCIÓN
======================================================*/

        fila.querySelector(".btn-editar")

        .dataset.id = producto.id;

        fila.querySelector(".btn-eliminar")

        .dataset.id = producto.id;

        tablaProductos.appendChild(fila);

    });

}
/*=====================================================
    5. ELIMINAR PRODUCTO
======================================================*/

tablaProductos.addEventListener("click", function(e){

    if(e.target.classList.contains("btn-eliminar")){

        const id = Number(e.target.dataset.id);

        productos = productos.filter(function(producto){

            return producto.id !== id;

        });

        localStorage.setItem(

            "productos",

            JSON.stringify(productos)

        );

        mostrarProductos();

        actualizarEstadisticas();

        mostrarToast("🗑️ Producto eliminado.");

    }
    /*=====================================================
    6. EDITAR PRODUCTO
======================================================*/

    if(e.target.classList.contains("btn-editar")){

        mostrarToast(

            "✏️ La edición estará disponible en la Fase 2."

        );

    }

});
/*=====================================================
    7. BOTONES PRINCIPALES
======================================================*/

btnRecargar.addEventListener("click", function(){

    productos = JSON.parse(

        localStorage.getItem("productos")

    ) || [];

    mostrarProductos();

    actualizarEstadisticas();

    mostrarToast("🔄 Productos actualizados.");

});

btnVaciar.addEventListener("click", function(){

    if(confirm("¿Deseas eliminar todos los productos?")){

        productos = [];

        localStorage.setItem(

            "productos",

            JSON.stringify(productos)

        );

        mostrarProductos();

        actualizarEstadisticas();

        mostrarToast("🗑️ Todos los productos fueron eliminados.");

    }

});
/*=====================================================
    8. TOAST
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
    9. INICIALIZACIÓN
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    actualizarEstadisticas();

    mostrarProductos();

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Panel de Administración cargado");

    console.log("====================================");

});
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("beforeunload", function(){

    console.log("Cerrando Panel de Administración...");

});
