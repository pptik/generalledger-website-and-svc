const express = require('express');
const router = express.Router();
const userModel = require('../models/user_model');
const commonMessage = require('../configs/common_messages.json');
const validator = require('../utilities/string_validator');
const md5 = require('md5');
const cors = require('cors');


router.post('/login', async(req, res) => {
    //let entity = req['body']['entity'];
    let noHp = req['body']['noHp'];
    let password = req['body']['password'];

    if(noHp === undefined || password === undefined)
        res.status(200).send(commonMessage.body_body_empty);
    else {
        /*let isEmail = validator.validateEmail(entity);
        let isNumber = validator.validatePhone(entity);*/
        try {

            let profile;
            let validMsg;

            profile = await userModel.findPhoneNumber(noHp);
            validMsg = commonMessage.phone_not_valid;

            if(profile.length <= 0){
                res.status(200).send(validMsg);
            }else {

                profile = profile[0];
                //res.status(200).send({success: true, code: "000", message: "berhasil memuat permintaan", profile: profile});

                if(profile.password === md5(password)){
                    res.status(200).send({success: true, code: "000", message: "berhasil memuat permintaan", profile: profile});
                }else res.status(200).send(validMsg);

            }
        }catch (err){
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});
router.post('/login/web', async(req, res) => {
    //let entity = req['body']['entity'];
    let noHp = req['body']['noHp'];
    let password = req['body']['password'];
    let sess=req.session;
    if(noHp === undefined || password === undefined){
        req.flash('pesan', "Silahkan Isi Username dan Password");
        res.render('login', { title: 'General Ledger' });
    } else {

        try {

            let profile;
            let validMsg;

            profile = await userModel.findPhoneNumber(noHp);
            validMsg = commonMessage.phone_not_valid;

            if(profile.length <= 0){
                req.flash('pesan', "Nomor Handphone Tidak Valid");
                res.render('login', { title: 'General Ledger' });
            }else {

                profile = profile[0];
                //res.status(200).send({success: true, code: "000", message: "berhasil memuat permintaan", profile: profile});

                if(profile.password === md5(password)){
                    sess._id=profile._id;
                    sess.nama=profile.nama;
                    sess.noHp=profile.noHp;
                    sess.alamatKios=profile.alamatKios;
                    req.flash('pesan', "Berhasil Login");
                    res.redirect('/');
                }else res.status(200).send(validMsg);

            }
        }catch (err){
            console.log(err);
            req.flash('pesan', "Gagal Login");
            res.render('login', { title: 'Absensi' });
        }
    }
});

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


router.get('/logout/action', async(req, res) => {
    let sess=req.session;
    delete sess._id;
    res.render('login', { title: 'Absensi' });
});
router.post('/register', async(req, res) => {
    let query = {};
    let entity = req['body']['entity'];//???

    query['noHp'] = req['body']['noHp'];
    query['password'] = req['body']['password'];
    query['nama'] = req['body']['nama'];
    query['jenisKelamin'] = req['body']['jenisKelamin'];
    query['alamatKios'] = req['body']['alamatKios'];

    if(query['noHp'] === undefined || query['password'] === undefined
        || query['nama'] === undefined || query['jenisKelamin'] === undefined
        || query['alamatKios'] === undefined)
        res.status(200).send(commonMessage.body_body_empty);

    try {
        /*let findPhone = [], findemail = [], validMsg;
        if (validator.validatePhone(entity)) {
            query['phonenumber'] = entity;
            query['email'] = 'N/A';
            findPhone = await userModel.findPhoneNumber(query['phonenumber']);
            validMsg = commonMessage.phone_already;
        } else if (validator.validateEmail(entity)) {
            query['phonenumber'] = 'N/A';
            query['email'] = entity;
            findemail = await userModel.findEmail(query['email']);
            validMsg = commonMessage.email_already;
        }*/

        findPhone = await userModel.findPhoneNumber(query['noHp']);
        validMsg = commonMessage.phone_already;
        if(findPhone.length > 0) res.status(200).send(validMsg);//No Hp sudah terdaftar
        else {

                await userModel.insertUser(query);
                res.status(200).send({success: true, message: "Berhasil membuat akun", code: "000"});

        }
    }catch (err) {
        console.log(err);
        res.status(200).send(commonMessage.service_not_responding);
    }

});

router.post('/register-security', async(req, res) => {
    let query = {};
    let entity = req['body']['entity'];
    query['password'] = req['body']['password'];
    query['name'] = req['body']['name'];
    query['idSecurity'] = req['body']['idSecurity'];

    if(entity === undefined || query['password'] === undefined || query['name'] === undefined )
        res.status(200).send(commonMessage.body_body_empty);
    else {
        try {
            let findPhone = [], findemail = [], validMsg;
            if (validator.validatePhone(entity)) {
                query['phonenumber'] = entity;
                query['email'] = 'N/A';
                findPhone = await userModel.findPhoneNumber(query['phonenumber']);
                validMsg = commonMessage.phone_already;
            } else if (validator.validateEmail(entity)) {
                query['phonenumber'] = 'N/A';
                query['email'] = entity;
                findemail = await userModel.findEmail(query['email']);
                validMsg = commonMessage.email_already;
            }
            if(findemail.length > 0 || findPhone.length > 0) res.status(200).send(validMsg);
            else {
                let findIdSecurity = await userModel.findUserName(query['idSecurity']);
                if(findIdSecurity.length > 0) res.status(200).send(commonMessage.plat_already);
                else {
                    await userModel.insertUserSecurity(query);
                    res.status(200).send({success: true, message: "Berhasil membuat akun", code: "000"});
                }
            }
        }catch (err) {
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});


router.post('/status', async(req, res) => {
    let query = req.body;
    if(query['session_id'] === undefined){
        res.status(200).send(commonMessage.body_body_empty);
    }else {
        try{
            let profile = await userModel.checkSession(query['session_id']);
            if(profile === null) res.status(200).send(commonMessage.session_invalid);
            else {
                res.status(200).send({success: true, code: '0000', message: "Sesion Anda valid"});
            }
        }catch (err){
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});



module.exports = router;
