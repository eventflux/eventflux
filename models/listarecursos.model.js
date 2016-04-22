var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var recursosModelSchema = new Schema({
  		nombre: {type: String, required: true},
	  	cantidad: Number,
	  	recompensa: String,
	  	solicitudes: [{
	  		idUsuario: {type: Schema.Types.ObjectId, ref: 'UsuarioModel'},
	  		cantidad: Number,
	  		aceptado: Boolean
	  	}],
	  	eventoID: {type: Schema.Types.ObjectId, ref: 'EventoModel'}
  	});

  recursosModelSchema.index({ nombre: 1, eventoID: 1}, { unique: true });


  mongoose.model('ListaRecursosModel', recursosModelSchema, 'listaRecursosModel');
};