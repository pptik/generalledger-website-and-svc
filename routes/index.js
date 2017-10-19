const express = require('express');
const router = express.Router();
const moment = require('moment');
router.get('/', (req, res) => {
    let Session=req.session;
    console.log(Session);
    if(Session._id!==undefined){
        switch (Session.role){
            case 0:
                res.render('authenticated-admin/dashboard-admin', {Session:Session,moment:moment, title: 'General Ledger' });
                break;
            case 1:
                res.render('authenticated/dashboard-user', {Session:Session,moment:moment, title: 'General Ledger' });
                break;
        }
    }else{
        res.render('index', { title: 'General Ledger' });
    }
});
router.get('/login', (req, res) => {
    let Session=req.session;
    console.log(Session);
    if(Session._id!==undefined){
        switch (Session.role){
            case 0:
                res.render('authenticated-admin/dashboard-admin', {Session:Session,moment:moment, title: 'General Ledger' });
                break;
            case 1:
                res.render('authenticated/dashboard-user', {Session:Session,moment:moment, title: 'General Ledger' });
                break;
        }
    }else{
        res.render('login', { title: 'General Ledger' });
    }
});
router.post('/detail-transaksi', (req, res) => {
    let Session=req.session;
    if(Session._id!==undefined){
        let query=req.body;
        switch (Session.role){
            case 0:
                console.log(query);
                res.render('authenticated-admin/detail-transaksi', {Session:Session,detailuser:query, title: 'General Ledger' });
                break;
            case 1:
                res.render('authenticated/dashboard-user', {Session:Session,moment:moment, title: 'General Ledger' });
                break;
        }
    }else{
        res.render('login', { title: 'General Ledger' });
    }
});
module.exports = router;