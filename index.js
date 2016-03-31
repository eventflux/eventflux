var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var mongoose = require('mongoose');

// Módulo que usaremos para obtener el middleware de la autenticación
var express_jwt = require('express-jwt');

var models = require('./models');

// config.js es un fichero con constantes
var config = require('./config');

var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/eventflux'

// Conectamos a la BD
mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

// Inicializamos los modelos
models.initialize();

var app = express();

// Middleware que parsea el body
app.use(bodyParser.json());

// Importamos los módulos enrutadores

// del recurso 'users'
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
var eventoRouter = require('./routes/evento');

// Y los usamos para los caminos que toquen
app.use('/register',  registerRouter);
app.use('/login',  loginRouter);
app.use('/evento',  eventoRouter);

var theport = process.env.PORT || 8080;

http.createServer(app).listen(theport);










