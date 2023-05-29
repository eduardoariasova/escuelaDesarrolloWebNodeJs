// solicitudes /////////////////////////////////
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
// solicitudes /////////////////////////////////

// CONFIGURACIÓN BASE DE DATOS MONGODB /////////////////////////////////
// URL de conexión está en archivo .env en la variable "BASEDEATOS". Crea tu cuenta y reemplaza tu contraseña. 
// El archivo no lo podrás ver en el respositorio porque se oculta con gitignore para proteger contraseñas.
mongoose.connect(process.env.BASEDEDATOS, {useNewUrlParser: true});

//1. schema
const entradasSechema = {
    fecha: String,
    titulo: String,
    contenido: String,
}

//2. Modelo
const EntradaModelo = mongoose.model("Entrada", entradasSechema);

// CLUSTER: (contiene base de datos)
// - BASE DE DATOS (contiene una o varias colecciones)
// - - COLECCIONES (contiene documentos)


//CRUD: CREATE, READ, UPDATE, DELETE
//A) CREATE /////////
// const entradaDos = new EntradaModelo( {
//     fecha: "3/7/2022",
//     titulo: "Segunda entrada",
//     contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Urna et pharetra pharetra massa massa. Dui sapien eget mi proin sed libero enim. Est ultricies integer quis auctor elit. Felis imperdiet proin fermentum leo. Morbi tristique senectus et netus et malesuada. Eget mi proin sed libero enim. Vitae auctor eu augue ut lectus arcu. Aliquam etiam erat velit scelerisque in dictum. Imperdiet dui accumsan sit amet.",
// });

// const entradaTres = new EntradaModelo({
//     fecha: "3/8/2022",
//     titulo: "Tercera entrada",
//     contenido: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Urna et pharetra pharetra massa massa. Dui sapien eget mi proin sed libero enim. Est ultricies integer quis auctor elit. Felis imperdiet proin fermentum leo. Morbi tristique senectus et netus et malesuada. Eget mi proin sed libero enim. Vitae auctor eu augue ut lectus arcu. Aliquam etiam erat velit scelerisque in dictum. Imperdiet dui accumsan sit amet.",
// });
// const documentosAsubir = [entradaDos, entradaTres];
// EntradaModelo.insertMany(documentosAsubir);

//B) READ /////////
// EntradaModelo.find().then( (data) => {
//     console.log(data);
// } );
// CONFIGURACIÓN BASE DE DATOS MONGODB /////////////////////////////////






// Configuración de fecha /////////
let date = new Date();
let dia = date.getDate();
let mes = date.getMonth() + 1;
let año = date.getFullYear();
let fechaCompleta = dia + "/" + mes + "/" + año;
// Configuración de fecha /////////




// home
app.route("/") 
.get(function(req, res){

    EntradaModelo.find().then( (entradas) => {
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
    var nuevaEntrada = new EntradaModelo({
        fecha: fechaEntrada,
        titulo: tituloEntrada,
        contenido: contenidoEntrada
    });

    nuevaEntrada.save();
    res.redirect("/gracias");
});

//BUSCAR POST 
app.route("/entradas/:cualPost")
.get(function(req, res){


    EntradaModelo.find().then( (entradas) => {
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
});

//ACTUALIZAR POST
app.route("/actualizar")
.post(function(req, res){
    //crear variables
    idEntrada   = req.body.idEntrada;
    nuevoContenido = req.body.contenidoActualizado;
    

    try {
        // busca un documento con el id. Luego reemplaza solo el campo "contenido" con el valor asigando.
        EntradaModelo.updateOne({_id: idEntrada}, {$set: {"contenido": nuevoContenido} }).then( (data) =>{
            console.log("finalizado");
            res.redirect("/gracias");
        } );
    } catch (error) { console.log(error);}
});

//BORRAR POST
app.route("/borrar")
.post(function(req, res){
    idEntrada   = req.body.idEntrada;

    try {
        // busca un documento con el id. Luego reemplaza solo el campo "contenido" con el valor asigando.
        EntradaModelo.deleteOne({_id: idEntrada}).then( (data) =>{
            console.log("finalizado");
            res.redirect("/gracias");
        } );
    } catch (error) { console.log(error);}
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









