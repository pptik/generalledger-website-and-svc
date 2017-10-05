const express = require('express');
const router = express.Router();
const md5 = require('md5');
const cors = require('cors');
const panicButtonModel = require('../models/panic_button_model');
const commonMessage = require('../configs/common_messages.json');


router.post('/insert', async(req, res) => {
    console.log(req.body);
    let UserID=req.body.UserID;
    let Nama=req.body.Nama;
    let Latitude=req.body.Latitude;
    let Longitude=req.body.Longitude;
    if(UserID===undefined||Nama===undefined||Latitude===undefined||Longitude===undefined){
        res.status(200).send(commonMessage.body_body_empty);
    }else {
        try {
            let findPanicByIDUser=await panicButtonModel.findByIdUser(UserID);
            if(findPanicByIDUser[0]){
                await panicButtonModel.updatePanicButton(req.body);
                await panicButtonModel.insertPanicButtonHistory(req.body);
                res.status(200).send({success: true, code: "000", message: "berhasil menyimpan data"});
            }else {
                await panicButtonModel.insertPanicButton(req.body);
                await panicButtonModel.insertPanicButtonHistory(req.body);
                res.status(200).send({success: true, code: "000", message: "berhasil menyimpan data"});
            }
        }catch (err){
            console.log(err);
            res.status(200).send(commonMessage.service_not_responding);
        }

    }
});
module.exports = router;