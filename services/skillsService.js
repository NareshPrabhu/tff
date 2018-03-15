const mongoose = require('mongoose'),
    logger = require('../config/logger'),
    User = require('../models/user'),
    Employee = require('../models/employee'),
    Language = require('../models/language'),
    Software = require('../models/software'),
    Spec = require('../models/spec'),
    Certification = require('../models/certification'),
    Category = require('../models/category');

class SkillsService {

    getAllLanguages(req, res) {
        Language.find()
            .select('name level -_id')
            .exec((err, data) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).send({message: 'Cannot get languages'});
                }

                res.json(data);
            });
    }
    getAllSpecializations(req, res) {
        Spec.find()
            .select('name level -_id')
            .exec((err, data) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).send({message: 'Cannot get specializations'});
                }

                res.json(data);
            });
    }
    getAllSoftware(req, res) {
        Software.find()
            .select('name level -_id')
            .exec((err, data) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).send({message: 'Cannot get software'});
                }

                res.json(data);
            });
    }
    getAllCertifications(req, res) {
        Certification.find()
            .select('name -_id')
            .exec((err, data) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).send({message: 'Cannot get certifications'});
                }

                res.json(data);
            });
    }
    getAllCategories(req, res) {
        Category.find()
            .select('name -_id')
            .exec((err, data) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).send({message: 'Cannot get categories'});
                }

                res.json(data);
            });
    }

    changeNamesToIdsGET(req, res, next) {

        let propertiesMap = new Map();
        let lastProperty = null;
        let nextError = false;


        if(req.query.categories) {
            propertiesMap.set('categories', Category);
            lastProperty = 'categories';
            if(!(req.query.categories instanceof Array))
                req.query.categories = [req.query.categories];
        }
        if(req.query.languages && req.query.languages.length > 0) {
            propertiesMap.set('languages', Language);
            lastProperty = 'languages';
            if(!(req.query.languages instanceof Array))
                req.query.languages = [req.query.languages];
        }
        if(req.query.software && req.query.software.length > 0) {
            propertiesMap.set('software', Software);
            lastProperty = 'software';
            if(!(req.query.specs instanceof Array))
                req.query.specs = [req.query.specs];
        }
        if(req.query.specs && req.query.specs.length > 0) {
            propertiesMap.set('specs', Spec);
            lastProperty = 'specs';
            if(!(req.query.software instanceof Array))
                req.query.software = [req.query.software];
        }
        if(req.query.certifications && req.query.certifications.length > 0) {
            propertiesMap.set('certifications', Certification);
            lastProperty = 'certifications';
            if(!(req.query.certifications instanceof Array))
                req.query.certifications = [req.query.certifications];
        }
        if(lastProperty === null)
            next();


        for(let [name, object] of propertiesMap) {


            let idPromise = new Promise((resolve, reject) => {
                let ids = new Array();
                for(let n of req.query[name]) {

                    object.findOne({name: n}, (err, data) => {

                        if(err) {

                            logger.error(err);
                            return reject(err);
                        }
                        if(!data)
                            return reject('We do not support that');
                        ids.push(data._id);
                        if(ids.length === req.query[name].length)
                            resolve(ids);


                    });
                }
            });

            idPromise
                .then((ids) => {
                    req.query[name] = ids;
                    if(name === lastProperty && !nextError)
                        next();

                })
                .catch((err) => {
                    console.log(err);
                    nextError = true;
                    logger.error(err);
                    return res.status(409).json({message: err});
                });
        }
    }

    // update(req, res) {
    //
    //     let propertiesMap = new Map();
    //     let lastProperty;
    //     let updateArray;
    //     let updateID = req.employeeID || req.askID;
    //
    //
    //     if(req.body.categories !== undefined) {
    //         propertiesMap.set('categories', Category);
    //         lastProperty = 'categories';
    //     }
    //     if(req.body.languages !== undefined) {
    //         propertiesMap.set('languages', Language);
    //         lastProperty = 'languages';
    //     }
    //     if(req.body.software !== undefined) {
    //         propertiesMap.set('software', Software);
    //         lastProperty = 'software';
    //     }
    //     if(req.body.specs) {
    //         propertiesMap.set('specs', Spec);
    //         lastProperty = 'specs';
    //     }
    //     if(req.body.certifications) {
    //         propertiesMap.set('certifications', Certification);
    //         lastProperty = 'certifications';
    //     }
    //     if(req.employeeID)
    //         updateArray = 'employees';
    //     else
    //         if(req.askID)
    //             updateArray = 'asks';
    //
    //     if(!lastProperty) {
    //         res.status(200).json({success: 'Updated'});
    //     }
    //     for(let [name, object] of propertiesMap) {
    //
    //
    //         let removePromise = new Promise((resolve, reject) => {
    //             if(req[name] instanceof Array){
    //
    //                 if(req[name].length === 0)
    //                     resolve();
    //
    //                 for(let id of req[name]) {
    //                     object.findById(id, (err, data) => {
    //                         if(err) {
    //                             logger.error(err);
    //                             reject('Internal error');
    //                         }
    //                         if(!data) {
    //                             logger.warn('id of ' + name + ' : ' + id + " does not exist")
    //                         }
    //
    //                         data[updateArray] = data[updateArray].filter(elID => !elID.equals(updateID));
    //
    //                         data.save().then(() => {
    //                             if(id.equals(req[name][req[name].length -1])) {
    //                                 resolve();
    //                             }
    //
    //                         }).catch((err) => {logger.error(err); return res.status(500).json({message: 'Save failed'})});
    //                     });
    //                 }
    //             }
    //             else
    //                 resolve();
    //         });
    //
    //         removePromise.then(() => {
    //             if(req.body[name] instanceof Array) {
    //
    //                 if(req.body[name].length === 0 && lastProperty === name)
    //                         return res.status(200).json({success: 'Updated'});
    //
    //                 for (let id of req.body[name]) {
    //
    //                     object.findById(id, (err, data) => {
    //                         if(err) {
    //                             logger.error(err);
    //                             res.status(500).json({message: 'Internal error'});
    //                         }
    //                         if(!data) {
    //                             logger.warn('id of ' + name + ' : ' + id + " does not exist")
    //                         }
    //                         data[updateArray].push(updateID);
    //                         data.save().then(() => {
    //                             if (id.equals(req.body[name][req.body[name].length - 1]) && lastProperty === name)
    //                                 res.status(200).json({success: 'Updated'});
    //                         }).catch((err) => {logger.error(err); return res.status(500).json({message: 'Save failed'})});
    //                     });
    //                 }
    //             }
    //             else if(lastProperty === name)
    //                 res.status(200).json({success: 'Updated'});
    //         }).catch((err) => res.status(500).json({message: err}));
    //     }
    // }

    changeNamesToIds(req, res, next) {

        let propertiesMap = new Map();
        let lastProperty = null;
        let nextError = false;

        req.body.languages = ['French'];
        req.body.software = ['Photoshop'];

        if(req.body.categories && req.body.categories.length > 0) {
            propertiesMap.set('categories', Category);
            lastProperty = 'categories';
        }
        if(req.body.languages && req.body.languages.length > 0) {
            propertiesMap.set('languages', Language);
            lastProperty = 'languages';
        }
        if(req.body.software && req.body.software.length > 0) {
            propertiesMap.set('software', Software);
            lastProperty = 'software';
        }
        if(req.body.specs && req.body.specs.length > 0) {
            propertiesMap.set('specs', Spec);
            lastProperty = 'specs';
        }
        if(req.body.certifications && req.body.certifications.length > 0) {
            propertiesMap.set('certifications', Certification);
            lastProperty = 'certifications';
        }
        if(lastProperty === null)
            next();

        for(let [name, object] of propertiesMap) {


            let idPromise = new Promise((resolve, reject) => {
                let ids = new Array();
                for(let n of req.body[name]) {

                        object.findOne({name: n}, (err, data) => {

                            if(err) {

                                logger.error(err);
                                return reject(err);
                            }
                            if(!data)
                                return reject('We do not support that');
                            ids.push(data._id);
                            if(ids.length === req.body[name].length)
                                resolve(ids);


                        });
                }
            });

            idPromise
                .then((ids) => {
                    req.body[name] = ids;
                    if(name === lastProperty && !nextError)
                        next();

                })
                .catch((err) => {
                    console.log(err);
                    nextError = true;
                    logger.error(err);
                    return res.status(409).json({message: err});
                });
        }
    }

}
function contains(table, value) {
    for(let tVal of table) {
        if(tVal == value)
            return true;
    }
    return false;
}
module.exports = new SkillsService();