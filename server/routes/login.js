// Necesitamos obtener el secret para poder generar el token
var config = require('../config');
var authRouter = require('express').Router();
var async = require('async');
var bcrypt = require('bcrypt');

// Este módulo lo utilizaremos para generar el token
var jwt = require('jsonwebtoken');

// Obtenemos el modelo del usuario
var mongoose = require('mongoose');

var UserModel = mongoose.model('UsuarioModel');
/**
 * En esta ruta se generará un token de autenticación a enviar al usuario. El cliente
 * usa este token para acceder a las rutas protegidas de la API, es decir,
 * aquellas que requieran de login.
 */
authRouter.post('/', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    async.waterfall([
        function(callback) {
            // Buscamos el usuario en la BD
            UserModel.findOne({ email: email }, callback);
        },
        function(user, callback) {
            // Si no existe respondemos con error
            if (!user) res.status(404).send("This user doesn't exists");
            // Sino comparamos la contraseña `a pelo` que nos ha enviado el cliente
            // con la encriptada que habia en la BD
            else bcrypt.compare(password, user.password, callback); //esta funcion encripta el password, y luego lo
                                                                    // compara con el guardado en la bd, que ya esta encriptado
        },
        function(equalPasswords, callback) {
            // Si no son iguales respondemos con error
            if (!equalPasswords) res.status(401).send("Wrong password");
            else {
                // Si no creamos el token con info de username y password
                // (no ponemos el array de tareas porque podría ser grande,
                // y nos interesa mantener el token pequeñito)
                // y le pasamos tambien el string secreto que tenemos en config.js
                // y le ponemos que expire al cabo de 1 día

                // Ahora no hay que hacer toObject porque ya es un objeto javascript
                // No como antes que era una instancia de un modelo de mongoose
                var token = jwt.sign(
                    { email: email, password: password },
                    config.JWT_SECRET,
                    { expiresInSeconds: 24*60*60 } // 1 día
                );
                // Y se lo devolvemos al cliente
                res.status(200).send({ token: token });
            }
        }
    ], function(error) {
        // Si ha habido error en alguna de las callbacks, devolvemos error
        if (error) res.status(500).json(error);
    });
});

module.exports = authRouter;