var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var usuarioModelSchema = new Schema({
	email: {type: String, require: true, unique: true, index: true},
	nombre: {type: String, require: true},
    apellidos: String,
    password: {type: String, require: true},
    edad: Number,
    reputacion: { type: Number, min: 0, max: 100 }
  });

  mongoose.model('UsuarioModel', usuarioModelSchema, 'usuarioModel');
};