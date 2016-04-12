var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var eventoModelSchema = new Schema({
  	titulo: {type: String, require: true},
  	descripcion: String, //{type: String, require: true} no lo haria required, algun evento puede que no necesite
  	fechaIni: {type: String, require: true},
    fechaFin: {type: String, require: true},
    horaIni: {type: String, require: true},
    horaFin: {type: String, require: true},
  	estado: {type: String, default: "Pendiente"},
  	organizador: {type: String, require: true}, //en principio solo tiene un organizador cada evento
  	ubicacion: {type: String, require: true},
    foto: String
  });

  eventoModelSchema.index({ ubicacion: 1, fecha: 1}, { unique: true });

  mongoose.model('EventoModel', eventoModelSchema, 'eventoModel');
};