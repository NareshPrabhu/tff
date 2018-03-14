const authService = require('../../../services/authService'),
    skillsService = require('../../../services/skillsService'),
    askService = require('../../../services/askService'),
    bidService = require('../../../services/bidService'),
    employerService = require('../../../services/employerService');

class Manage {
    constructor(router) {
       router.post('/all',
           authService.authenticateUser.bind(this),
           skillsService.changeNamesToIds.bind(this),
           askService.getAllLimit.bind(this));

       router.get('/:id',
           authService.authenticateUser.bind(this),
           askService.getOne.bind(this));


       router.post('/create',
           authService.authenticateUser.bind(this),
           skillsService.changeNamesToIds.bind(this),
           employerService.createAsk.bind(this),
           askService.create.bind(this),
           skillsService.update.bind(this));

       router.post('/update/:id',
           authService.authenticateUser.bind(this),
           skillsService.changeNamesToIds.bind(this),
           employerService.getId.bind(this),
           askService.update.bind(this),
           skillsService.update.bind(this));

       router.delete('/delete/:id',
           authService.authenticateUser.bind(this),
           skillsService.changeNamesToIds.bind(this),
           employerService.deleteAsk.bind(this),
           askService.remove.bind(this),
           bidService.removeBids.bind(this),
           skillsService.update.bind(this));
    }
}

module.exports = Manage;