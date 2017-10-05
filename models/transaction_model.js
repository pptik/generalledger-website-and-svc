const app = require('../app');
const multer = require('multer');
const moment = require('moment');
//ambil tanggal hari ini
let tanggalHariIni = 'transaksi_' + moment().format('l')
let database = app.db;
let transactionCollection = database.collection(tanggalHariIni);
let sessionCollection = database.collection('tb_session');
const autoIncrement = require("mongodb-autoincrement");
const md5 = require('md5');
const converter = require('../utilities/converter');


/** insert transaction **/
insertTransaction = (query) => {
    return new Promise((resolve, reject) => {

        var idPengguna = query.idPengguna;
        var tanggal = query.tanggal;
        var flag = query.flag;
        var nama = query.nama;
        var harga = query.harga;
        var file = query.file;

        console.log('tujuan coll:' + tanggalHariIni)
        autoIncrement.getNextSequence(database, tanggalHariIni, 'ID', (err, autoIndex) => {
            if (err) reject(err);
            else {

                let transactionQuery = {
                    "idPengguna": idPengguna,
                    "tanggal": tanggal,
                    "flag": flag,
                    "nama": nama,
                    "harga": harga
                };
                transactionCollection.insertOne(transactionQuery, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
};

/** transaction recap **/
transactionRecap = (query) => {
    return new Promise((resolve, reject) => {

        let idPengguna = query.idPengguna;
        let tanggal = query.tanggal;

        let transactionCollectionRecap = database.collection('transaksi_' + tanggal);
        console.log('rekap transaksi col:' + 'transaksi_' + tanggal)
        transactionCollectionRecap.find({idPengguna: idPengguna}).toArray((err, results) => {
            if (err) reject(err);
            else resolve(results);
        });

    });
};

module.exports = {
    insertTransaction: insertTransaction,
    transactionRecap: transactionRecap
};