const rmq_config = require('../configs/rmq.json');
let rmq = require('amqplib');
const transcation = require('../models/transaction_model');
const broadcaster = require('./broadcaster');

/** connect to rabbit**/
connect = async() => {
    try {
        let connection = await rmq.connect(rmq_config.broker_uri);
        await consume(connection);
    }catch (er){
        console.log(err);
    }
};


/** consume to incoming msg**/
consume = async (connection) => {
    try {
        let ch = await connection.createChannel();
        await ch.assertExchange(rmq_config.exchange_name, 'topic', {durable : true});
        let q = await ch.assertQueue(rmq_config.service_queue_name, {durable : true});
        await ch.prefetch(1);
        await ch.bindQueue(q.queue, rmq_config.exchange_name, rmq_config.service_route);
        ch.consume(q.queue, async(msg) => {
            console.log("=================================================");
            console.log("Incoming msg : "+msg.content.toString());
            /** update Security location**/
            if(msg.fields.routingKey === rmq_config.route_insert){
                let query = JSON.parse(msg.content.toString());
                console.log("-------------------------------------------------");
                console.log('insert transaction');
                console.log("-------------------------------------------------");
                transcation.insertTransaction(query);
                let returnMessage = {success: true, message: "Transaksi berhasil direkam", code: "000"};
                ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(JSON.stringify(returnMessage)),
                    {correlationId: msg.properties.correlationId});
                ch.ack(msg);
            }
            if(msg.fields.routingKey === rmq_config.route_laporan){
                let query = JSON.parse(msg.content.toString());
                console.log("-------------------------------------------------");
                console.log('retrieve transaction data');
                console.log("-------------------------------------------------");
                var transactions = await transcation.transactionRecap(query);
                console.log(transactions);
                let returnMessage;
                //validMsg = commonMessage.phone_not_valid;
                if (transactions.length <= 0) {
                    returnMessage = {
                        success: false,
                        code: "000",
                        message: "data rekap transaksi tidak ditemukan"
                    };
                } else {
                    returnMessage = {
                        success: true,
                        code: "000",
                        message: "data transaksi berhasil dikembalikan",
                        transactionRecap: transactions
                    };
                }

                ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(JSON.stringify(returnMessage)),
                    {correlationId: msg.properties.correlationId});
                ch.ack(msg);
            }
        });
        console.log("Service consume on : "+rmq_config.service_route);
    }catch(err) {
        console.log(err);
    }
};


module.exports = {
    connect:connect
};