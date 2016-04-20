var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var eventoModelSchema = new Schema({
  	titulo: {type: String, required: true},
  	descripcion: String, //{type: String, require: true} no lo haria required, algun evento puede que no necesite
  	fechaIni: {type: String, required: true},
    fechaFin: {type: String, required: true},
    horaIni: {type: String, required: true},
    horaFin: {type: String, required: true},
  	estado: {type: String, default: "Pendiente"},
  	organizador: {type: String, required: true}, //en principio solo tiene un organizador cada evento
  	ubicacion: {type: String, required: true},
    foto: String,
    listaRecursos: [{type: Schema.Types.ObjectId, ref: 'ListaRecursosModel', default:[]}]
  });

  eventoModelSchema.index({ ubicacion: 1, fechaIni: 1}, { unique: true });

  mongoose.model('EventoModel', eventoModelSchema, 'eventoModel');
};

//tendremos que mirar por codigo que fechaIni<=fecha<=fechaFin devuelve false