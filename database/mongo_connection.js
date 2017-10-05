const config = require('../configs/database.json');
const client = require('mongodb').MongoClient();

/** function to connect to mongodb **/
function connect() {
    return new Promise((resolve, reject) => {
        client.connect(config.mongodb_uri, (err, database) => {
        if(err) {console.log("Connected to mongodb server failed"); reject(err);}
        else {console.log("Connected to mongodb server"); resolve(database);}
        });
    });
}

/** function untuk membuat collection per hari **/
/*function createTransactionCollection(collectionName) {

    return new Promise((resolve, reject) => {

        client.connect(config.mongodb_uri, (err, db) => {

            if (err) {console.log("Gagal membuat tabel transaksi per hari"); reject(err);}
            db.createCollection(collectionName, function(err, res) {
                if (err) {console.log("Gagal membuat tabel transaksi per hari"); reject(err);}
                console.log("Tabel transaksi per hari berhasil dibuat");
                db.close();
            });

        });

    });

}*/

/** function untuk mencek apakah collection transaksi hari sudah ada,
 * bila sudah ada tidak lagi dibuat collection transaksi hari ini **/

function checkTransactionCollection(collectionName) {

    return new Promise((resolve, reject) => {

        client.connect(config.mongodb_uri, (err, db) => {

            if (err) {console.log("Terjadi kesalahan"); reject(err);}

            db.listCollections({name: collectionName})
                .next(function(err, collinfo) {
                    if (err) {console.log("Gagal membuat tabel transaksi per hari"); reject(err);}
                    if (collinfo) {//Collection sudah ada maka tidak ditambahkan collection transaksi

                    }else{

                        db.createCollection(collectionName, function(err) {
                            if (err) {console.log("Gagal membuat tabel transaksi per hari"); reject(err);}
                            console.log("Tabel transaksi per hari berhasil dibuat");
                            db.close();
                        });

                    }
            });

        });

    });

}

module.exports = {
    connect:connect,
    checkTransactionCollection:checkTransactionCollection
};