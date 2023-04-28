// solicitudes /////////////////////////////////
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
// solicitudes /////////////////////////////////


// Configuración de fecha /////////
let date = new Date();
let dia = date.getDate();
let mes = date.getMonth() + 1;
let año = date.getFullYear();
let fechaCompleta = dia + "/" + mes + "/" + año;
// Configuración de fecha /////////




// Crear entradas ///////////

// arrreglo que contiene objetosç
// [ {}, {}, {}, {} ];
var entradas = [
    {
        fecha: "3/6/2022",
        titulo: "Primera entrada",
        contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Urna et pharetra pharetra massa massa. Dui sapien eget mi proin sed libero enim. Est ultricies integer quis auctor elit. Felis imperdiet proin fermentum leo. Morbi tristique senectus et netus et malesuada. Eget mi proin sed libero enim. Vitae auctor eu augue ut lectus arcu. Aliquam etiam erat velit scelerisque in dictum. Imperdiet dui accumsan sit amet.",
    },
    {
        fecha: "3/7/2022",
        titulo: "Segunda entrada",
        contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Urna et pharetra pharetra massa massa. Dui sapien eget mi proin sed libero enim. Est ultricies integer quis auctor elit. Felis imperdiet proin fermentum leo. Morbi tristique senectus et netus et malesuada. Eget mi proin sed libero enim. Vitae auctor eu augue ut lectus arcu. Aliquam etiam erat velit scelerisque in dictum. Imperdiet dui accumsan sit amet.",
    },
    {
        fecha: "3/8/2022",
        titulo: "Tercera entrada",
        contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Urna et pharetra pharetra massa massa. Dui sapien eget mi proin sed libero enim. Est ultricies integer quis auctor elit. Felis imperdiet proin fermentum leo. Morbi tristique senectus et netus et malesuada. Eget mi proin sed libero enim. Vitae auctor eu augue ut lectus arcu. Aliquam etiam erat velit scelerisque in dictum. Imperdiet dui accumsan sit amet.",
    }
];
// Crear entradas ///////////




// home
app.route("/")
.get(function(req, res){

    let nuevasEntradas = [];
    entradas.forEach(element => {
        // reemplazar espacios por guines, y converir en minúsculas
        // añadimos / /g para reemplazar TODOS los espacios, no solo el primero que encuentre
        let urlEntrada = (element.titulo.replace(/ /g, "-")).toLowerCase();
       
        // creamos el nuevo documento
        let nuevoDoc = {
            fecha: element.fecha,
            titulo: element.titulo,
            contenido: element.contenido,
            url: urlEntrada
        }
        // ponemos el documento en el nuevo arreglo
        nuevasEntradas.push(nuevoDoc);
    });    
    res.render("home", {todasEntradas: nuevasEntradas});
});

// crear
app.route("/crear")
.get(function(req, res){
    res.render("crear",{fecha: fechaCompleta});
})
.post(function(req, res){
    // Guardamos los valores del método post en variables
    var fechaEntrada     = req.body.fechaEntrada;
    var tituloEntrada    = req.body.titulo;
    var contenidoEntrada = req.body.contenido;

    // Creamos un objeto para la nueva entrada
    var nuevaEntrada = {
        fecha: fechaEntrada,
        titulo: tituloEntrada,
        contenido: contenidoEntrada
    }

    //ponemos la nueva entrada en el arreglo de todas las entradas
    entradas.push(nuevaEntrada);



    res.redirect("/gracias");
});


//BUSCAR POST
app.route("/entradas/:cualPost")
.get(function(req, res){
    // guardar dato recibido en una variable
    let datoRecibido = req.params.cualPost;

    // buscamos en el arreglo
    entradas.forEach(element => {
        // reemplazar espacios por guines, y converir en minúsculas
        // añadimos / /g para reemplazar TODOS los espacios, no solo el primero que encuentre
        let urlEntrada = (element.titulo.replace(/ /g, "-")).toLowerCase();

        // comparar
        if(urlEntrada===datoRecibido){
            // renderizar
            res.render("entradaIndividual", {entrada: element});
        }
    }); 
});





// sobre nosotros
app.get("/nosotros", function(req, res){
    res.render("nosotros");
});


// Gracias
app.get("/gracias", function(req, res){
    res.render("gracias");
});






app.listen(3000, function(){
    console.log("servidor iniciado en puerto 3000");
});