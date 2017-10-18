const fs = require('fs');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const transactionModel = require('../models/transaction_model');
const commonMessage = require('../configs/common_messages.json');
const UPLOAD_PATH = './uploads';

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

let upload = multer({storage: storage})

router.post('/file/:i', upload.single('photo'), async (req, res) => {
    if (req.file) {
        console.dir(req.file);
        res.status(200).send({success: true, message: "File berhasil diupload", code: "000", item: req.params.i});
    } else {
        res.status(200).send(commonMessage.body_body_empty);
    }
});

router.post('/add', async (req, res) => {
    let query = {};
    console.log("lewat sini");
    query['idPengguna'] = req['body']['idPengguna'];
    query['tanggal'] = req['body']['tanggal'];
    query['flag'] = req['body']['flag'];
    query['nama'] = req['body']['nama'];
    query['harga'] = req['body']['harga'];

    if (query['idPengguna'] === undefined || query['tanggal'] === undefined
        || query['flag'] === undefined || query['nama'] === undefined
        || query['harga'] === undefined) {
        res.status(200).send(commonMessage.body_body_empty);
    }

    try {
        await transactionModel.insertTransaction(query);
        res.status(200).send({success: true, message: "Transaksi berhasil direkam", code: "000"});
    } catch (err) {
        console.log(err);
        res.status(200).send(commonMessage.service_not_responding);
    }

});
router.post('/add/multiple', async (req, res) => {
    let query = req.body;
    console.log(query);
    if (query.arrayItem === undefined) res.status(200).send(commonMessage.body_body_empty);
    else {
        let items = JSON.parse(query.arrayItem);

        try {
            if (items.length > 0) {
                for (let item of items) {
                    await transactionModel.insertTransaction(item);
                }
                res.status(200).send({success: true, message: "List Item Berhasil Ditambahkan", code: "000"});
            } else {
                res.status(200).send({success: true, message: "List Item Tidak Ditemukan", code: "000"});
            }
        } catch (err) {
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }


});
router.post('/recap', async (req, res) => {

    let idPengguna = req['body']['idPengguna'];
    let tanggal = req['body']['tanggal'];

    if (idPengguna === undefined || tanggal === undefined)
        res.status(200).send(commonMessage.body_body_empty);
    else {

        try {

            let transactions;
            let validMsg;
            let query = {}

            query['idPengguna'] = req['body']['idPengguna'];
            query['tanggal'] = req['body']['tanggal'];

            transactions = await transactionModel.transactionRecap(query);
            //validMsg = commonMessage.phone_not_valid;

            if (transactions.length <= 0) {
                res.status(200).send({success: true, code: "000", message: "data rekap transaksi tidak ditemukan"});

            } else {

                //profile = profile[0];
                //res.status(200).send({success: true, code: "000", message: "berhasil memuat permintaan", profile: profile});
                res.status(200).send({
                    success: true,
                    code: "000",
                    message: "data transaksi berhasil dikembalikan",
                    transactionRecap: transactions
                });

            }
        } catch (err) {
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }
    }
});

router.get('/images/:filename', async (req, res) => {
    try {

        res.setHeader('Content-Type', 'image/jpeg');
        console.log(req.params.filename);
        fs.readFile(UPLOAD_PATH + '/' + req.params.filename, function (err, data) {
            console.log(req.params.filename);
            if (err) {
                console.log(req.params.filename);
                throw err;
            }
            ; // Fail if the file can't be read.
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data); // Send the file data to the browser.

        })
    } catch (err) {
        res.sendStatus(400);
    }
});

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};


module.exports = router;
