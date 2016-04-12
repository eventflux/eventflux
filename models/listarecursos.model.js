var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var recursosModelSchema = new Schema({
  	nombre: {type: String, require: true},
  	cantidad: String,
  	recompensa: String,
  	solicitudes: [{type: Schema.Types.ObjectId, ref: 'EventoModel', default:[]}],
  	evento: {type: String, require: true},
  });

  eventoModelSchema.index({ nombre: 1, evento: 1}, { unique: true });

  mongoose.model('ListaRecursosModel', eventoModelSchema, 'listaRecursosModel');
};