var utils = require('../utils');
var express = require("express");
var router = express.Router();
var lightning = require("lightning-client");
var config = require("../config");
var lightningPath = config.lightningPath;
var _lightning = new lightning(lightningPath, true);

router.get("/", async (req, res, next) => {
    let info = await _lightning.getinfo();
    let connectToNode = info.id + '@' + info.address[0].address + ':' + info.address[0].port;

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

    await res.render("index", {
        title: "Ashvin's Lightning Node ⚡️",
        availableBalance: 0,
        connectToNode,
        ...info,
        transactions
    });
});

module.exports = router;