const mongoose = require('mongoose'),
    logger = require('../config/logger'),
    Ask = require('../models/ask');

class AskService {

    create(req, res) {
        let askBody = req.body;

        Ask.create(askBody, (err) => {
            if(err) {
                logger.error(err);
                return res.status(500).json({message: 'Failed creating ask'});
            }

            return res.status(200).json({message: 'Created'});
        });


    }

    update(req, res) {
        let updateBody = req.body;
        let askID = req.params.id;


        Ask.findByIdAndUpdate(askID, updateBody, (err, data) => {
            if(!data)
                return res.status(404).json({message: 'Wrong ask id'});
            if(err)
                return res.status(500).json({message: 'Internal error'});

            return res.status(200).json({message: 'Updated'});
        });
    }

    remove(req, res) {
        let askID = req.params.id;

        Ask.findByIdAndRemove(askID, (err, data) => {

                if(err) {
                    logger.error(err);
                    return res.status(500).json({message: 'Internal error'});
                }
                if(!data)
                    return res.status(404).json({message: 'Ask not found'});

                return res.status(200).json({message: 'Removed'});


        });
    }

    //BID IS NOT POPULATED

    getAllLimit(req, res) {

        let pageSize = req.query.pagesize || 10;
        let offset = req.query.page * pageSize || 0;


        let askQuery = Ask.find();
        let countQuery = Ask.find();

        console.log("LOCALS: ");
        console.log(res.locals);
        console.log("END OF LOCALS: ")

        if(res.locals.languages) {
            askQuery
                .where('languages').all(res.locals.languages);
            countQuery
                .where('languages').all(res.locals.languages);
        }
        if(res.locals.categories) {
            askQuery
                .where('categories').all(res.locals.categories);
            countQuery
                .where('categories').all(res.locals.categories);
        }
        if(res.locals.software) {
            askQuery
                .where('software').all(res.locals.software);
            countQuery
                .where('software').all(res.locals.software);
        }
        if(res.locals.specs) {
            askQuery
                .where('specs').all(res.locals.specs);
            countQuery
                .where('specs').all(res.locals.specs);
        }
        if(res.locals.certifications) {
            askQuery
                .where('certifications').all(res.locals.certifications);
            countQuery
                .where('certifications').all(res.locals.certifications);
        }

        countQuery.count().exec((err, amount) => {
            if(err) {
                logger.error(err);
                return res.status(500).json({message: 'Internal error'});
            }
            if(!amount)
                return res.status(404).json({message: 'Asks not found, try changing filters'});

            askQuery
                .skip(offset)
                .limit(pageSize)
                .populate('employer')
                .populate('languages', 'name -_id')
                .populate('software', 'name -_id')
                .populate('specs', 'name -_id')
                .populate('certifications', 'name -_id')
                .populate('categories', 'name -_id');

            askQuery.exec((err, data) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).json({message: 'Internal error'});
                }

                let responseData = {
                   count: amount,
                   asks: data
                };
                res.status(200).json(responseData);
            })
        });

    }

    getOne(req, res) {
        let askId = req.params.id;

        Ask.findById(askId)
            .populate('employer')
            .populate('languages', 'name -_id')
            .populate('software', 'name -_id')
            .populate('specs', 'name -_id')
            .populate('certifications', 'name -_id')
            .populate('categories', 'name -_id')
            .exec((err, data) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).json({message: 'Internal error'});
                }

                if(!data)
                    return res.status(404).json({message: 'Ask not found'});

                res.status(200).json(data);
            });
    }

    addBid(req, res, next) {
        let bidId = req.body._id;
        let askId = req.params.id;

        Ask.findById(askId, (err, data) => {
            if(err) {
                logger.error(err);
                return res.status(500).json({message: 'Internal error'});
            }

            if(!data)
                return res.status(404).json({message: 'Ask not found'});

            req.body.ask = data._id;
            data.bids.push(bidId);

            data.save((err) => {
                if(err) {
                    logger.error(err);
                    return res.status(500).json({message: 'Failed saving ask'});
                }
                next();
            });
        })
    }

    getAllOfEmployer(req, res) {
        let employerId = req.employerID || req.params.id;

        Ask.find({employer: employerId})
            .populate('languages', 'name -_id')
            .populate('software', 'name -_id')
            .populate('specs', 'name -_id')
            .populate('certifications', 'name -_id')
            .populate('categories', 'name -_id')
            .exec((err, data) => {
            if(err) {
                logger.error(err);
                return res.status(500).json({message: 'Internal error'});
            }

            if(!data)
                return res.status(404).json({message: 'This user does not have any asks'});

            res.status(200).json(data);
        });
    }

}

module.exports = new AskService();
