var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {
  var userModelSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    nombre: String,
    edad: { type: Number, min: 18, max: 65 },
    reputacion: { type: Number, min: 0, max: 100 }
  });

  mongoose.model('UserModel', userModelSchema, 'userModels');
};