/*=====================================================
    DETALLE-PRODUCTO.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const imagen = document.getElementById("detalle-imagen");

const categoria = document.getElementById("detalle-categoria");

const nombre = document.getElementById("detalle-nombre");

const descripcion = document.getElementById("detalle-descripcion");

const precio = document.getElementById("detalle-precio");

const btnCarrito = document.getElementById("btn-carrito");

const btnFavorito = document.getElementById("btn-favorito");

const relacionados = document.getElementById("productos-relacionados");

/*=====================================================
    2. OBTENER PRODUCTO
======================================================*/

const parametros = new URLSearchParams(

    window.location.search

);

const idProducto = Number(

    parametros.get("id")

);

let productos = JSON.parse(

    localStorage.getItem("productos")

) || [];

let carrito = JSON.parse(

    localStorage.getItem("carrito")

) || [];

let favoritos = JSON.parse(

    localStorage.getItem("favoritos")

) || [];
/*=====================================================
    3. BUSCAR PRODUCTO
======================================================*/

const producto = productos.find(function(item){

    return item.id === idProducto;

});
/*=====================================================
    4. MOSTRAR INFORMACIÓN
======================================================*/

function mostrarProducto(){

    if(!producto){

        nombre.textContent = "Producto no encontrado.";

        return;

    }

    imagen.src = producto.imagen;

    categoria.textContent = producto.categoria;

    nombre.textContent = producto.nombre;

    descripcion.textContent = producto.descripcion;

    precio.textContent =

    "S/. " + Number(producto.precio).toFixed(2);

}
/*=====================================================
    5. AGREGAR AL CARRITO
======================================================*/

btnCarrito.addEventListener("click", function(){

    if(!producto) return;

    carrito.push(producto);

    localStorage.setItem(

        "carrito",

        JSON.stringify(carrito)

    );

    mostrarToast("🛒 Producto agregado al carrito.");

});
/*=====================================================
    6. AGREGAR A FAVORITOS
======================================================*/

btnFavorito.addEventListener("click", function(){

    if(!producto) return;

    const existe = favoritos.some(function(item){

        return item.id === producto.id;

    });

    if(!existe){

        favoritos.push(producto);

        localStorage.setItem(

            "favoritos",

            JSON.stringify(favoritos)

        );

        mostrarToast("❤️ Producto agregado a favoritos.");

    }else{

        mostrarToast("⭐ Este producto ya está en favoritos.");

    }

});
/*=====================================================
    7. PRODUCTOS RELACIONADOS
======================================================*/

function mostrarRelacionados(){

    relacionados.innerHTML = "";

    productos

    .filter(function(item){

        return item.categoria === producto.categoria &&

               item.id !== producto.id;

    })

    .slice(0,4)

    .forEach(function(item){

        relacionados.innerHTML += `

        <div class="card-relacionado">

            <img src="${item.imagen}" alt="${item.nombre}">

            <h3>${item.nombre}</h3>

            <p>S/. ${Number(item.precio).toFixed(2)}</p>

            <a href="detalle-producto.html?id=${item.id}">

                Ver detalles

            </a>

        </div>

        `;

    });

}
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

    mostrarProducto();

    if(producto){

        mostrarRelacionados();

    }

    console.clear();

    console.log("====================================");

    console.log("      EcoMarket 2.0");

    console.log("Detalle del producto cargado");

    console.log("====================================");

});
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("beforeunload", function(){

    console.log("Cerrando detalle del producto...");

});