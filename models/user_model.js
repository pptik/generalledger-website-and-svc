const app = require('../app');
const moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
let database = app.db;
let userCollection = database.collection('pengguna');
let sessionCollection = database.collection('tb_session');
const autoIncrement = require("mongodb-autoincrement");
const md5 = require('md5');
const converter = require('../utilities/converter');

/** find registered email **/
getListUser = () => {
    return new Promise((resolve, reject) => {
        userCollection.find({role: 1}).toArray((err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

updateUserPassword = (body) => {
    return new Promise((resolve, reject) => {
        userCollection.updateOne({_id: body.id_user}, {$set: {password: md5(body.new_password)}},
            (err, result) => {
                if (err)
                    reject(err);
                else {
                    resolve(result);
                }
            });
    });
}


updateUserDetail = (body) => {
    return new Promise((resolve, reject) => {
        userCollection.updateOne({'_id': ObjectID(body.id_user)},
            {
                $set: {
                    'nama' : body.nama,
                    'alamatKios' : body.alamat_kios,
                    'jenisKelamin' : body.jenis_kelamin,
                }
            },
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(result);
                    resolve(result);
                }
            });
    });
}

findEmail = (email) => {
    return new Promise((resolve, reject) => {
        userCollection.find({Email: email}).toArray((err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

/** find registered number **/
findPhoneNumber = (phoneNumber) => {
    return new Promise((resolve, reject) => {
        userCollection.find({noHp: phoneNumber}).toArray((err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};


/** find registered platnomor **/
findPlatNomor = (platnomor) => {
    return new Promise((resolve, reject) => {
        userCollection.find({PhoneNumber: platnomor}).toArray((err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

/** find registered username **/
findUserName = (username) => {
    return new Promise((resolve, reject) => {
        userCollection.find({username: username}).toArray((err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};


/** initial session **/
initSession = (userID) => {
    return new Promise((resolve, reject) => {
        sessionCollection.find({"UserID": userID, "EndTime": "0000-00-00 00:00:00"})
            .toArray((err, results) => {
                if (err) reject(err);
                else {
                    if (results[0]) {
                        sessionCollection.updateOne({ID: results[0].ID}, {$set: {EndTime: moment().format('YYYY-MM-DD HH:mm:ss')}},
                            (err, result) => {
                                if (err) reject(err);
                                else {
                                    let _query = {
                                        UserID: userID, ID: md5(userID + "-" + moment().format('YYYYMMDDHHmmss')),
                                        StartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        LastTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        EndTime: "0000-00-00 00:00:00"
                                    };
                                    sessionCollection.insertOne(_query, (err, result) => {
                                        if (err) reject(err);
                                        else resolve(result);
                                    });
                                }
                            });
                    } else {
                        let _query = {
                            UserID: userID, ID: md5(userID + "-" + moment().format('YYYYMMDDHHmmss')),
                            StartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                            LastTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                            EndTime: "0000-00-00 00:00:00"
                        };
                        sessionCollection.insertOne(_query, (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    }
                }
            });
    });
};


/** get session **/
getSession = (userID) => {
    return new Promise((resolve, reject) => {
        sessionCollection.find({"UserID": userID, "EndTime": "0000-00-00 00:00:00"})
            .toArray((err, results) => {
                if (err) reject(err);
                else resolve(results[0].ID);
            });
    });
};


updateUserLocation = (query) => {
    return new Promise((resolve, reject) => {
        userCollection.updateOne({ID: query['ID']}, {
            $set: {
                'Security.location.coordinates': [query['longitude'], query['latitude']],
                'Security.LastUpdate': new Date(query['time']),
                'Security.tipe': parseInt(query.tipe)
            }
        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

updateDeviceLocation = (query) => {
    return new Promise((resolve, reject) => {
        userCollection.updateOne({'Security.mac_id': query.mac_id}, {
            $set: {
                'Security.location.coordinates': [query['longitude'], query['latitude']],
                'Security.LastUpdate': new Date(query['time']),
                'Security.tipe': parseInt(query.tipe)
            }
        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


/** check session **/
checkSession = (sessid) => {
    return new Promise((resolve, reject) => {
        sessionCollection.find({ID: sessid, "EndTime": "0000-00-00 00:00:00"})
            .toArray((err, results) => {
                if (err) reject(err);
                else if (results[0]) resolve(results[0].UserID);
                else resolve(null);
            });
    });
};

/** get Security location**/
getSecurityLocation = () => {
    return new Promise((resolve, reject) => {
        userCollection.find(
            {
                $and: [
                    {ID_role: 202},
                    {Security: {$exists: true}},
                    {"Security.location.coordinates": {$ne: [0, 0]}}
                ]
            }
        ).toArray((err, results) => {
            if (err) reject(err);
            else {
                for (let i = 0; i < results.length; i++) {
                    results[i]['Security']['LastUpdate'] = converter.convertISODateToString(results[i]['Security']['LastUpdate']);
                }
                resolve(results);
            }
        });
    });
};
/** check complete session **/
checkCompleteSession = (sessid) => {
    return new Promise((resolve, reject) => {
        sessionCollection.find({ID: sessid, "EndTime": "0000-00-00 00:00:00"})
            .toArray((err, results) => {
                if (err) reject(err);
                else if (results[0]) {
                    userCollection.find({ID: results[0].UserID})
                        .toArray((err, ress) => {
                            if (err) reject(err);
                            else resolve(
                                {
                                    UserID: results[0].UserID,
                                    Name: ress[0].Name,
                                    Email: ress[0].Email,
                                    username: ress[0].username
                                });
                        });
                } else resolve(null);
            });
    });
};


/** change online status **/
changeOnlineStatus = (status, userID) => {
    return new Promise((resolve, reject) => {
        userCollection.updateOne({ID: userID}, {$set: {Status_online: status}}, (err, items) => {
            console.log(items);
            if (err) reject(err);
            else resolve(items);
        });
    });
};


/** get profile by id **/
getProfileById = (iduser) => {
    return new Promise((resolve, reject) => {
        let _id = parseInt(iduser);
        userCollection.find({ID: _id})
            .toArray((err, results) => {
                if (err) reject(err);
                else if (results[0]) {
                    let data = results[0];
                    delete data['Password'];
                    delete data['_id'];
                    delete data['flag'];
                    delete data['foto'];
                    delete data['PushID'];
                    delete data['Path_foto'];
                    delete data['Nama_foto'];
                    delete data['Path_ktp'];
                    delete data['Nama_ktp'];
                    delete data['facebookID'];
                    //    delete data['ID_role'];
                    delete data['ID_ktp'];
                    delete data['Plat_motor'];
                    delete data['VerifiedNumber'];
                    delete data['Barcode'];
                    delete data['Status_online'];
                    resolve(data);
                } else resolve(null);
            });
    });
};


/** insert user**/
insertUser = (query) => {
    return new Promise((resolve, reject) => {
        var noHp = query.noHp;
        var password = query.password;
        var nama = query.nama;
        var alamatKios = query.alamatKios;
        var jenisKelamin = query.jenisKelamin;
        console.log('No Hp diluar else:' + query.noHp)

        autoIncrement.getNextSequence(database, 'pengguna', 'ID', (err, autoIndex) => {
            if (err) reject(err);
            else {
                console.log('No Hp didalam else:' + query.noHp)
                let userQuery = {
                    "nama": nama,
                    "noHp": noHp,
                    "password": md5(password),
                    "alamatKios": alamatKios,
                    "jenisKelamin": jenisKelamin,
                    "role": 1,
                    "joinDate": moment().format('YYYY-MM-DD HH:mm:ss')
                };
                userCollection.insertOne(userQuery, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
};


insertUserSecurity = (query) => {
    return new Promise((resolve, reject) => {
        let email = query['email'];
        let phonenumber = query['phonenumber'];
        let gender = 3;
        let birthday = 'N/A';
        let password = query['password'];
        let name = query['name'];
        let username = query['idSecurity'].toUpperCase();
        let idSecurity = query['idSecurity'].toUpperCase();
        autoIncrement.getNextSequence(database, 'tb_user', 'ID', (err, autoIndex) => {
            if (err) reject(err);
            else {
                let userQuery = {
                    "ID": autoIndex,
                    "Name": name,
                    "username": username,
                    "Email": email,
                    "CountryCode": 62,
                    "PhoneNumber": phonenumber,
                    "Gender": gender,
                    "Birthday": birthday,
                    "Password": md5(password),
                    "Joindate": moment().format('YYYY-MM-DD HH:mm:ss'),
                    "Poin": 100,
                    "PoinLevel": 100,
                    "AvatarID": gender,
                    "facebookID": null,
                    "Verified": 0,
                    "VerifiedNumber": null,
                    "Visibility": 0,
                    "Reputation": 0,
                    "flag": 1,
                    "Barcode": "",
                    "deposit": 0,
                    "ID_role": 202,
                    "Plat_motor": null,
                    "ID_ktp": null,
                    "foto": null,
                    "PushID": "no id",
                    "Status_online": null,
                    "Path_foto": null,
                    "Nama_foto": null,
                    "Path_ktp": null,
                    "Nama_ktp": null,
                    "Security": {
                        "LastUpdate": new Date(),
                        "idSecurity": idSecurity,
                        "tipe": 0,
                        "location": {
                            "type": "Point",
                            "coordinates": [0, 0]
                        }
                    }

                };
                userCollection.insertOne(userQuery, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
};
insertDeviceSecurity = (query) => {
    return new Promise((resolve, reject) => {
        let email = "N/A";
        let phonenumber = "N/A";
        let gender = 3;
        let birthday = 'N/A';
        let password = "N/A";
        let name = "N/A";
        let username = "N/A";
        let idSecurity = "N/A";
        let MacID = query.mac_id;
        autoIncrement.getNextSequence(database, 'tb_user', 'ID', (err, autoIndex) => {
            if (err) reject(err);
            else {
                let userQuery = {
                    "ID": autoIndex,
                    "Name": name,
                    "username": username,
                    "Email": email,
                    "CountryCode": 62,
                    "PhoneNumber": phonenumber,
                    "Gender": gender,
                    "Birthday": birthday,
                    "Password": md5(password),
                    "Joindate": moment().format('YYYY-MM-DD HH:mm:ss'),
                    "Poin": 100,
                    "PoinLevel": 100,
                    "AvatarID": gender,
                    "facebookID": null,
                    "Verified": 0,
                    "VerifiedNumber": null,
                    "Visibility": 0,
                    "Reputation": 0,
                    "flag": 1,
                    "Barcode": "",
                    "deposit": 0,
                    "ID_role": 202,
                    "Plat_motor": null,
                    "ID_ktp": null,
                    "foto": null,
                    "PushID": "no id",
                    "Status_online": null,
                    "Path_foto": null,
                    "Nama_foto": null,
                    "Path_ktp": null,
                    "Nama_ktp": null,
                    "Security": {
                        "LastUpdate": new Date(),
                        "mac_id": MacID,
                        "tipe": 0,
                        "location": {
                            "type": "Point",
                            "coordinates": [0, 0]
                        }
                    }

                };
                userCollection.insertOne(userQuery, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
};


module.exports = {
    findEmail: findEmail,
    findPhoneNumber: findPhoneNumber,
    findUserName: findUserName,
    checkSession: checkSession,
    insertUser: insertUser,
    insertUserSecurity: insertUserSecurity,
    updateUserLocation: updateUserLocation,
    updateUserPassword: updateUserPassword,
    updateUserDetail: updateUserDetail,
    getSecurityLocation: getSecurityLocation,
    getListUser: getListUser
};