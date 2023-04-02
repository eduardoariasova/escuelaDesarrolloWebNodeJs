// solicitudes
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));





app.get("/", function(req, res){
    res.sendFile(__dirname + "/home.html");
});

app.get("/calculadora", function(req, res){
    res.sendFile(__dirname + "/calculadora.html");
});


app.post("/calculadora", function(req, res){

    // asignar valores del formulario a variables
    var numeroUno = Number(req.body.numero1);
    var numeroDos = Number(req.body.numero2);
    var total     = numeroUno + numeroDos;

    console.log("Los números enviados en el método Post son: " + numeroUno + " y " + numeroDos);
    console.log("La sumatoria es: ", total);

    


    // redirección a página de gracias
    res.sendFile(__dirname + "/gracias.html");
});


app.get("/gracias", function(req, res){
    res.sendFile(__dirname + "/gracias.html");
});






app.listen(3000, function(){
    console.log("servidor iniciado en puerto 3000");
});