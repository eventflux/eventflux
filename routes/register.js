var bcrypt = require('bcrypt');
var async  = require('async');
var mongoose = require('mongoose');
var userRouter = require('express').Router();
var jwt_secret = require('../config').JWT_SECRET;
var express_jwt = require('express-jwt');

var User = mongoose.model('UsuarioModel');


userRouter.post('/', function(req, res, next) {

    // Comprobamos que nos ha indicado una contraseña y username
    if (!req.body.nombre || !req.body.password || !req.body.email) {
        res.status(500).send("Tiene que escribir un nombre, un password y un email");
        return;
    }

    bcrypt.hash(req.body.password, 12, function(err, contraseña_encriptada) {
        if (err) res.status(500).json(err);
        //guardem password encrpt.
        console.log("Contraseña encriptada: "+contraseña_encriptada);
        var user = new User(req.body);
        user.password = contraseña_encriptada;
        user.save(function(err, savedUser) {
            if (err) res.status(500).send(err);
            else {
                // No queremos enviar el password de vuelta al cliente
                // Para ello hay que hacer un toObject y un delete
                // Porqué? porque realmente saved_user no es un objeto
                // javascript, sino una instancia del modelo Usuario
                savedUser = savedUser.toObject();
                delete savedUser.password;
                // Devolvemos el documento guardado
                res.status(200).json(savedUser);
            }
        });

        /*
        bcrypt.compare('mi-contraseña', contraseña_encriptada, function(err, sonIguales) {
            console.log("asincrono: Deberia ser true: " + sonIguales);
            bcrypt.compare('mi_contraseña', contraseña_encriptada, function(err, sonIguales2) {
                console.log("asincrono: Deberia ser false: " + sonIguales2);
            });
        });
        */
    });
});

module.exports = userRouter;