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
    let availableBalance = 0;
    funds.outputs.forEach(output => {
        availableBalance += output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = 0;
    // Render the Homescreen /views/home
    res.render("home", {
        title: config.owner + "'s Lightning Node",
        ...info,
        connectToNode,
        availableBalance,
        transactions
    });
});

router.get('/receive', async (req, res) => {
    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = 0;
    funds.outputs.forEach(output => {
        availableBalance += output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = 0;
    res.render("receive", {
        title: config.owner + "'s Lightning Node ⚡️",
        availableBalance,
        bolt11: -1,
        message: -1
    });
});

router.post('/receive', async (req, res) => {
    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = 0;
    funds.outputs.forEach(output => {
        availableBalance += output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = 0;

    let { amount, desc } = req.body;
    let message = -1;
    let bolt11 = -1;

    if (amount < 1000 || amount >= 400000000)
        message = "Amount must be greater than 1000 msat and less than 400000000 msat";
    else if (!amount || amount == null)
        message = "Amount is required!";
    else {
        if (desc == null) desc = ''
        let uniqueLabel = utils.getUniqueLabel()
        let invoice = await _lightning.invoice(amount, uniqueLabel, desc);
        bolt11 = invoice.bolt11;
    }

    res.render("receive", {
        title: config.owner + "'s Lightning Node ⚡️",
        availableBalance,
        bolt11,
        message
    });
});

router.get('/send', async (req, res) => {
    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = 0;
    funds.outputs.forEach(output => {
        availableBalance += output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = 0;
    res.render("send", {
        title: config.owner + "'s Lightning Node ⚡️",
        availableBalance,
        error: -1
    });
});

router.post('/decode', async (req, res) => {
    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = 0;
    funds.outputs.forEach(output => {
        availableBalance += output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = 0;

    let invoiceToPay = req.body.bolt11;
    if (invoiceToPay) {
        _lightning.decodepay(invoiceToPay)
            .then(decoded => {
                let error = 0;
                if (decoded.currency != 'tb') error = 'Please paste a valid testnet lightning payment request!';
                if (decoded.msatoshi > availableBalance) error = 'Not enough funds to pay invoice amount ' + decoded.amount_msat;
                console.log(error)
                res.render("send", {
                    title: config.owner + "'s Lightning Node ⚡️",
                    availableBalance,
                    ...decoded,
                    invoiceToPay,
                    error
                });
            })
            .catch(error => {
                res.render("send", {
                    title: config.owner + "'s Lightning Node ⚡️",
                    availableBalance,
                    error: 'Please paste a valid testnet lightning payment request!'
                });
            });
    }
});

router.post('/pay', async (req, res) => {
    // Get Node Balance 
    let funds = await _lightning.listfunds();
    let availableBalance = 0;
    funds.outputs.forEach(output => {
        availableBalance += output.value;
    });
    if (availableBalance < 0 || availableBalance == null)
        availableBalance = 0;

    let invoiceToPay = req.body.bolt11;
    if (invoiceToPay) {
        _lightning.pay(invoiceToPay)
            .then(paid => {
                let error = 0;
                console.log(paid);
                if (decoded.currency != 'tb') error = 'Please paste a valid testnet lightning payment request!';
                if (decoded.amount_msat > availableBalance) error = 'Not enough funds!';
                console.log(error)
                res.render("home", {
                    title: config.owner + "'s Lightning Node ⚡️",
                    availableBalance,
                    error
                });
            })
            .catch(error => {
                res.render("home", {
                    title: config.owner + "'s Lightning Node ⚡️",
                    availableBalance,
                    error: 'Please paste a valid testnet lightning payment request!'
                });
            });
    }
});

module.exports = router;