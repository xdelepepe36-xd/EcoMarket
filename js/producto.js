/*=====================================================
    PRODUCTOS.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. OBTENER ID DEL PRODUCTO
======================================================*/

const parametros = new URLSearchParams(window.location.search);

const idProducto = parseInt(parametros.get("id"));


/*=====================================================
    2. BASE DE DATOS DE PRODUCTOS
======================================================*/

const productos = [

    {
        id: 1,
        nombre: "Botella Reutilizable",
        precio: 45.00,
        imagen: "img/producto1.jpg",
        categoria: "Accesorios",
        estado: "Nuevo",
        descripcion: "Botella térmica reutilizable fabricada con acero inoxidable."
    },

    {
        id: 2,
        nombre: "Cepillo de Bambú",
        precio: 8.90,
        imagen: "img/producto2.jpg",
        categoria: "Higiene",
        estado: "Nuevo",
        descripcion: "Cepillo ecológico elaborado con bambú biodegradable."
    },

    {
        id: 3,
        nombre: "Bolsa Ecológica",
        precio: 12.00,
        imagen: "img/producto3.jpg",
        categoria: "Accesorios",
        estado: "Nuevo",
        descripcion: "Bolsa reutilizable resistente para compras diarias."
    },

    {
        id: 4,
        nombre: "Maceta Reciclada",
        precio: 22.00,
        imagen: "img/producto4.jpg",
        categoria: "Jardinería",
        estado: "Nuevo",
        descripcion: "Maceta elaborada con plástico reciclado."
    },

    {
        id: 5,
        nombre: "Jabón Artesanal",
        precio: 10.00,
        imagen: "img/producto5.jpg",
        categoria: "Cuidado Personal",
        estado: "Nuevo",
        descripcion: "Jabón natural libre de químicos."
    },

    {
        id: 6,
        nombre: "Vaso Reutilizable",
        precio: 38.00,
        imagen: "img/producto6.jpg",
        categoria: "Accesorios",
        estado: "Nuevo",
        descripcion: "Vaso térmico reutilizable."
    },

    {
        id: 7,
        nombre: "Cubiertos de Bambú",
        precio: 15.00,
        imagen: "img/producto7.jpg",
        categoria: "Cocina",
        estado: "Nuevo",
        descripcion: "Set de cubiertos reutilizables."
    },

    {
        id: 8,
        nombre: "Táper de Acero",
        precio: 35.00,
        imagen: "img/producto8.jpg",
        categoria: "Cocina",
        estado: "Nuevo",
        descripcion: "Recipiente ecológico de acero inoxidable."
    },

    {
        id: 9,
        nombre: "Toallitas Reutilizables",
        precio: 18.00,
        imagen: "img/producto9.jpg",
        categoria: "Hogar",
        estado: "Nuevo",
        descripcion: "Toallitas de tela reutilizables."
    },

    {
        id: 10,
        nombre: "Cuaderno Reciclado",
        precio: 14.00,
        imagen: "img/producto10.jpg",
        categoria: "Oficina",
        estado: "Nuevo",
        descripcion: "Cuaderno elaborado con papel reciclado."
    },

    {
        id: 11,
        nombre: "Sorbetes de Acero",
        precio: 20.00,
        imagen: "img/producto11.jpg",
        categoria: "Cocina",
        estado: "Nuevo",
        descripcion: "Pack de sorbetes reutilizables."
    },

    {
        id: 12,
        nombre: "Shampoo Sólido",
        precio: 16.00,
        imagen: "img/producto12.jpg",
        categoria: "Cuidado Personal",
        estado: "Nuevo",
        descripcion: "Shampoo ecológico sin envase plástico."
    }

];
/*=====================================================
    3. BUSCAR Y MOSTRAR PRODUCTO
======================================================*/

const producto = productos.find(function(item){

    return item.id === idProducto;

});

if(!producto){

    window.location.href = "/productos";

}

const nombre = document.getElementById("nombre-producto");
const precio = document.getElementById("precio-producto");
const imagen = document.getElementById("imagen-producto");
const categoria = document.getElementById("categoria-producto");
const estado = document.getElementById("estado-producto");
const descripcion = document.getElementById("descripcion-producto");
const breadcrumb = document.getElementById("breadcrumb-producto");

if(nombre){

    nombre.textContent = producto.nombre;

}

if(precio){

    precio.textContent = "S/. " + producto.precio.toFixed(2);

}

if(imagen){

    imagen.src = producto.imagen;

    imagen.alt = producto.nombre;

}

if(categoria){

    categoria.textContent = producto.categoria;

}

if(estado){

    estado.textContent = "Estado: " + producto.estado;

}

if(descripcion){

    descripcion.textContent = producto.descripcion;

}

if(breadcrumb){

    breadcrumb.textContent = producto.nombre;

}
/*=====================================================
    4. GALERÍA DE IMÁGENES
======================================================*/

const miniaturas = document.querySelectorAll(".producto2-miniatura");

if(producto && miniaturas.length > 0){

    miniaturas.forEach(function(miniatura, indice){

        miniatura.src = producto.imagen;

        miniatura.alt = producto.nombre + " " + (indice + 1);

        miniatura.addEventListener("click", function(){

            if(imagen){

                imagen.src = this.src;

            }

            miniaturas.forEach(function(img){

                img.classList.remove("activa");

            });

            this.classList.add("activa");

        });

    });

}


/*=====================================================
    5. TABLA DE ESPECIFICACIONES
======================================================*/

const tabla = document.getElementById("tabla-especificaciones");

if(producto && tabla){

    tabla.innerHTML = `

        <tr>

            <th>Nombre</th>

            <td>${producto.nombre}</td>

        </tr>

        <tr>

            <th>Categoría</th>

            <td>${producto.categoria}</td>

        </tr>

        <tr>

            <th>Estado</th>

            <td>${producto.estado}</td>

        </tr>

        <tr>

            <th>Precio</th>

            <td>S/. ${producto.precio.toFixed(2)}</td>

        </tr>

        <tr>

            <th>Material</th>

            <td>Material ecológico</td>

        </tr>

        <tr>

            <th>Garantía</th>

            <td>12 meses</td>

        </tr>

        <tr>

            <th>Entrega</th>

            <td>Envío a todo el Perú</td>

        </tr>

    `;

}
/*=====================================================
    6. PRODUCTOS RELACIONADOS
======================================================*/

const contenedorRelacionados = document.getElementById("productos-relacionados");

if(contenedorRelacionados && producto){

    const relacionados = productos.filter(function(item){

        return item.id !== producto.id;

    }).slice(0,4);

    relacionados.forEach(function(item){

        const tarjeta = document.createElement("div");

        tarjeta.className = "producto2-card";

        tarjeta.innerHTML = `

            <img src="${item.imagen}" alt="${item.nombre}">

            <h3>${item.nombre}</h3>

            <p class="producto2-precio">

                S/. ${item.precio.toFixed(2)}

            </p>

            <a href="producto.html?id=${item.id}" class="btn-producto">

                Ver producto

            </a>

        `;

        contenedorRelacionados.appendChild(tarjeta);

    });

}


/*=====================================================
    7. AGREGAR AL CARRITO
======================================================*/

const btnCarrito = document.querySelector(".btn-carrito");

if(btnCarrito && producto){

    btnCarrito.addEventListener("click", function(){

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        carrito.push(producto);

        localStorage.setItem("carrito", JSON.stringify(carrito));

        actualizarContadorCarrito();

        mostrarToast("✅ Producto agregado al carrito.");

    });

}


/*=====================================================
    8. AGREGAR A FAVORITOS
======================================================*/

const btnFavorito = document.querySelector(".btn-favorito");

if(btnFavorito && producto){

    btnFavorito.addEventListener("click", function(){

        let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

        const existe = favoritos.find(function(item){

            return item.id === producto.id;

        });

        if(!existe){

            favoritos.push(producto);

            localStorage.setItem("favoritos", JSON.stringify(favoritos));

            mostrarToast("❤️ Producto agregado a favoritos.");

        }

        else{

            mostrarToast("⚠ Este producto ya está en favoritos.");

        }

    });

}
/*=====================================================
    9. COMPRAR AHORA
======================================================*/

const btnComprar = document.querySelector(".btn-comprar");

if(btnComprar && producto){

    btnComprar.addEventListener("click", function(){

        localStorage.setItem(

            "productoCompra",

            JSON.stringify(producto)

        );

        window.location.href = "/checkout";

    });

}


/*=====================================================
    10. CONTADOR DEL CARRITO
======================================================*/

function actualizarContadorCarrito(){

    const contador = document.getElementById("contador-carrito");

    if(!contador){

        return;

    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    contador.textContent = carrito.length;

}

actualizarContadorCarrito();


/*=====================================================
    11. SELECTOR DE CANTIDAD
======================================================*/

const cantidad = document.getElementById("cantidad-producto");

const btnMas = document.getElementById("btn-mas");

const btnMenos = document.getElementById("btn-menos");

if(cantidad && btnMas && btnMenos){

    btnMas.addEventListener("click", function(){

        cantidad.value = Number(cantidad.value) + 1;

    });

    btnMenos.addEventListener("click", function(){

        if(Number(cantidad.value) > 1){

            cantidad.value = Number(cantidad.value) - 1;

        }

    });

}/*=====================================================
    12. ZOOM DE IMAGEN
======================================================*/

const imagenZoom = document.getElementById("imagen-producto");

if(imagenZoom){

    imagenZoom.addEventListener("mousemove", function(e){

        const rect = this.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width) * 100;

        const y = ((e.clientY - rect.top) / rect.height) * 100;

        this.style.transformOrigin = x + "% " + y + "%";

    });

    imagenZoom.addEventListener("mouseenter", function(){

        this.style.transform = "scale(1.6)";

        this.style.cursor = "zoom-in";

    });

    imagenZoom.addEventListener("mouseleave", function(){

        this.style.transform = "scale(1)";

        this.style.transformOrigin = "center";

    });

}


/*=====================================================
    13. COMPARTIR PRODUCTO
======================================================*/

const btnCompartir = document.getElementById("btn-compartir");

if(btnCompartir && producto){

    btnCompartir.addEventListener("click", function(){

        if(navigator.share){

            navigator.share({

                title: producto.nombre,

                text: producto.descripcion,

                url: window.location.href

            });

        }else{

            navigator.clipboard.writeText(window.location.href);

            mostrarToast("✅ Enlace copiado al portapapeles.");

        }

    });

}


/*=====================================================
    14. STOCK DINÁMICO
======================================================*/

const stockProducto = document.getElementById("stock-producto");

if(stockProducto){

    const stock = Math.floor(Math.random() * 20) + 1;

    if(stock <= 5){

        stockProducto.textContent = "⚠ Quedan " + stock + " unidades";

        stockProducto.style.color = "#E53935";

    }else{

        stockProducto.textContent = "✅ Stock disponible (" + stock + ")";

        stockProducto.style.color = "#2E7D32";

    }

}


/*=====================================================
    15. PRODUCTOS VISTOS RECIENTEMENTE
======================================================*/

if(producto){

    let vistos = JSON.parse(localStorage.getItem("vistos")) || [];

    vistos = vistos.filter(function(item){

        return item.id !== producto.id;

    });

    vistos.unshift(producto);

    if(vistos.length > 6){

        vistos.pop();

    }

    localStorage.setItem("vistos", JSON.stringify(vistos));

}


/*=====================================================
    16. TOAST
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
    17. ÚLTIMO PRODUCTO VISITADO
======================================================*/

if(producto){

    localStorage.setItem(

        "ultimoProducto",

        JSON.stringify(producto)

    );

}


/*=====================================================
    18. INICIALIZACIÓN FINAL
======================================================*/

window.addEventListener("load", function(){

    console.clear();

    console.log("====================================");

    console.log(" EcoMarket 2.0");

    console.log(" Producto cargado correctamente");

    console.log(" ID:", producto.id);

    console.log(" Nombre:", producto.nombre);

    console.log("====================================");

    actualizarContadorCarrito();

});
/*=====================================================
    19. FUNCIONAMIENTO DE TABS
======================================================*/

const botonesTabs = document.querySelectorAll(".tab-btn");

const contenidosTabs = document.querySelectorAll(".tab-content");

botonesTabs.forEach(function(boton){

    boton.addEventListener("click", function(){

        botonesTabs.forEach(function(btn){

            btn.classList.remove("active");

        });

        contenidosTabs.forEach(function(tab){

            tab.style.display = "none";

        });

        boton.classList.add("active");

        const id = boton.getAttribute("data-tab");

        const contenido = document.getElementById(id);

        if(contenido){

            contenido.style.display = "block";

        }

    });

});
/*=====================================================
    20. TAB POR DEFECTO
======================================================*/

document.addEventListener("DOMContentLoaded", function(){

    const descripcion = document.getElementById("descripcion");

    if(descripcion){

        descripcion.style.display = "block";

    }

    const especificaciones = document.getElementById("especificaciones");

    if(especificaciones){

        especificaciones.style.display = "none";

    }

    const opiniones = document.getElementById("opiniones");

    if(opiniones){

        opiniones.style.display = "none";

    }

});
/*=====================================================
    21. ACTUALIZAR BOTÓN DEL CARRITO
======================================================*/

function actualizarBotonCarrito(){

    const btnCarrito = document.querySelector(".btn-carrito");

    if(!btnCarrito){

        return;

    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    btnCarrito.innerHTML = "🛒 Agregar al carrito (" + carrito.length + ")";

}

actualizarBotonCarrito();


if(btnCarrito && producto){

    btnCarrito.addEventListener("click", function(){

        setTimeout(function(){

            actualizarBotonCarrito();

        },100);

    });

}
/*=====================================================
    22. ESTADO DEL BOTÓN FAVORITOS
======================================================*/

function actualizarBotonFavorito(){

    const btnFavorito = document.querySelector(".btn-favorito");

    if(!btnFavorito || !producto){

        return;

    }

    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    const existe = favoritos.find(function(item){

        return item.id === producto.id;

    });

    if(existe){

        btnFavorito.innerHTML = "💚 En favoritos";

        btnFavorito.classList.add("activo");

    }

    else{

        btnFavorito.innerHTML = "❤️ Agregar a favoritos";

        btnFavorito.classList.remove("activo");

    }

}

actualizarBotonFavorito();


if(btnFavorito && producto){

    btnFavorito.addEventListener("click", function(){

        setTimeout(function(){

            actualizarBotonFavorito();

        },100);

    });

}
/*=====================================================
    23. ANIMACIÓN AL AGREGAR AL CARRITO
======================================================*/

if(btnCarrito){

    btnCarrito.addEventListener("click", function(){

        btnCarrito.classList.add("animacion");

        setTimeout(function(){

            btnCarrito.classList.remove("animacion");

        },500);

    });

}
/*=====================================================
    24. EFECTO HOVER EN LAS MINIATURAS
======================================================*/

miniaturas.forEach(function(miniatura){

    miniatura.addEventListener("mouseenter", function(){

        this.style.transform = "scale(1.08)";

    });

    miniatura.addEventListener("mouseleave", function(){

        this.style.transform = "scale(1)";

    });

});
/*=====================================================
    25. CALIFICACIÓN DINÁMICA
======================================================*/

const estrellas = document.querySelector(".producto2-estrellas");

if(estrellas && producto){

    const calificacion = (4 + Math.random()).toFixed(1);

    estrellas.innerHTML = `

        ⭐⭐⭐⭐⭐

        <span class="producto2-calificacion">

            (${calificacion}/5)

        </span>

    `;

}
/*=====================================================
    26. FECHA DE PUBLICACIÓN
======================================================*/

const fechaPublicacion = document.getElementById("fecha-publicacion");

if(fechaPublicacion){

    const hoy = new Date();

    const dias = Math.floor(Math.random() * 30) + 1;

    hoy.setDate(hoy.getDate() - dias);

    fechaPublicacion.textContent =
        "Publicado el " +
        hoy.toLocaleDateString("es-PE");

}
/*=====================================================
    27. CONTADOR DE VISITAS
======================================================*/

const visitas = document.getElementById("contador-visitas");

if(visitas && producto){

    let totalVisitas = localStorage.getItem("visitas_" + producto.id);

    if(!totalVisitas){

        totalVisitas = Math.floor(Math.random() * 200) + 50;

    }else{

        totalVisitas = parseInt(totalVisitas) + 1;

    }

    localStorage.setItem("visitas_" + producto.id, totalVisitas);

    visitas.textContent = "👁 " + totalVisitas + " visitas";

}
/*=====================================================
    28. TIEMPO DE ENTREGA
======================================================*/

const entrega = document.getElementById("tiempo-entrega");

if(entrega){

    const dias = Math.floor(Math.random() * 4) + 2;

    entrega.textContent = "🚚 Entrega estimada: " + dias + " días";

}
/*=====================================================
    29. GUARDAR ÚLTIMA FECHA DE VISITA
======================================================*/

if(producto){

    const ahora = new Date();

    localStorage.setItem(

        "ultimaVisita_" + producto.id,

        ahora.toLocaleString("es-PE")

    );

}
/*=====================================================
    30. ANIMACIÓN DE ENTRADA DEL PRODUCTO
======================================================*/

window.addEventListener("load", function(){

    const contenedor = document.querySelector(".producto2-detalle");

    if(contenedor){

        contenedor.style.opacity = "0";

        contenedor.style.transform = "translateY(30px)";

        setTimeout(function(){

            contenedor.style.transition = "all 0.6s ease";

            contenedor.style.opacity = "1";

            contenedor.style.transform = "translateY(0)";

        },100);

    }

});