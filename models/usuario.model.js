var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var usuarioModelSchema = new Schema({
	email: {type: String, required: true, unique: true, index: true},
	nombre: {type: String, required: true},
    apellidos: String,
    password: {type: String, required: true},
    edad: Number,
    reputacion: { type: Number, min: 0, max: 100 },
    eventos: [{type: Schema.Types.ObjectId, ref: 'EventoModel', default:[]}]
  });

  mongoose.model('UsuarioModel', usuarioModelSchema, 'usuarioModel');
};