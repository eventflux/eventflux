var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var express_jwt = require('express-jwt');
var config = require('../config');
var ObjectId = require('mongoose').Types.ObjectId;


var router = require('express').Router();


var EventoModel = mongoose.model('EventoModel');
var UsuarioModel = mongoose.model('UsuarioModel');
var ListaRecursosModel = mongoose.model('ListaRecursosModel');



router.get('/infoUsuario/:email', function(req, res) {
    UsuarioModel.findOne({ email: req.params.email }, function(err, usuario) {
        if (err) res.status(500).json(err);
        else if (!usuario) res.status(404).json("No existe el usuario");
        else {
            res.status(200).json(usuario);
        }
    });
});

router.get('/listaUsuarios', function(req, res) {
    UsuarioModel.find({}, function(err, usuarios) {
        if (err) res.status(500).json(err);
        else {
            res.status(200).json(usuarios);
        }
    });
});

// Si no ha entrado en ninguna ruta anterior, error 404 not found
router.all('*', function(req, res) { res.status(404).send("Error 404 not found"); });

module.exports = router;