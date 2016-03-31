var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var express_jwt = require('express-jwt');
var config = require('../config');
var ObjectId = require('mongoose').Types.ObjectId;


var router = require('express').Router();


var EventoModel = mongoose.model('EventoModel');
var UsuarioModel = mongoose.model('UsuarioModel');



 // Obtener lista eventos
router.get('/listaEventos', function(req, res) {
    EventoModel.find({/*aqui no ponemos ninguna condicion ya que los queremos todos*/}, function(err, eventos) {
        if (err) res.status(500).json(err);
        else res.status(200).json(eventos); //retornamos la lista de los eventos en formato JSON
    });
});

// Obtener usuario
router.post('/consultarEvento/:titulo/:fecha', function(req, res) { //supondre que se identifica por titulo-fecha
    EventoModel.findOne({ titulo: req.params.titulo, fecha: req.params.fecha}, function(err, evento) {
        if (err) res.status(500).json(err);
        else res.status(200).json(evento);
    });
});

// A partir de aquí todas las rutas van a requerir estar autenticado
// Por eso usamos el middleware de express_jwt, pasandole el SECRET para
// que pueda desencriptar el token y comprobar que es correcto
// Como especificamos requestProperty: 'usuario' en req.usuario tendremos
// la info del usuario desencriptada
router.use(express_jwt({ secret: config.JWT_SECRET, requestProperty: 'user' }));

// Crear evento
router.post('/newEvent', function(req, res) {
    var eventoInstance = new EventoModel(req.body);
    console.log("nombre->"+req.user.nombre);
    console.log("email->"+req.user.email);
    UsuarioModel.findOne({email: req.user.email}, function(err, infoUser) {
         if (err) res.status(500).send(err);
         else {
            eventoInstance.organizador = infoUser._id;
            eventoInstance.save(function(err, newEvento) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).json({ evento: newEvento });
                }
            });
         }
    });

});

// Si no ha entrado en ninguna ruta anterior, error 404 not found
router.all('*', function(req, res) { res.status(404).send("Error 404 not found"); });

module.exports = router;










