var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var eventoModelSchema = new Schema({
  	titulo: {type: String, require: true},
  	descripcion: String, //{type: String, require: true} no lo haria required, algun evento puede que no necesite
  	fecha: {type: String, require: true},
  	estado: {type: String, default: "Pendiente"},
  	organizador: {type: String, require: true}, //en principio solo tiene un organizador cada evento
  	ubicacion: {type: String, require: true}
  });

  mongoose.model('EventoModel', eventoModelSchema, 'eventoModel');
};