require('dotenv').config()

const Discord = require('discord.io');

const logger = require('winston');
//var jsonQuery = require('json-query');

const axios = require('axios');


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';


// Initialize Discord Bot
var bot = new Discord.Client({
    token: process.env.TOKEN,
    autorun: true
});


bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it needs to execute a command
    // for this script it will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var txid = args[1];

        args = args.splice(1);

        //axios.defaults.baseURL = "http://explorer.freedom-coin.io/api";

        function axiosGet(path, params) {
            axios.get(path, {
                params: params
            })
                .then(function (response) {
                    bot.sendMessage({ to: channelID, message: "The difficulty is:" + response.data });
                    // console.log(response);
                })
                .catch(function (error) {
                    // console.log(error);
                    bot.sendMessage({ to: channelID, message: "The request was not found!" });
                })
                .then(function () {
                    return;
                });
        }

        switch (cmd) {
            case 'help':
                return bot.sendMessage({
                    to: channelID,
                    message: 'Available commands: btc, tx'
                })

            case 'btc':

                axios.get('https://api.coindesk.com/v1/bpi/currentprice/zar.json')
                    .then(response => {
                        var usd = response.data.bpi.USD.rate_float;
                        return bot.sendMessage({ to: channelID, message: "The BTC exchange rate is: $" + usd });
                    });
                axios.get('https://api.mybitx.com/api/1/ticker?pair=XBTZAR')
                    .then(response => {
                        var zar = response.data.last_trade;
                        return bot.sendMessage({ to: channelID, message: "The ZAR exchange rate is: R" + zar });
                    });
                break;

            case 'tx':

                axios.get(`https://chain.api.btc.com/v3/tx/${txid}`)
                    .then(response => {
                        let confirmations = response.data.data.confirmations
                        return bot.sendMessage({ to: channelID, message: "The transaction has: " + confirmations + " confirmations." });
                    });
                break;

            case 'difficulty':
                axios.get('https://blockchain.info/q/getdifficulty')
                    .then(response => {
                        return bot.sendMessage({ to: channelID, message: "The difficulty is: " + response.data });
                    });
                break;


            default:
                return bot.sendMessage({ to: channelID, message: 'Unknown command.' });
        }
    }
})
