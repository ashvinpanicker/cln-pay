var utils = require('../utils');
var express = require("express");
var router = express.Router();
var lightning = require("lightning-client");
var config = require("../config");
var lightningPath = config.lightningPath;
var _lightning = new lightning(lightningPath, true);

router.get("/", async (req, res) => {
    // Lightning Node Info
    let info = await _lightning.getinfo();
    let connectToNode = info.id + '@' + info.address[0].address + ':' + info.address[0].port;

    // All Received and Paid money on the lightning network
    let { invoices } = await _lightning.listinvoices();
    let { payments } = await _lightning.listpayments();
    let transactions = [];

    if (invoices)
        invoices.map(invoice => {
            if (invoice.status == "paid") {
                transactions.push({
                    time: utils.timeConverter(invoice.paid_at),
                    type: 'received',
                    amount: invoice.amount_received_msat,
                    desc: invoice.description
                });
            }
        });

    if (payments)
        payments.map(payment => {
            if (payment.status == "paid") {
                transactions.push({
                    time: utils.timeConverter(payment.paid_at),
                    type: 'sent',
                    amount: payment.amount_sent_msat,
                    desc: payment.description
                });
            }
        });

    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = funds.outputs.forEach(output => {
        availableFunds = availableFunds + output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = '0 msat';
    else
        availableBalance = availableBalance * 1000 + ' msat';
    // Render the Homescreen /views/home
    res.render("home", {
        title: config.owner + "'s Lightning Node",
        ...info,
        connectToNode,
        availableBalance,
        transactions
    });
});

router.get('/send', async (req, res) => {
    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = funds.outputs.forEach(output => {
        availableFunds = availableFunds + output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = '0 msat';
    res.render("send", {
        title: config.owner + "'s Lightning Node ⚡️",
        availableBalance
    });
});

router.get('/receive', async (req, res) => {
    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = funds.outputs.forEach(output => {
        availableFunds = availableFunds + output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = '0 msat';
    res.render("receive", {
        title: config.owner + "'s Lightning Node ⚡️",
        availableBalance
    });
});

module.exports = router;