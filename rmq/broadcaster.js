const userModel = require('../models/user_model');
const panicButtonModel = require('../models/panic_button_model');
const configs = require('../configs/rmq.json');

/** broadcast lokasi Security **/
broadcastSecurity = async(connection) => {
    try {
        let ch = await connection.createChannel();
        await ch.assertExchange(configs.exchange_name, 'topic', {durable: true});
        let q = await ch.assertQueue(configs.broadcast_queue_name, {exclusive: true, messageTtl: 1000});
        await ch.bindQueue(q.queue, configs.exchange_name, configs.broadcast_queue_name);
        console.log("starting broadcast via "+configs.broadcast_route);
        setInterval(async function () {
            let test = {test : "test"}.toString();
            let dataSecurity = await userModel.getSecurityLocation();
            let dataPanicButton=await panicButtonModel.findAllPanicButton();
            let msg = {Security : dataSecurity,panicButton:dataPanicButton};
            msg = JSON.stringify(msg);
            await ch.publish(configs.exchange_name, configs.broadcast_route, new Buffer(msg));
        }, 1500);
    }catch (err){
        console.log(err);
    }
};


module.exports = {
    broadcastSecurity:broadcastSecurity
};