var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var express_jwt = require('express-jwt');
var config = require('../config');
var ObjectId = require('mongoose').Types.ObjectId;


var router = require('express').Router();


var EventoModel = mongoose.model('EventoModel');
var UsuarioModel = mongoose.model('UsuarioModel');
var ListaRecursosModel = mongoose.model('ListaRecursosModel');


 // Obtener lista eventos
router.get('/listaEventosCompletConRecursos/:ubicacion/:fechaIni', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, evento) {
        if (err) res.status(500).json(err);
        else if (evento) {
            ListaRecursosModel.find({ _id: {$in: evento.listaRecursos} }, function(err, recursos) {
                if (err) res.status(500).json(err);
                else {
                    var aux = JSON.parse('{}');
                    aux["evento"] = evento;
                    aux["recursos"] = recursos;
                    res.status(200).json(aux);//devolvemos toda la info de las agendas que tiene el usuario
                }
            });
        } //retornamos la lista de los eventos en formato JSON 
        else res.status(404).json("No existe el evento");
    });
});

router.get('/listaRecursos/:ubicacion/:fechaIni', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(500).json(err);
        else {
            
            ListaRecursosModel.find({ eventoID: eventos._id }, function(errr, recursos) {
                if (errr) res.status(500).json(errr);
                else {
                    res.status(200).json(recursos);
                }
            });

        }
    });
});

 // Obtener lista eventos
router.get('/listaRecursosComplet', function(req, res) {
    //var now = new Date();
    //console.log(now.getDay());
    ListaRecursosModel.find({/*aqui no ponemos ninguna condicion ya que los queremos todos*/}, function(err, eventos) {
        if (err) res.status(500).json(err);
        else res.status(200).json(eventos); //retornamos la lista de los eventos en formato JSON 
    });
});


router.get('/listaEventos', function(req, res) {
    EventoModel.find({/*aqui no ponemos ninguna condicion ya que los queremos todos*/}, function(err, eventos) {
        if (err) res.status(500).json(err);
        else {
            console.log(eventos);
            var aux = JSON.parse('[]');

            for (var i = 0; i < eventos.length; ++i) {
                var a = JSON.parse('{}');
                a["titulo"] = eventos[i].titulo;
                a["fechaIni"] = eventos[i].fechaIni;
                a["organizador"] = eventos[i].organizador;
                a["ubicacion"] = eventos[i].ubicacion;
                a["_id"] = eventos[i]._id;
                aux.push(a);
            }
            res.status(200).json(aux); //retornamos la lista de los eventos en formato JSON
        }
    });
});

router.get('/listaEventos', function(req, res) {
    //var now = new Date();
    //console.log(now.getDay());
    EventoModel.find({/*aqui no ponemos ninguna condicion ya que los queremos todos*/}, function(err, eventos) {
        if (err) res.status(500).json(err);
        else {
            var aux = JSON.parse('[]');

            for (var i = 0; i < eventos.length; ++i) {
                var a = JSON.parse('{}');
                a["titulo"] = eventos[i].titulo;
                a["fechaIni"] = eventos[i].fechaIni;
                a["organizador"] = eventos[i].organizador;
                a["ubicacion"] = eventos[i].ubicacion;
                a["_id"] = eventos[i]._id;
                aux.push(a);
            }
            res.status(200).json(aux); //retornamos la lista de los eventos en formato JSON
        }
    });
});

// Obtener evento
router.get('/consultarEvento/:ubicacion/:fechaIni', function(req, res) { //supondre que se identifica por ubicacion-fecha
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni}, function(err, evento) {
        if (err) res.status(500).json(err);
        else res.status(200).json(evento);
    });
});

// A partir de aquí todas las rutas van a requerir estar autenticado
// Por eso usamos el middleware de express_jwt, pasandole el SECRET para
// que pueda desencriptar el token y comprobar que es correcto
// Como especificamos requestProperty: 'usuario' en req.usuario tendremos
// la info del usuario desencriptada
router.use(express_jwt({ secret: config.JWT_SECRET, requestProperty: 'user' }));

// Crear evento
router.post('/newEvent', function(req, res) {

    /*
    var now = new time.Date();
    now.setTimezone('UTC+1');
    var anoActual = now.getYear();
    var mesActual = now.getMonth();
    var diaActual = now.getDay();
    console.log(anoActual + " " + mesActual + " " + diaActual);
    */

    EventoModel.find({ ubicacion: req.body.ubicacion}, function(err, eventos) {
        if (err) res.status(600).json(err);
        var fIni = req.body.fechaIni;
        var trobat = false;
        for (var i = 0; i < eventos.length && !trobat; ++i) {
            if (eventos[i].fechaIni <= fIni <= eventos[i].fechaFin){
                trobat = true;
            } 
        }
        if (trobat) res.status(404).json("Ya existe un evento con esta ubicacion y fecha");
        else {
            var eventoInstance = new EventoModel(req.body);
            eventoInstance.organizador = req.user.email;
            eventoInstance.save(function(err, newEvento) {
              if (err) {
                    res.status(601).send(err);
                } else {
                    var query = {email: req.user.email};
                    var update = { $push: { eventos: newEvento._id } };

                    // Indica que queremos que el objeto que nos devuelva la callback (updated)
                    // sea el nuevo (después de haberle aplicado la actualización) y no el viejo
                    // Si no lo ponemos por defecto nos pone el viejo
                    var options = { 'new': true };

                    UsuarioModel.findOneAndUpdate(query, update, options, function(err, updated) {
                        if (err) {
                            res.status(601).json(err);
                        }
                        else {
                            res.status(200).json(updated);
                        }
                    });
                }
            });
        }

    });
});

router.post('/anadirRecursos/:ubicacion/:fechaIni', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni}, function(err, evento) {
        if (err) {
            res.status(500).json(err);
        }
        else if (!evento) {
            res.status(404).json(err);
        }
        else {
            console.log(req.body.recursos);
            for(var i = 0; i<req.body.recursos.length; ++i) {
                //do something with e.g. req.body[key]
                var rec = req.body.recursos[i];
                //console.log("rec->", JSON.parse(JSON.stringify(rec)));
                rec.eventoID = evento._id;
                var listaRecursosInstance = new ListaRecursosModel(rec);
                //console.log("rec2->"+listaRecursosInstance);
                //console.log('flor', JSON.parse(JSON.stringify(listaRecursosInstance)))
                listaRecursosInstance.save(function(err, newRecurso) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        console.log("newrecurso->"+JSON.stringify(newRecurso));
                        var query = { _id: evento._id};
                        console.log(newRecurso._id);
                        var update = { $push: { listaRecursos: newRecurso._id } };

                        // Indica que queremos que el objeto que nos devuelva la callback (updated)
                        // sea el nuevo (después de haberle aplicado la actualización) y no el viejo
                        // Si no lo ponemos por defecto nos pone el viejo
                        var options = { 'new': true };
                        console.log("heyhey");

                        EventoModel.findOneAndUpdate(query, update, options, function(err, updated) {
                            if (err) {
                                res.status(500).json(err);
                            }
                            else {
                                //res.status(200).json(updated);
                            }
                        });
                    }
                });
            }
            res.status(200).json("correcte");
        }
    });
});

router.delete('/borrarRecurso/:ubicacion/:fechaIni/:nombre', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(511).json(err);
        else {
            ListaRecursosModel.findOne({ eventoID: eventos._id, nombre: req.params.nombre }, function(err, recurso) {
                if (err) res.status(500).json(err);
                else { 
                    ListaRecursosModel.remove({ _id: recurso._id }, function(err){
                        if(!err) {
                          res.status(200).end();
                        }
                    });
                    res.status(200).json(recurso); 
                }
            });

        }
    });
});

router.get('/participarRecurso/:ubicacion/:fechaIni/:nombreRecurso/:idUsuario/:cantidad', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(511).json(err); 
        else {
            
            ListaRecursosModel.findOne({ eventoID: eventos._id, nombre: req.params.nombreRecurso }, function(err, recurso) {
                if (err) res.status(500).json(err);
                else { 
                    var query = { _id: recurso._id };
                    
                    var idU = ""+req.params.idUsuario;
                    
                
                    var update = { $push: { "solicitudes": { "$each": [ { "idUsuario": idU , "cantidad": req.params.cantidad } ] } } };
                
                    var options = { 'new': true };
                    ListaRecursosModel.findOneAndUpdate(query, update, options, function(err, updated) {
                        if (err) {
                            res.status(500).json(err);
                        }
                        else {
                           
                            res.status(200).json(updated);
                        }
                    });
                }
            });
        }
    });
});

router.get('/confirmarParticipante/:ubicacion/:fechaIni/:nombreRecurso/:idSolicitud', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(511).json(err); 
        else {
            ListaRecursosModel.findOne({ eventoID: eventos._id, nombre: req.params.nombreRecurso }, function(err, recurso) {
                if (err) res.status(500).json(err);
                else { 
                    
                    for (var i = 0; i < recurso.solicitudes.length; i++) {
                        var solJ = JSON.parse(JSON.stringify(recurso.solicitudes[i]) );
                        if( solJ._id == req.params.idSolicitud ){
                            var idS = ""+solJ._id;
                            var cantidad = ""+solJ.cantidad;

                            var query = { _id: recurso._id };
                            var update = { $pull: { "solicitudes":  { "_id": idS  } } };
                            //var update = { $push: { "solicitudes": { "$each": [ { "aceptado": "true" } ] } } };
                            var options = { 'new': true };
                            ListaRecursosModel.findOneAndUpdate(query, update, options, function(err, updated) {
                                if (err) {
                                    res.status(500).json(err);
                                }
                                else {
                                    //res.status(200).json(updated);
                                }
                            });

                            var idU = ""+solJ.idUsuario;
                            var cantidad = ""+solJ.cantidad;

                            var query = { _id: recurso._id };
                            //var update = { $push: { "solicitudes":  { "_id": idS  } } };
                            var update = { $push: { "solicitudes": { "$each": [ { "idUsuario": idU , "cantidad": cantidad, "aceptado": "true" } ] } } };
                            var options = { 'new': true };
                            ListaRecursosModel.findOneAndUpdate(query, update, options, function(err, updated) {
                                if (err) {
                                    res.status(500).json(err);
                                }
                                else {
                                    res.status(200).json(updated);
                                }
                            });

                        }                       
                    }             
                    //res.status(520).json(recurso);
                }
            });
        }
    });
});

// Si no ha entrado en ninguna ruta anterior, error 404 not found
router.all('*', function(req, res) { res.status(404).send("Error 404 not found"); });

module.exports = router;