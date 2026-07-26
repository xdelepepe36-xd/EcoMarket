/*=====================================================
    CATALOGO.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const listaProductos = document.getElementById("lista-productos");

const templateProducto = document.getElementById("template-producto");

let productos = JSON.parse(

    localStorage.getItem("productos")

) || [];

let carrito = JSON.parse(

    localStorage.getItem("carrito")

) || [];
/*=====================================================
    2. PRODUCTOS PREDETERMINADOS
======================================================*/

if(productos.length === 0){

    productos = [

        {

            id:1,

            nombre:"Botella reutilizable",

            categoria:"Hogar",

            precio:35,

            descripcion:"Botella ecológica de acero inoxidable.",

            imagen:"img/productos/botella.jpg"

        },

        {

            id:2,

            nombre:"Bolsa ecológica",

            categoria:"Hogar",

            precio:18,

            descripcion:"Bolsa reutilizable de algodón.",

            imagen:"img/productos/bolsa.jpg"

        },

        {

            id:3,

            nombre:"Cepillo de bambú",

            categoria:"Higiene",

            precio:12,

            descripcion:"Cepillo de dientes biodegradable.",

            imagen:"img/productos/cepillo.jpg"

        }

    ];

}
/*=====================================================
    3. MOSTRAR PRODUCTOS
======================================================*/

function mostrarProductos(){

    listaProductos.innerHTML = "";

    productos.forEach(function(producto){

        const tarjeta =

        templateProducto.content.cloneNode(true);

        tarjeta.querySelector(".producto-imagen").src =

        producto.imagen;

        tarjeta.querySelector(".producto-imagen").alt =

        producto.nombre;

        tarjeta.querySelector(".producto-nombre").textContent =

        producto.nombre;

        tarjeta.querySelector(".producto-categoria").textContent =

        producto.categoria;

        tarjeta.querySelector(".producto-precio").textContent =

        "S/. " + producto.precio.toFixed(2);
        /*=====================================================
    4. BOTONES DEL PRODUCTO
======================================================*/

        tarjeta.querySelector(".btn-detalles")

        .dataset.id = producto.id;
        
        tarjeta.querySelector(".btn-detalles").href =

        `detalle-producto.html?id=${producto.id}`;

        tarjeta.querySelector(".btn-carrito")

        .dataset.id = producto.id;

        listaProductos.appendChild(tarjeta);

    });

}

mostrarProductos();
/*=====================================================
    5. AGREGAR AL CARRITO
======================================================*/

listaProductos.addEventListener("click", function(e){

    if(e.target.classList.contains("btn-carrito")){

        const id = Number(e.target.dataset.id);

        const producto = productos.find(function(item){

            return item.id === id;

        });

        if(producto){

            carrito.push(producto);

            localStorage.setItem(

                "carrito",

                JSON.stringify(carrito)

            );

            mostrarToast("🛒 Producto agregado al carrito.");

        }

    }
/*=====================================================
    6. VER DETALLES
======================================================*/

if(e.target.classList.contains("btn-detalles")){

    e.preventDefault();

    const id = Number(e.target.dataset.id);

    window.location.href =

    `detalle-producto.html?id=${id}`;

}

});
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
    8. INICIALIZACIÓN
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Catálogo cargado correctamente");

    console.log("====================================");

    mostrarProductos();

});
/*=====================================================
    9. ACTUALIZAR CARRITO
======================================================*/

function actualizarCarrito(){

    localStorage.setItem(

        "carrito",

        JSON.stringify(carrito)

    );

}

window.addEventListener("storage", function(){

    carrito = JSON.parse(

        localStorage.getItem("carrito")

    ) || [];

});
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    console.log("====================================");

    console.log(" EcoMarket 2.0");

    console.log(" Catálogo inicializado correctamente");

    console.log(" Productos cargados:", productos.length);

    console.log("====================================");

}); 