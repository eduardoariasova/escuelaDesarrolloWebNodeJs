// solicitudes /////////////////////////////////
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
// Configuración express
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
// Configuración sesión
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
// Configuración express
// inicializamos passport y sesión.
app.use(passport.initialize());
app.use(passport.session());
// solicitudes /////////////////////////////////


// CONFIGURACIÓN BASE DE DATOS MONGODB /////////////////////////////////
// URL de conexión está en archivo .env en la variable "BASEDEATOS". Crea tu cuenta y reemplaza tu contraseña. 
// El archivo no lo podrás ver en el respositorio porque se oculta con gitignore para proteger contraseñas.
mongoose.connect(process.env.BASEDEDATOS, {useNewUrlParser: true});
// CONFIGURACIÓN BASE DE DATOS MONGODB /////////////////////////////////


// ENTRADAS ////////////////////////////////////
//schema
const entradasSechema = {
    fecha: String,
    titulo: String,
    contenido: String,
}
//Modelo
const EntradaModelo = mongoose.model("Entrada", entradasSechema);
// ENTRADAS ////////////////////////////////////


// USUARIOS //////////////////////////////////
const Schema = mongoose.Schema;
const usuarioSechema = new Schema ({
    username: String,
    googleId: String,
});
// USUARIOS //////////////////////////////////

// HASH Y SALT //////////////////////////////
usuarioSechema.plugin(passportLocalMongoose);
// Agregamos find or create al schema
usuarioSechema.plugin(findOrCreate);
// HASH Y SALT //////////////////////////////

// Modelo usuarios
const Usuario = mongoose.model("Usuario", usuarioSechema);
// Creamos estrategia a partir del modelo
passport.use(Usuario.createStrategy());


// serializar - deserializar /////////////////
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id });
    });
});
  
passport.deserializeUser(function(user, cb) {
process.nextTick(function() {
    return cb(null, user);
});
});
// serializar - deserializar /////////////////


// CONFIGURACIÓN AUTENTICACION GOOGLE //////////////
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/crear"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    Usuario.findOrCreate({ googleId: profile.id }, {username: profile.displayName}, function (err, user) {
      return cb(err, user);
    });
  }
));
// CONFIGURACIÓN AUTENTICACION GOOGLE //////////////















// Configuración de fecha /////////
let date = new Date();
let dia = date.getDate();
let mes = date.getMonth() + 1;
let año = date.getFullYear();
let fechaCompleta = dia + "/" + mes + "/" + año;
// Configuración de fecha /////////



// Iniciar sesión
app.route("/iniciar-sesion")
.get(function(req, res){
    res.render("iniciar");
});

// Registrar
app.route("/registrar")
.get(function(req, res){
    res.render("registrar");
});

// auth google
app.get('/auth/google',passport.authenticate('google', { scope: ['profile'] }));
// Callback auth google
app.route("/auth/google/crear")
.get( passport.authenticate('google', { failureRedirect: "/iniciar-sesion" }),
    function(req, res) { res.redirect("/crear");
});

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

    if(req.isAuthenticated()){
        res.render("crear",{fecha: fechaCompleta});
    }
    else{
        res.render("iniciar");
    }
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

//BUSCAR POST - 
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
    idEntrada      = req.body.idEntrada;
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









