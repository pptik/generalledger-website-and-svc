const express = require('express');
const router = express.Router();
const moment = require('moment');
router.get('/', (req, res) => {
    let Session=req.session;
    console.log(Session);
    if(Session._id!==undefined){
        res.render('authenticated/dashboard-user', {Session:Session,moment:moment, title: 'General Ledger' });
    }else{
        res.render('index', { title: 'General Ledger' });
    }
});
router.get('/login', (req, res) => {
    let Session=req.session;
    console.log(Session);
    if(Session._id!==undefined){
        res.render('authenticated/dashboard-user', {Session:Session, Moment:moment, title: 'General Ledger' });
    }else{
        res.render('login', { title: 'General Ledger' });
    }
});

module.exports = router;
