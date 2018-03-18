const mongoose = require('mongoose'),
    Employee = require('../models/employee'),
    logger = require('../config/logger'),
    Bid = require('../models/bid');

class BidService {

    create(req, res) {
        let bidBody = req.body;

        Bid.create(bidBody, (err) => {
            if(err) {
                logger.error(err);
                return res.status(500).json({message: 'Saving error'});
            }
            return res.status(200).json({success: 'Bid created'});
        });
    }

    removeBids(req, res, next) {
        let askId = req.askID;

        Bid.find({ask: askId}, (err, data) => {
            if(err) {
                logger.error(err);
                return res.status(500).json({message: 'Error while looking for bids'});
            }
            if(!data) {
                next();
            }

            data.forEach(object => {
                object.remove(err => {
                    if(err) {
                        logger.error(err);
                        return res.status(500).json({message: 'Cannot remove bid'});
                    }
                    if(object._id.equals(data[data.length - 1]._id))
                        next();
                });
            });
        });
    }

    accept(req, res) {
        let bidId = req.params.id;

        Bid.findByIdAndUpdate(bidId, {is_accepted: true}, (err, data) => {
            if(err) {
                logger.error(err);
                return res.status(500).json({message: 'Cannot remove bid'});
            }
            if(!data)
                return res.status(404).json({message: 'Bid with that id not found'});

            return res.status(200).json({success: 'Bid updated'});
        })
    }


    populateBids(req, res) {
        let bids = res.locals.ask.bids;

        let bidsPromise = new Promise((resolve, reject) => {
            let populdatedBids = [];

            for(let bidId of bids) {

                Bid.findById(bidId)
                    .populate('employee', '_id user_id')
                    .exec((err, data) => {
                    if(err) {
                        logger.error(err);
                        return reject({status: 500, msg: 'Error while looking for bid'})
                    }
                    if(!data)
                        return reject({status: 404, msg: 'Bid not found'});

                    populdatedBids.push(data);

                    if(data._id.equals(bids[bids.length - 1]))
                        resolve(populdatedBids);
                });

            }
        });
        bidsPromise
            .then((popBids) => {
                delete res.locals.ask._doc.bids;

                let data = {
                    ask: res.locals.ask,
                    bids: popBids
                };

                res.status(200).json(data);
            })
            .catch((err) => {return res.status(err.status || 500).json({message: err.msg})});
    }

}

module.exports = new BidService();