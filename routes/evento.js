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
router.get('/listaRecursosComplet', function(req, res) {
    //var now = new Date();
    //console.log(now.getDay());
    ListaRecursosModel.find({/*aqui no ponemos ninguna condicion ya que los queremos todos*/}, function(err, eventos) {
        if (err) res.status(500).json(err);
        else res.status(200).json(eventos); //retornamos la lista de los eventos en formato JSON 
    });
});

 // Obtener lista eventos
router.get('/listaEventosComplet', function(req, res) {
    //var now = new Date();
    //console.log(now.getDay());
    EventoModel.find({/*aqui no ponemos ninguna condicion ya que los queremos todos*/}, function(err, eventos) {
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
        if (err) res.status(500).json(err);
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
                    res.status(500).send(err);
                } else {
                    var query = {email: req.user.email};
                    var update = { $push: { eventos: newEvento._id } };

                    // Indica que queremos que el objeto que nos devuelva la callback (updated)
                    // sea el nuevo (después de haberle aplicado la actualización) y no el viejo
                    // Si no lo ponemos por defecto nos pone el viejo
                    var options = { 'new': true };

                    UsuarioModel.findOneAndUpdate(query, update, options, function(err, updated) {
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

            /*for (var k = 0; k < req.body.length; ++k) {
                var aux = req.body[k];
                console.log("aux->"+JSON.stringify(aux));
                var listaRecursosInstance = new ListaRecursosModel(req.body[k]);
                listaRecursosInstance.save(function(err, newRecurso) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        console.log("newrecurso->"+newRecurso);
                        var query = { ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni};
                        console.log(newRecurso._id);
                        var update = { $push: { listaRecursos: newRecurso._id } };

                        // Indica que queremos que el objeto que nos devuelva la callback (updated)
                        // sea el nuevo (después de haberle aplicado la actualización) y no el viejo
                        // Si no lo ponemos por defecto nos pone el viejo
                        var options = { 'new': true };

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
        }*/
    });
});


/*
router.post('/anadirRecursos/:ubicacion/:fechaIni', function(req, res) {
    var listaRecursosNueva = req.body;
    if(!listaRecursosNueva.length) res.status(510).json("Debes introducir una lista. Aunque solo haya un recurso por añadir");
    else {
        EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni}, function(err, evento) {
            if (err) res.status(500).json(err);
            else {
                if (!evento) res.status(404).json("El evento no existe");
                else {
                    ListaRecursosModel.find({_id: {$in: evento.listaRecursos}}, function(err, listaRecursosActual) {
                        if (err) res.status(500).json(err);
                        else {
                            //recursos tiene la lista de los recursos del evento en cuestion
                            //if (listaRecursosActual == null) listaRecursosActual = [];
                            var trobat;
                            for (var i = 0; i < listaRecursosNueva.length; i++) {                     
                                trobat = false;
                                for (var j = 0; j < listaRecursosActual.length && !trobat; j++) { 
                                    if (listaRecursosNueva[i].nombre == listaRecursosActual[j].nombre) {
                                        //console.log("entro trobat");
                                        //hay una coincidencia con un nombre, con lo que se modifica automaticamente cantidad y recompensa, para no eliminar las solicitudes
                                        listaRecursosActual[j].cantidad = listaRecursosNueva[i].cantidad;
                                        listaRecursosActual[j].recompensa = listaRecursosNueva[i].recompensa;
                                        trobat = true;
                                    }
                                }
                                if (!trobat) {
                                    //console.log("entro no trobat");
                                    //console.log("Que posem?->"+JSON.stringify(listaRecursosNueva[i]));
                                    //no s'ha trobat, per lo que hem de crear el recurs a la bd
                                    console.log(listaRecursosNueva);
                                    console.log(listaRecursosNueva[0]);
                                    var s = ""+listaRecursosNueva[i];
                                    listaRecursosActual.push(listaRecursosNueva[i]);

                                }
                            }
                            //Ahora en listaRecursosActual hay la nueva lista, con lo que tenemos que guardar eso

                            //console.log("listaRecursosActual->"+JSON.stringify(listaRecursosActual)+"<-----");
                            //console.log("listaRecursosNueva->"+JSON.stringify(listaRecursosNueva)+"<-----");

                            //hasta ahi todo bien
                            for (var k = 0; k < listaRecursosActual.length; k++) {
                                console.log("k->"+k+"<-----");
                                //actualizamos todas los recursos
                                if (!listaRecursosActual[k]._id) {
                                    console.log("listRec de k->"+JSON.stringify(listaRecursosActual[k])+"<-");
                                    //creamos el recurso
                                    var recursoInstance = new ListaRecursosModel(listaRecursosActual[k]);
                                    console.log("recinsta->"+JSON.stringify(recursoInstance));
                                    recursoInstance.save(function(err, newRecurso) {
                                        if (err) res.status(500).send(err);
                                        else {
                                            //hemos crado un recurso que ahora tiene que añadirse a la lista de recursos del evento
                                            console.log("newRecueso->"+newRecurso);
                                            var query = {ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni};
                                            var update = { $push: { listaRecursos: newRecurso._id } };

                                            // Indica que queremos que el objeto que nos devuelva la callback (updated)
                                            // sea el nuevo (después de haberle aplicado la actualización) y no el viejo
                                            // Si no lo ponemos por defecto nos pone el viejo
                                            var options = { 'new': true };

                                            EventoModel.findOneAndUpdate(query, update, options, function(err, updated) {
                                                if (err) {
                                                    res.status(500).json(err);
                                                }
                                                else {
                                                    res.status(200).json(updated);
                                                }
                                            });
                                        }

                                    });
                                } else {
                                    //aqui simplement s'ha d'actulitzar, ja que si el te
                                    //modificamos el recurso
                                    ListaRecursosModel.update({_id: recurso._id}, {$set: listaRecursosActual[k]}, function(err) {
                                        if(!err) {
                                            res.status(200).end();
                                        }
                                     });
                                }
                            }
                        }
                    });
                }
            }
        });
    }
});
*/


router.get('/listaRecursos/:ubicacion/:fechaIni', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, evento) {
        if (err) res.status(500).json(err);
        else {
            console.log("EVENTO: \n" + evento);
            ListaRecursosModel.find({ eventoID: evento._id }, function(err, recursos) {
                if (err) res.status(500).json(err);
                else {
                    res.status(200).json(recursos);
                }
            });
        }
    });
});

router.delete('/borrarRecurso/:ubicacion/:fechaIni/:nombreRecurso', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(511).json(err);
        else {
            ListaRecursosModel.find({ eventoID: eventos._id }, function(err, recursos) {
                if (err) res.status(500).json(err);
                else { 
                    var trobat = false;
                    for (var i = 0; i < recursos.length && !trobat; ++i ) {
                        if(recursos[i].nombre == req.body.nombreRecurso ) {
                            trobat = true;
                            ListaRecursosModel.remove({ _id: new ObjectId(recursos[i]._id )}, function(err){
                                if(!err) {
                                  res.status(200).end();
                                }
                            });
                            console.log("borrado");
                        }
                    }
                    res.status(200).json(recursos); 
                }
            });

        }
    });
});

router.delete('/borrarRecurso/:ubicacion/:fechaIni/:nombreRecurso', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(511).json(err);
        else {
            ListaRecursosModel.find({ eventoID: eventos._id }, function(err, recursos) {
                if (err) res.status(500).json(err);
                else { 
                    var trobat = false;
                    for (var i = 0; i < recursos.length && !trobat; ++i ) {
                        if(recursos[i].nombre == req.body.nombreRecurso ) {
                            trobat = true;
                            ListaRecursosModel.remove({ _id: new ObjectId(recursos[i]._id )}, function(err){
                                if(!err) {
                                  res.status(200).end();
                                }
                            });
                            console.log("borrado");
                        }
                    }
                    res.status(200).json(recursos); 
                }
            });

        }
    });
});

router.delete('/borrarRecurso/:ubicacion/:fechaIni/:nombreRecurso', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(511).json(err);
        else {
            ListaRecursosModel.find({ eventoID: eventos._id }, function(err, recursos) {
                if (err) res.status(500).json(err);
                else { 
                    var trobat = false;
                    for (var i = 0; i < recursos.length && !trobat; ++i ) {
                        if(recursos[i].nombre == req.body.nombreRecurso ) {
                            trobat = true;
                            ListaRecursosModel.remove({ _id: new ObjectId(recursos[i]._id )}, function(err){
                                if(!err) {
                                  res.status(200).end();
                                }
                            });
                            console.log("borrado");
                        }
                    }
                    res.status(200).json(recursos); 
                }
            });
            
        }
    });
});


router.post('/confirmarParticipacion/:ubicacion/:fechaIni/:nombreRecurso/:usario', function(req, res) {
    EventoModel.findOne({ ubicacion: req.params.ubicacion, fechaIni: req.params.fechaIni }, function(err, eventos) {
        if (err) res.status(511).json(err); 
        else {
            ListaRecursosModel.find({ eventoID: eventos._id }, function(err, recursos) {
                if (err) res.status(500).json(err);
                else { 
                    var trobat = false;
                    for (var i = 0; i < recursos.length && !trobat; ++i ) {
                        if(recursos[i].nombre == req.body.nombreRecurso ) {
                            trobat = true;
                            console.log( recursos[i].solicitudes );
                            
                //             ListaRecursosModel.remove({ _id: new ObjectId(recursos[i]._id )}, function(err){
                //                 if(!err) {
                //                   res.status(200).end();
                //                 }
                //             });
                //             console.log("borrado");
                //         }
                        }
                //     res.status(200).json(recursos); 
                    }
                }
            });
        }
    });
});

// Si no ha entrado en ninguna ruta anterior, error 404 not found
router.all('*', function(req, res) { res.status(404).send("Error 404 not found"); });

module.exports = router;