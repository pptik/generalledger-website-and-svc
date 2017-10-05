let userModel = require('../models/user_model');
let commonMessage = require('../configs/common_messages.json');

updateUserLocation = (query) => {
    return new Promise(async(resolve, reject) => {
        if(parseInt(query['tipe'])==0){
            let sessionID = query['session_id'];
            let latitude = query['latitude'];
            let longitude = query['longitude'];
            let time = query['time'];
            let tipe = query['tipe'];
            if(sessionID === undefined || latitude === undefined
                || longitude === undefined || time === undefined||tipe===undefined){
                resolve(commonMessage.body_body_empty);
            }else {
                try{
                    let userID = await userModel.checkSession(sessionID);
                    if(userID === null)resolve(commonMessage.session_invalid);
                    else {
                        query['ID'] = userID;
                        userModel.updateUserLocation(query).then(result => {
                            resolve(result);
                        }).catch(err => {
                            reject(err);
                        });
                    }
                }catch (err){
                    reject(err);
                }
            }
        }else {
            let macID = query['mac_id'];
            let latitude = query['latitude'];
            let longitude = query['longitude'];
            let time = query['time'];
            let tipe = query['tipe'];
            if(macID === undefined || latitude === undefined
                || longitude === undefined || time === undefined||tipe===undefined){
                resolve(commonMessage.body_body_empty);
            }else {
                try{
                    let userID = await userModel.checkSession(sessionID);
                    if(userID === null)resolve(commonMessage.session_invalid);
                    else {
                        query['ID'] = userID;
                        userModel.updateUserLocation(query).then(result => {
                            resolve(result);
                        }).catch(err => {
                            reject(err);
                        });
                    }
                }catch (err){
                    reject(err);
                }
            }
        }

    });
};




module.exports = {
    updateUserLocation:updateUserLocation
};