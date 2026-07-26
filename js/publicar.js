/*=====================================================
    PUBLICAR.JS
    EcoMarket 2.0
======================================================*/


/*=====================================================
    1. ELEMENTOS DEL DOM
======================================================*/

const formulario = document.getElementById("form-publicar");

const inputNombre = document.getElementById("nombre");

const inputPrecio = document.getElementById("precio");

const inputCategoria = document.getElementById("categoria");

const inputDescripcion = document.getElementById("descripcion");

const inputImagen = document.getElementById("imagen");

const previewImagen = document.getElementById("preview-imagen");
/*=====================================================
    2. VISTA PREVIA DE LA IMAGEN
======================================================*/

if(inputImagen){

    inputImagen.addEventListener("change", function(){

        const archivo = this.files[0];

        if(!archivo){

            previewImagen.innerHTML =

            "<span>Vista previa de la imagen</span>";

            return;

        }

        const lector = new FileReader();

        lector.onload = function(e){

            previewImagen.innerHTML =

            `<img src="${e.target.result}" alt="Vista previa">`;

        };

        lector.readAsDataURL(archivo);

    });

}
/*=====================================================
    3. VALIDAR FORMULARIO
======================================================*/

if(formulario){

    formulario.addEventListener("submit", function(e){

        e.preventDefault();

        const nombre = inputNombre.value.trim();

        const precio = parseFloat(inputPrecio.value);

        const categoria = inputCategoria.value;

        const descripcion = inputDescripcion.value.trim();

        if(nombre === "" ||

           isNaN(precio) ||

           categoria === "" ||

           descripcion === ""){

            mostrarToast("⚠ Completa todos los campos.");

            return;

        }

        if(precio <= 0){

            mostrarToast("⚠ El precio debe ser mayor que cero.");

            return;

        }
        /*=====================================================
    4. GUARDAR PRODUCTO
======================================================*/

        const productos = JSON.parse(

            localStorage.getItem("productos")

        ) || [];

        const producto = {

            id:Date.now(),

            nombre:nombre,

            precio:precio,

            categoria:categoria,

            descripcion:descripcion,

            imagen:previewImagen.innerHTML

        };

        productos.push(producto);

        localStorage.setItem(

            "productos",

            JSON.stringify(productos)

        );

        mostrarToast("✅ Producto publicado correctamente.");
/*=====================================================
    5. LIMPIAR FORMULARIO
======================================================*/

        formulario.reset();

        previewImagen.innerHTML =

        "<span>Vista previa de la imagen</span>";

        setTimeout(function(){

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        },500);

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
    7. VERIFICAR PRODUCTOS
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    const productos = JSON.parse(

        localStorage.getItem("productos")

    ) || [];

    console.log(

        "Productos registrados:",

        productos.length

    );

});
/*=====================================================
    8. INICIALIZACIÓN
======================================================*/

window.addEventListener("load", function(){

    const tarjeta = document.querySelector(".publicar2-card");

    if(tarjeta){

        tarjeta.style.opacity = "0";

        tarjeta.style.transform = "translateY(30px)";

        setTimeout(function(){

            tarjeta.style.transition = "all .6s ease";

            tarjeta.style.opacity = "1";

            tarjeta.style.transform = "translateY(0)";

        },100);

    }

    inputNombre.focus();

});
/*=====================================================
    9. LIMPIAR FORMULARIO
======================================================*/

function limpiarFormulario(){

    formulario.reset();

    previewImagen.innerHTML =

    "<span>Vista previa de la imagen</span>";

    inputNombre.focus();

}
/*=====================================================
    10. OPTIMIZACIÓN FINAL
======================================================*/

window.addEventListener("DOMContentLoaded", function(){

    console.clear();

    console.log("====================================");

    console.log("        EcoMarket 2.0");

    console.log(" Publicar cargado correctamente");

    console.log("====================================");

});