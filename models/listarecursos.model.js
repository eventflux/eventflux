var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var recursosModelSchema = new Schema([
	{
  		nombre: {type: String, require: true},
	  	cantidad: Number,
	  	recompensa: String,
	  	solicitudes: [{
	  		idUsuario: {type: Schema.Types.ObjectId, ref: 'EventoModel', default:[]},
	  		cantidad: Number,
	  		aceptado: {Boolean, default: false}
	  	}],
	  	eventoID: {type: Schema.Types.ObjectId, ref: 'EventoModel'}
  	}
  ]);

  recursosModelSchema.index({ nombre: 1, eventoID: 1}, { unique: true });


  mongoose.model('ListaRecursosModel', recursosModelSchema, 'listaRecursosModel');
};