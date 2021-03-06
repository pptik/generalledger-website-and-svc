const express = require('express');
const router = express.Router();
const userModel = require('../models/user_model');
const commonMessage = require('../configs/common_messages.json');
const validator = require('../utilities/string_validator');
const md5 = require('md5');
const cors = require('cors');

router.post('/deleteauth', async (req, res) => {
    let query = req.body;
    if (query.password_admin === undefined || query.id_user === undefined) {
        req.flash('pesan', "Silahkan Lengkapi Data");
        res.redirect('/');
    }
    else {
        try {
            let checkadmin = await userModel.checkIfAdmin(req.session._id);
            if (checkadmin) {
                let passwordFromDb = checkadmin.password;
                if (passwordFromDb !== undefined) {
                    if (md5(query.password_admin) == passwordFromDb) {
                        await userModel.deleteUserFromDocument(query.id_user);
                        req.flash('pesan', "Berhasil Menghapus data");
                        res.redirect('/');
                    } else {
                        req.flash('pesan', "Password Salah");
                        res.redirect('/');
                    }
                } else {
                    req.flash('pesan', "Akun Belum Aktif");
                    res.redirect('/');
                }
            } else {
                req.flash('pesan', "Gagal Meghapus Data!");
                res.redirect('/');
            }

        } catch (err) {
            req.flash('pesan', "Gagal Meghapus Data");
            res.redirect('/');
        }
    }
});

router.post('/updatedetail', async (req, res) => {
    let id = req.body.id_user;
    let nama = req.body.nama;
    let alamatKios = req.body.alamat_kios;
    let jenisKelamin = req.body.jenis_kelamin;

    if (id === undefined || nama === undefined || alamatKios === undefined || jenisKelamin === undefined) {
        res.status(200).send(commonMessage.body_body_empty);
    }

    try {
        await userModel.updateUserDetail(req.body);
        req.flash('pesan', "Berhasil Mengubah Data");
        res.redirect('/');

        console.log(req.body);
    } catch (err) {
        req.flash('pesan', "Gagal Mengubah Data");
        res.redirect('/');
        console.log(err);
    }
});

router.post('/updatepassword', async (req, res) => {
    let idUser = req.body.id_user;
    let new_password = req.body.new_password;
    let confirm_new_password = req.body.confirm_new_password;
    let old_password = req.body.old_password;

    if (idUser === undefined || new_password === undefined || password === undefined || confirm_new_password === undefined || old_password === undefined) {
        res.status(200).send(commonMessage.body_body_empty);
    }

    try {
        if (new_password === confirm_new_password) {
            res.status(200).send({
                "success": false,
                "message": "Password masih sama",
                "code": "500"
            });
        } else {
            await userModel.updateUserPassword(req.body);
            res.status(200).send({
                "success": true,
                "message": "Password telah diganti!",
                "code": "000"
            })
        }
    } catch (err) {
        console.log(err);
        res.status(200).send(commonMessage.service_not_responding);
    }
});

router.post('/login', async (req, res) => {
    //let entity = req['body']['entity'];
    let noHp = req['body']['noHp'];
    let password = req['body']['password'];

    if (noHp === undefined || password === undefined)
        res.status(200).send(commonMessage.body_body_empty);
    else {
        try {

            let profile;
            let validMsg;

            profile = await userModel.findPhoneNumber(noHp);
            validMsg = commonMessage.phone_not_valid;

            if (profile.length <= 0) {
                res.status(200).send(validMsg);
            } else {
                profile = profile[0];
                if (profile.password === md5(password)) {
                    res.status(200).send({
                        success: true,
                        code: "000",
                        message: "berhasil memuat permintaan",
                        profile: profile
                    });
                } else res.status(200).send(validMsg);

            }
        } catch (err) {
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});

router.post('/login/web', async (req, res) => {
    //let entity = req['body']['entity'];
    let noHp = req['body']['noHp'];
    let password = req['body']['password'];
    let sess = req.session;
    if (noHp === undefined || password === undefined) {
        req.flash('pesan', "Silahkan Isi Username dan Password");
        res.render('login', {title: 'General Ledger'});
    } else {
        try {
            let profile;
            let validMsg;
            profile = await userModel.findPhoneNumber(noHp);
            validMsg = commonMessage.phone_not_valid;
            if (profile.length <= 0) {
                req.flash('pesan', "Nomor Handphone Tidak Valid");
                res.render('login', {title: 'General Ledger'});
            } else {
                profile = profile[0];
                if (profile.password === md5(password)) {
                    sess._id = profile._id;
                    sess.nama = profile.nama;
                    sess.noHp = profile.noHp;
                    sess.alamatKios = profile.alamatKios;
                    sess.role = profile.role;
                    req.flash('pesan', "Berhasil Login");
                    res.redirect('/');
                } else {
                    req.flash('pesan', "Nomor Handphone atau Password tidak cocok");
                    res.render('login', {title: 'Absensi'});
                }
            }
        } catch (err) {
            console.log(err);
            req.flash('pesan', "Gagal Login");
            res.render('login', {title: 'Absensi'});
        }
    }
});

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
router.get('/logout/action', async (req, res) => {
    let sess = req.session;
    delete sess._id;
    res.render('login', {title: 'Absensi'});
});
router.post('/register', async (req, res) => {
    let query = {};
    query['noHp'] = req['body']['noHp'];
    query['password'] = req['body']['password'];
    query['nama'] = req['body']['nama'];
    query['jenisKelamin'] = req['body']['jenisKelamin'];
    query['alamatKios'] = req['body']['alamatKios'];

    if (query['noHp'] === undefined || query['password'] === undefined
        || query['nama'] === undefined || query['jenisKelamin'] === undefined
        || query['alamatKios'] === undefined)
        res.status(200).send(commonMessage.body_body_empty);

    try {
        findPhone = await userModel.findPhoneNumber(query['noHp']);
        validMsg = commonMessage.phone_already;
        if (findPhone.length > 0) res.status(200).send(validMsg);//No Hp sudah terdaftar
        else {
            await userModel.insertUser(query);
            res.status(200).send({success: true, message: "Berhasil membuat akun", code: "000"});
        }
    } catch (err) {
        console.log(err);
        res.status(200).send(commonMessage.service_not_responding);
    }

});
router.get('/get/list', async (req, res) => {
    try {
        let listUser = await userModel.getListUser();
        res.status(200).send({success: true, message: "Berhasil membuat akun", code: "000", listuser: listUser});
    } catch (err) {
        console.log(err);
        res.status(200).send(commonMessage.service_not_responding);
    }

});
router.post('/register-security', async (req, res) => {
    let query = {};
    let entity = req['body']['entity'];
    query['password'] = req['body']['password'];
    query['name'] = req['body']['name'];
    query['idSecurity'] = req['body']['idSecurity'];

    if (entity === undefined || query['password'] === undefined || query['name'] === undefined)
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
            if (findemail.length > 0 || findPhone.length > 0) res.status(200).send(validMsg);
            else {
                let findIdSecurity = await userModel.findUserName(query['idSecurity']);
                if (findIdSecurity.length > 0) res.status(200).send(commonMessage.plat_already);
                else {
                    await userModel.insertUserSecurity(query);
                    res.status(200).send({success: true, message: "Berhasil membuat akun", code: "000"});
                }
            }
        } catch (err) {
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});
router.post('/status', async (req, res) => {
    let query = req.body;
    if (query['session_id'] === undefined) {
        res.status(200).send(commonMessage.body_body_empty);
    } else {
        try {
            let profile = await userModel.checkSession(query['session_id']);
            if (profile === null) res.status(200).send(commonMessage.session_invalid);
            else {
                res.status(200).send({success: true, code: '0000', message: "Sesion Anda valid"});
            }
        } catch (err) {
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});
module.exports = router;
