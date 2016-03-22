var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var usuarioModelSchema = new Schema({
	correo: {type: String, require: true},
	nombre: {type: String, require: true},
    apellidos: String,
    contraseña: {type: String, require: true}
  });

  mongoose.model('UsuarioModel', usuarioModelSchema, 'usuarioModel');
};