const app = require('../app');
const multer = require('multer');
const moment = require('moment');
//ambil tanggal hari ini
let tanggalHariIni = 'transaksi_' + moment().format('l')
let database = app.db;
let sessionCollection = database.collection('tb_session');
const autoIncrement = require("mongodb-autoincrement");
const md5 = require('md5');
const converter = require('../utilities/converter');


/** insert transaction **/
insertTransaction = (query) => {
    return new Promise((resolve, reject) => {
        let timeserver = moment().format("DD/MM/YYYY HH:mm:ss");
        console.log(timeserver);
        let idPengguna = query.idPengguna;
        let tanggal = query.tanggal;
        let flag = query.flag;
        let nama = query.nama;
        let harga = query.harga;
        let file = query.file;
        let temptanggalharini = 'transaksi_' + tanggal;
        let transactionCollection = database.collection(temptanggalharini);
        console.log('tujuan coll:' + temptanggalharini);
        autoIncrement.getNextSequence(database, temptanggalharini, 'ID', (err, autoIndex) => {
            if (err) reject(err);
            else {

                let transactionQuery = {
                    "idPengguna": idPengguna,
                    "tanggal": tanggal,
                    "flag": flag,
                    "nama": nama,
                    "harga": harga,
                    "server_time" : timeserver
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