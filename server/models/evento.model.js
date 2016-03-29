var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var eventoModelSchema = new Schema({
  	titulo: {type: String, require: true},
  	descripcion: String, //{type: String, require: true} no lo haria required, algun evento puede que no necesite
  	fecha: {type: Date, require: true},
  	estado: {type: String, default: "Pendiente"},
  	organizador: {type: Schema.Types.ObjectId, ref: "UsuarioModel"} //en principio solo tiene un organizador cada evento
  });

  mongoose.model('EventoModel', eventoModelSchema, 'eventoModel');
};